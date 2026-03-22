/**
 * Medical Calculation Utilities
 * Encapsulates medical logic for BP grading, validation, and ML readiness checks
 */

import { BPGrade, BPGradeResult, PatientAssessment } from "@/app/types/assessment";

/**
 * Calculate BP Grade based on AHA Guidelines
 * Reference: American Heart Association Blood Pressure Categories
 *
 * Normal:              <120 AND <80
 * Elevated:            120-129 AND <80
 * Stage 1 HTN:         130-139 OR 80-89
 * Stage 2 HTN:         ≥140 OR ≥90
 * Hypertensive Crisis: >180 AND/OR >120 (critical)
 *
 * @param sbp - Systolic blood pressure in mmHg
 * @param dbp - Diastolic blood pressure in mmHg
 * @returns BPGradeResult with grade, color, and description
 */
export function calculateBPGrade(
  sbp: number | "",
  dbp: number | ""
): BPGradeResult {
  // Handle empty values
  if (sbp === "" || dbp === "") {
    return {
      grade: "Normal",
      color: "green",
      description: "Enter systolic and diastolic values",
    };
  }

  const systolic = Number(sbp);
  const diastolic = Number(dbp);

  // Validate ranges
  if (systolic < 0 || diastolic < 0 || systolic > 300 || diastolic > 150) {
    return {
      grade: "Critical",
      color: "red",
      description: "Invalid blood pressure values",
    };
  }

  // Critical (Hypertensive Crisis)
  if (systolic > 180 || diastolic > 120) {
    return {
      grade: "Critical",
      color: "red",
      description: "Immediate medical attention required",
    };
  }

  // Stage 2 Hypertension
  if (systolic >= 140 || diastolic >= 90) {
    return {
      grade: "Stage 2 Hypertension",
      color: "red",
      description: "Medication recommended",
    };
  }

  // Stage 1 Hypertension
  if (
    (systolic >= 130 && systolic <= 139) ||
    (diastolic >= 80 && diastolic <= 89)
  ) {
    return {
      grade: "Stage 1 Hypertension",
      color: "orange",
      description: "Lifestyle changes recommended",
    };
  }

  // Elevated
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      grade: "Elevated",
      color: "yellow",
      description: "Healthy lifestyle modifications encouraged",
    };
  }

  // Normal
  return {
    grade: "Normal",
    color: "green",
    description: "Blood pressure is within normal range",
  };
}

/**
 * Map SBP/DBP values to the matching treatmentPlansData key
 * Used to auto-select the BP Definition in TreatmentPlansTool
 */
export function getBPDefinitionKey(sbp: number | "", dbp: number | ""): string {
  if (sbp === "" || dbp === "") return "";
  const s = Number(sbp);
  const d = Number(dbp);

  // Keys must exactly match treatmentPlansData keys in drugData.ts
  if (s > 180 && d > 120) return "SBP >180, DBP >120 + acute organ damage";
  if (s > 180 || d > 110) return "SBP \u2265180 mmHg and/or DBP \u2265110 mmHg";
  if (s >= 160 || d >= 100) return "SBP \u2265160 mmHg and/or DBP \u2265100 mmHg";
  if (s >= 140 || d >= 90)  return "SBP 140\u2013159 mmHg and/or DBP 90\u201399 mmHg";
  return "SBP 120\u2013139 mmHg and/or DBP 70\u201389 mmHg";
}

/**
 * Validate patient assessment data completeness
 * Returns an object indicating which sections are complete
 *
 * @param assessment - The patient assessment object
 * @returns Object with boolean flags for each section
 */
export function validateAssessment(assessment: PatientAssessment): {
  demographics: boolean;
  vitals: boolean;
  comorbidities: boolean;
  pregnancy: boolean;
  drugs: boolean;
} {
  return {
    demographics: !!(assessment.name && assessment.age !== ""),
    vitals: !!(assessment.sbp !== "" && assessment.dbp !== ""),
    comorbidities: true, // Comorbidities are optional
    pregnancy: assessment.isPregnant !== "",
    drugs: assessment.takingOtherDrugs !== "",
  };
}

/**
 * Check if minimum data is present for ML models to run
 * ML models require: Age, Systolic BP, Diastolic BP
 *
 * @param assessment - The patient assessment object
 * @returns true if Age, SBP, and DBP are all populated
 */
export function canRunMLModels(assessment: PatientAssessment): boolean {
  return (
    assessment.age !== "" &&
    assessment.sbp !== "" &&
    assessment.dbp !== ""
  );
}

/**
 * Get human-readable description of assessment completion
 * Useful for progress indicators and user feedback
 *
 * @param assessment - The patient assessment object
 * @returns String describing what's complete and what's needed
 */
export function getAssessmentStatus(assessment: PatientAssessment): string {
  const validation = validateAssessment(assessment);
  const completed = Object.values(validation).filter(Boolean).length;
  const total = Object.keys(validation).length;

  if (completed === 0) {
    return "Start by entering patient demographics";
  }

  if (!validation.vitals) {
    return `${completed}/${total} sections - Please enter vital signs to generate clinical protocols`;
  }

  return `${completed}/${total} sections complete`;
}
