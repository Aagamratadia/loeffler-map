import { NextResponse } from "next/server";
import { z } from "zod";
import { getMongoClient } from "@/lib/mongodb";

const predictionSchema = z.object({
  tool: z.string().min(1),
  inputs: z.record(z.any()).default({}),
  metadata: z.record(z.any()).optional(),
});

export const dynamic = "force-dynamic";

/**
 * Rule-based antihypertensive recommendation engine.
 *
 * Replaces nearest-neighbour lookup against a too-sparse predictions.json
 * that produced the same result regardless of inputs.
 *
 * Logic is derived from:
 *  - ESC/ISH 2023 hypertension guidelines
 *  - Indian STG guidelines
 *  - JNC-8 recommendation summary
 */
function getRuleBasedRecommendation(inputs: Record<string, any>): {
  preferred_drugs: string[];
  contraindicated_drugs: string[];
  match_distance: number;
} {
  const sbp = Number(inputs.init_sbp ?? inputs.sbp ?? 120);
  const dbp = Number(inputs.init_dbp ?? inputs.dbp ?? 80);
  const age = Number(inputs.age ?? 40);
  const diabetes = Boolean(inputs.diabetes || inputs.has_diabetes);
  const ckd = Boolean(inputs.chronic_kidney_disease || inputs.ckd || inputs.kidney_disease);
  const heartFailure = Boolean(inputs.heart_failure || inputs.hf);
  const isPregnant = Boolean(inputs.is_pregnant || inputs.pregnancy_trimester);
  const isElderly = age >= 65;
  const isVeryOld = age >= 80;
  const isBlack = Boolean(inputs.is_black);

  const preferred: Set<string> = new Set();
  const contraindicated: Set<string> = new Set();

  // ─── Hypertensive Emergency / Crisis ───────────────────────────────────────
  if (sbp > 180 && dbp > 120) {
    preferred.add("IV labetalol");
    preferred.add("IV nicardipine");
    preferred.add("IV nitroprusside");
    contraindicated.add("oral monotherapy");
    return { preferred_drugs: [...preferred], contraindicated_drugs: [...contraindicated], match_distance: 0 };
  }

  // ─── Pregnancy ──────────────────────────────────────────────────────────────
  if (isPregnant) {
    preferred.add("labetalol");
    preferred.add("methyldopa");
    preferred.add("nifedipine (long-acting)");
    contraindicated.add("ACEi");
    contraindicated.add("ARB");
    contraindicated.add("spironolactone");
    contraindicated.add("atenolol");
    return { preferred_drugs: [...preferred], contraindicated_drugs: [...contraindicated], match_distance: 0 };
  }

  // ─── CKD with albuminuria ────────────────────────────────────────────────────
  if (ckd) {
    preferred.add("ACEi");   // RAS blockade first-line for CKD
    preferred.add("ARB");
    contraindicated.add("dual RAS blockade (ACEi + ARB combined)");
    if (sbp >= 140 || dbp >= 90) {
      preferred.add("CCB");
      preferred.add("thiazide");
    }
    if (sbp >= 160 || dbp >= 100) {
      preferred.add("loop diuretic"); // preferred over thiazide in severe CKD
    }
    return { preferred_drugs: [...preferred], contraindicated_drugs: [...contraindicated], match_distance: 0 };
  }

  // ─── Diabetes ───────────────────────────────────────────────────────────────
  if (diabetes) {
    preferred.add("ACEi");   // renoprotective
    preferred.add("ARB");
    if (sbp >= 140 || dbp >= 90) {
      preferred.add("CCB");
    }
    if (sbp >= 160 || dbp >= 100) {
      preferred.add("thiazide");
    }
    contraindicated.add("beta-blocker (monotherapy — masks hypoglycaemia)");
    contraindicated.add("thiazide (high-dose)");
    return { preferred_drugs: [...preferred], contraindicated_drugs: [...contraindicated], match_distance: 0 };
  }

  // ─── Heart Failure ──────────────────────────────────────────────────────────
  if (heartFailure) {
    preferred.add("ACEi");
    preferred.add("ARB");
    preferred.add("beta-blocker");
    preferred.add("spironolactone");
    contraindicated.add("non-DHP CCB (verapamil/diltiazem)");
    contraindicated.add("alpha-blocker");
    return { preferred_drugs: [...preferred], contraindicated_drugs: [...contraindicated], match_distance: 0 };
  }

  // ─── Very old / frail (≥80) ─────────────────────────────────────────────────
  if (isVeryOld) {
    // Only treat if SBP ≥160; conservative targets
    if (sbp >= 160) {
      preferred.add("long-acting CCB"); // drug of choice for very old
      preferred.add("thiazide");
      preferred.add("ARB");
      contraindicated.add("alpha-blocker (orthostatic risk)");
    } else {
      // May not need drug therapy yet
      preferred.add("lifestyle modification");
    }
    return { preferred_drugs: [...preferred], contraindicated_drugs: [...contraindicated], match_distance: 0 };
  }

  // ─── Universal contraindications (apply to all standard cases) ───────────────
  contraindicated.add("dual RAS blockade (ACEi + ARB combined)");
  contraindicated.add("beta-blocker (not first-line without specific indication)");
  contraindicated.add("alpha-blocker (not first-line)");

  // ─── General population — severity-based ────────────────────────────────────

  // Grade 3 HTN (SBP ≥180 or DBP ≥110)
  if (sbp >= 180 || dbp >= 110) {
    preferred.add("ACEi/ARB");
    preferred.add("CCB");
    preferred.add("thiazide");
    preferred.add("dual SPC required");
    if (sbp > 180 || dbp > 110) preferred.add("triple therapy if needed");
    contraindicated.add("vasodilator monotherapy (reflex tachycardia risk)");
    contraindicated.add("short-acting nifedipine capsules (abrupt BP drop risk)");
    return { preferred_drugs: [...preferred], contraindicated_drugs: [...contraindicated], match_distance: 0 };
  }

  // Grade 2 HTN (SBP 160–179 or DBP 100–109)
  if (sbp >= 160 || dbp >= 100) {
    preferred.add("ARB/ACEi");
    preferred.add("CCB");
    preferred.add("thiazide");
    if (isElderly) {
      preferred.add("long-acting CCB (preferred for elderly)");
      contraindicated.add("alpha-methyldopa (CNS side effects in elderly)");
    }
    if (isBlack) {
      preferred.add("CCB (first-line for Black patients)");
      contraindicated.add("ACEi monotherapy (less effective, higher angioedema risk)");
    }
    contraindicated.add("monotherapy (dual SPC required at this grade)");
    contraindicated.add("short-acting nifedipine capsules");
    return { preferred_drugs: [...preferred], contraindicated_drugs: [...contraindicated], match_distance: 0 };
  }

  // Grade 1 HTN (SBP 140–159 or DBP 90–99)
  if (sbp >= 140 || dbp >= 90) {
    if (isElderly) {
      preferred.add("ARB/ACEi");
      preferred.add("CCB");
      preferred.add("thiazide");
    } else if (isBlack) {
      preferred.add("CCB");
      preferred.add("thiazide");
      contraindicated.add("ACEi monotherapy (angioedema risk 3× higher in Black patients)");
    } else {
      preferred.add("ARB/ACEi");
      preferred.add("CCB");
      preferred.add("thiazide (or dual SPC)");
    }
    contraindicated.add("centrally-acting drugs (clonidine/methyldopa) as first-line");
    contraindicated.add("short-acting nifedipine capsules");
    return { preferred_drugs: [...preferred], contraindicated_drugs: [...contraindicated], match_distance: 0 };
  }

  // Elevated / High-Normal (SBP 120–139 + DBP <90)
  if (sbp >= 130) {
    preferred.add("lifestyle modification");
    preferred.add("low-sodium diet");
    preferred.add("exercise");
    contraindicated.add("pharmacotherapy (not indicated at this BP level unless high CVD risk)");
    return { preferred_drugs: [...preferred], contraindicated_drugs: [...contraindicated], match_distance: 0 };
  }

  // Normal
  preferred.add("lifestyle modification");
  return { preferred_drugs: [...preferred], contraindicated_drugs: [...contraindicated], match_distance: 0 };
}

export async function GET() {
  try {
    const client = await getMongoClient();
    const dbName = process.env.MONGODB_DB || "loeffler";
    const collection = client.db(dbName).collection("predictions");
    const predictions = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Failed to fetch predictions", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = predictionSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { tool, inputs } = parsed.data;

  if (tool === "antihypertensive-recommender" || tool === "drug-dosing") {
    const result = getRuleBasedRecommendation(inputs);
    return NextResponse.json({ ok: true, result });
  }

  return NextResponse.json({
    ok: true,
    result: { message: `Tool '${tool}' not yet implemented` },
  });
}
