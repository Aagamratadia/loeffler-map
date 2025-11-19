// Treatment Plans Data
export const treatmentPlansData = {
  "SBP 120–139 mmHg and/or DBP 70–89 mmHg": {
    "Low Risk (CVD risk <10%)": {
      severity: "Elevated BP (High-Normal)",
      initiation_criteria: "Lifestyle-only stage",
      strategy: "Lifestyle modifications (salt restriction, exercise, weight reduction)",
      therapy: "None",
      target_bp: "<120/70 mmHg",
      notes: "Drug therapy not indicated."
    },
    "Sufficiently High Risk (CVD, DM, CKD, HMOD, etc.)": {
      severity: "Elevated BP (High-Normal)",
      initiation_criteria: "If ≥130/80 mmHg after 3 months of lifestyle measures",
      strategy: "Lifestyle + consider pharmacotherapy",
      therapy: "ACEi/ARB, CCB, or Diuretic depending on comorbidity",
      target_bp: "120–129/70–79 mmHg",
      notes: "Start drugs if lifestyle changes fail or not implemented."
    },
    "Borderline High Risk (CVD risk 5–10%)": {
      severity: "Elevated BP (High-Normal)",
      initiation_criteria: "Based on additional risk modifiers",
      strategy: "Lifestyle therapy ± pharmacotherapy",
      therapy: "ACEi/ARB, CCB, or Diuretic",
      target_bp: "120–129/70–79 mmHg",
      notes: "Use CAC score, arterial stiffness, or biomarkers to up-classify."
    }
  },
  "SBP 140–159 mmHg and/or DBP 90–99 mmHg": {
    "General (All patients)": {
      severity: "Grade 1 HTN",
      initiation_criteria: "Confirmed elevated BP",
      strategy: "Lifestyle + pharmacological therapy",
      therapy: "Dual SPC: RAS blocker (ACEi/ARB) + CCB or Diuretic",
      target_bp: "120–129/70–79 mmHg",
      notes: "Prefer single-pill combination."
    },
    "Low-risk exception (Indian STG)": {
      severity: "Grade 1 HTN",
      initiation_criteria: "Uncomplicated (no DM, CVD, organ damage)",
      strategy: "1–3 month trial of lifestyle alone",
      therapy: "If persists: Monotherapy (CCB, low-dose thiazide, or ACEi)",
      target_bp: "<130/80 mmHg (if tolerated)",
      notes: "Indian STG permits trial of lifestyle before drug."
    },
    "High risk (DM, CVD, CKD, organ damage)": {
      severity: "Grade 1 HTN",
      initiation_criteria: "Immediate",
      strategy: "Lifestyle + pharmacological therapy",
      therapy: "Dual SPC",
      target_bp: "120–129/70–79 mmHg",
      notes: "Always treat; Indian STG allows 1–2 drugs initially."
    }
  },
  "SBP ≥160 mmHg and/or DBP ≥100 mmHg": {
    "High Risk": {
      severity: "Grade 2 HTN",
      initiation_criteria: "Immediate",
      strategy: "Lifestyle + pharmacological therapy",
      therapy: "Dual SPC: RAS blocker (ACEi/ARB) + CCB or Diuretic",
      target_bp: "120–129/70–79 mmHg",
      notes: "Always treat; Indian STG allows 1–2 drugs initially."
    }
  },
  "SBP ≥180 mmHg and/or DBP ≥110 mmHg": {
    "All": {
      severity: "Grade 3 HTN (Severe)",
      initiation_criteria: "Immediate (confirm within 1 week)",
      strategy: "Lifestyle + pharmacological (urgent initiation)",
      therapy: "Dual SPC; may need triple therapy",
      target_bp: "120–129/70–79 mmHg",
      notes: "Start without delay unless hypertensive emergency."
    }
  },
  "≥140/90 mmHg on 3 drugs (RAS blocker + CCB + Diuretic)": {
    "High / Special case": {
      severity: "Resistant HTN",
      initiation_criteria: "After confirming adherence & excluding pseudo-resistance",
      strategy: "Specialist management",
      therapy: "+ Spironolactone if K<4.5, eGFR>45; alternatives: eplerenone, amiloride, doxazosin, clonidine, β-blocker",
      target_bp: "<130/80 mmHg",
      notes: "Consider renal denervation for true resistant HTN."
    }
  },
  "SBP >180, DBP >110 (no acute organ damage)": {
    "–": {
      severity: "Hypertensive Urgency",
      initiation_criteria: "Same-day initiation",
      strategy: "Gradual BP reduction over hours–days",
      therapy: "Oral furosemide, clonidine",
      target_bp: "Stepwise normalization",
      notes: "Avoid rapid drop. Transition to long-term therapy."
    }
  },
  "SBP >180, DBP >120 + acute organ damage": {
    "–": {
      severity: "Hypertensive Emergency",
      initiation_criteria: "Immediate",
      strategy: "Controlled BP reduction",
      therapy: "IV labetalol, nicardipine, nitroprusside, urapidil",
      target_bp: "≤25% MAP reduction in 1 hour; normalize over 24–48 hr",
      notes: "Tailor to organ involvement (e.g., nitroglycerine for ACS)."
    }
  },
  "–": {
    "General Pop <80 yr": {
      severity: "Special Targets (Subgroups)",
      initiation_criteria: "-",
      strategy: "-",
      therapy: "-",
      target_bp: "<140/90 mmHg",
      notes: "Conservative Indian STG, WHO, ISH"
    },
    "Elderly >80 yr": {
      severity: "Special Targets (Subgroups)",
      initiation_criteria: "If SBP ≥160 mmHg",
      strategy: "Treat if tolerated",
      therapy: "RAS blocker, CCB, or Diuretic",
      target_bp: "SBP 140–150 mmHg",
      notes: "Stop if SBP <130 mmHg or adverse events"
    }
  }
};

// Drug Dosing Data
export const drugDosingData = {
  "ACE inhibitor": {
    "Ramipril": { "initial_dose": "2.5 mg PO OD", "maintenance_dose": "5–10 mg/day", "notes": "Low dose post-MI" },
    "Lisinopril": { "initial_dose": "2.5–5 mg PO OD", "maintenance_dose": "20–40 mg/day", "notes": "N/A" },
    "Captopril": { "initial_dose": "6.25 mg PO TID", "maintenance_dose": "12.5–150 mg/day", "notes": "N/A" },
    "Enalapril": { "initial_dose": "2.5 mg PO BID", "maintenance_dose": "5–40 mg/day", "notes": "N/A" }
  },
  "ARB": {
    "Losartan": { "initial_dose": "50 mg PO daily", "maintenance_dose": "50–100 mg/day", "notes": "N/A" },
    "Candesartan": { "initial_dose": "8 mg PO daily", "maintenance_dose": "8–32 mg/day", "notes": "N/A" },
    "Valsartan": { "initial_dose": "80 mg PO daily", "maintenance_dose": "80–320 mg/day", "notes": "N/A" },
    "Irbesartan": { "initial_dose": "150 mg PO daily", "maintenance_dose": "150–300 mg/day", "notes": "N/A" }
  },
  "Thiazide": {
    "Hydrochlorothiazide": { "initial_dose": "12.5–25 mg PO OD", "maintenance_dose": "12.5–50 mg/day", "notes": "N/A" },
    "Chlorthalidone": { "initial_dose": "12.5–25 mg PO OD", "maintenance_dose": "25–50 mg/day", "notes": "Long half‑life" },
    "Bendroflumethiazide": { "initial_dose": "2.5 mg PO OD", "maintenance_dose": "Up to 10 mg/day", "notes": "N/A" },
    "Indapamide": { "initial_dose": "1.25 mg PO OD", "maintenance_dose": "1.25–5 mg/day", "notes": "MR 1.5 mg OD" }
  },
  "Loop diuretic": {
    "Furosemide": { "initial_dose": "20–40 mg PO BID", "maintenance_dose": "20–160 mg/day", "notes": "Higher divided dosing common" }
  },
  "Aldosterone antagonist": {
    "Spironolactone": { "initial_dose": "12.5–25 mg PO OD", "maintenance_dose": "25–100 mg/day", "notes": "Resistant HTN" },
    "Eplerenone": { "initial_dose": "25 mg PO daily", "maintenance_dose": "50–100 mg/day", "notes": "N/A" }
  },
  "CCB – DHP": {
    "Amlodipine": { "initial_dose": "2.5–5 mg PO OD", "maintenance_dose": "Up to 10 mg/day", "notes": "Peds included" },
    "Nifedipine ER": { "initial_dose": "30 mg PO OD", "maintenance_dose": "Up to 120 mg/day", "notes": "Avoid short‑acting" }
  },
  "CCB – non‑DHP": {
    "Diltiazem ER": { "initial_dose": "120 mg/day", "maintenance_dose": "120–360 mg/day", "notes": "N/A" },
    "Verapamil SR": { "initial_dose": "120–180 mg/day", "maintenance_dose": "120–360 mg/day", "notes": "N/A" }
  },
  "Beta-blocker": {
    "Bisoprolol": { "initial_dose": "2.5–5 mg PO OD", "maintenance_dose": "2.5–10 mg/day", "notes": "N/A" },
    "Carvedilol": { "initial_dose": "3.125–6.25 mg BID", "maintenance_dose": "6.25–25 mg BID", "notes": "Take with food" },
    "Nebivolol": { "initial_dose": "5 mg PO OD", "maintenance_dose": "5–40 mg/day", "notes": "N/A" }
  },
  "Alpha-blocker": {
    "Doxazosin": { "initial_dose": "1 mg PO OD", "maintenance_dose": "1–16 mg/day", "notes": "Give at bedtime (first dose)" }
  },
  "Centrally acting": {
    "Clonidine": { "initial_dose": "0.1 mg BID", "maintenance_dose": "0.1–0.8 mg/day", "notes": "Rebound HTN if stopped abruptly" },
    "Methyldopa": { "initial_dose": "250 mg BID", "maintenance_dose": "500–2000 mg/day", "notes": "Pregnancy safe" }
  },
  "Vasodilator": {
    "Hydralazine": { "initial_dose": "10 mg QID", "maintenance_dose": "Up to 200 mg/day", "notes": "Reflex tachycardia" },
    "Minoxidil": { "initial_dose": "2.5–5 mg OD", "maintenance_dose": "10–40 mg/day", "notes": "Fluid retention/hirsutism" }
  },
  "Renin inhibitor": {
    "Aliskiren": { "initial_dose": "150 mg PO OD", "maintenance_dose": "150–300 mg/day", "notes": "Avoid with ACEi/ARB" }
  }
};

// Drug Classes Data
export const drugClassesData = {
  "RAS Blockers (ACEi/ARBs)": {
    "General/Standard": {
      indication: "First-line drugs for the general nonblack population",
      contraindication: "Dual RAS Blockade: ACEi and ARB should not be combined in any scenario, including CKD, due to lack of benefit and increased risk of adverse events"
    },
    "Comorbidities (CKD)": {
      indication: "Chronic Kidney Disease (CKD) with Albuminuria: Preferred first-line therapy, reduces albuminuria/proteinuria",
      contraindication: "Bilateral Renal Artery Stenosis"
    },
    "Comorbidities (DM)": {
      indication: "Diabetes Mellitus (DM): Preferred initial therapy, especially if proteinuria/microalbuminuria is present",
      contraindication: "Renal Function Monitoring: Serum creatinine and potassium must be monitored in the first week; up to a 30% increase in serum creatinine may occur"
    },
    "Comorbidities (Heart Failure)": {
      indication: "Heart Failure (HFrEF): Effective in improving clinical outcomes",
      contraindication: "Hyperkalaemia: Possible contraindication. Risk is increased when combined with Mineralocorticoid Receptor Antagonists (MRAs)"
    },
    "Comorbidities (Post-MI)": {
      indication: "Post-Myocardial Infarction (MI): Recommended alongside beta-blockers",
      contraindication: "NSAIDs: Nonsteroidal anti-inflammatory drugs (NSAIDs) decrease the effectiveness of ACEi/ARBs"
    },
    "Comorbidities (Stroke)": {
      indication: "Previous Stroke/TIA: Considered a first-line drug",
      contraindication: "Pregnancy: Absolutely contraindicated (Class D) due to adverse fetal and neonatal outcomes. Women of childbearing potential are listed as a possible contraindication"
    },
    "ACEi vs ARB": {
      indication: "ARBs are used in place of ACE inhibitors if the patient experiences side effects like cough or angioedema",
      contraindication: "Angioedema: More common with ACE inhibitors, particularly in black patients (about 3 times more likely); ARBs may be preferred in black populations for this reason"
    }
  },
  "CCBs (DHP-CCBs, e.g., Amlodipine)": {
    "General/Standard": {
      indication: "First-line agents. Preferred due to long half-life, neutral metabolic effects on glucose and lipids, and good safety profile (Amlodipine)",
      contraindication: "Contraindicated in cardiogenic shock, unstable angina, and significant aortic stenosis"
    }
  },
  "CCBs (DHP-CCBs)": {
    "Patient Groups (Elderly)": {
      indication: "Elderly/Very Old (>80 years): A long-acting CCB is a drug of choice for initiation",
      contraindication: "Hypertensive Emergency: Oral or sublingual nifedipine is not recommended due to the risk of excessive, abrupt falls in BP leading to cerebral or cardiac ischemic complications"
    }
  },
  "CCBs (All)": {
    "Patient Groups (Black Population)": {
      indication: "African Descent/Black Population: Initial treatment should include a CCB",
      contraindication: "Non-DHP CCBs (Verapamil/Diltiazem): Must not be used in heart failure or severe left ventricular dysfunction"
    }
  }
};

// Pregnancy Safety Data
export const pregnancySafetyData = {
  "Methyldopa": {
    use_case: "Mild hypertension in pregnancy",
    bp_target: ">140/90 mmHg (office BP)",
    contraindication: "Avoid Postpartum",
    rationale: "Associated with an increased risk of postpartum depression"
  },
  "Labetalol": {
    use_case: "Mild/Moderate HTN; Particularly preferred. IV option for severe acute hypertension",
    bp_target: ">140/90 mmHg (office BP)",
    contraindication: "N/A",
    rationale: "N/A"
  },
  "Metoprolol, Bisoprolol": {
    use_case: "Mild/Moderate HTN; Considered safe options",
    bp_target: ">140/90 mmHg (office BP)",
    contraindication: "N/A",
    rationale: "N/A"
  },
  "Nifedipine (long-acting DHP-CCB)": {
    use_case: "Mild/Moderate HTN; Generally considered first choice. Preferred during breastfeeding",
    bp_target: ">140/90 mmHg (office BP)",
    contraindication: "Oral/Sublingual Nifedipine Capsules: Not Recommended",
    rationale: "Risk of excessive, abrupt falls in BP resulting in cerebral or cardiac ischemic complications"
  },
  "Nicardipine, Amlodipine (DHP-CCB)": {
    use_case: "Mild/Moderate HTN; Can be used",
    bp_target: ">140/90 mmHg (office BP)",
    contraindication: "N/A",
    rationale: "N/A"
  },
  "Labetalol, Nicardipine": {
    use_case: "Severe HTN (Emergency: SBP>160 and/or DBP>110 mmHg); Acute BP Reduction",
    bp_target: "Reduce SBP to <160 mmHg, DBP to <105 mmHg (within 150-180 minutes)",
    contraindication: "N/A",
    rationale: "N/A"
  },
  "Hydralazine": {
    use_case: "Severe hypertension; Particularly effective in pregnancy",
    bp_target: "N/A",
    contraindication: "N/A",
    rationale: "May be associated with more peri-natal adverse events than other drugs"
  },
  "Esmolol, Urapidil": {
    use_case: "Alternatives for severe acute hypertension",
    bp_target: "N/A",
    contraindication: "N/A",
    rationale: "N/A"
  },
  "Magnesium Sulfate": {
    use_case: "Eclampsia treatment/prevention; Preeclampsia with severe HTN, proteinuria, or neurological symptoms",
    bp_target: "N/A",
    contraindication: "N/A",
    rationale: "N/A"
  },
  "Nitroglycerin (IV)": {
    use_case: "Acute Pulmonary Edema (in Preeclampsia/Eclampsia)",
    bp_target: "N/A",
    contraindication: "N/A",
    rationale: "N/A"
  },
  "Dexamethasone": {
    use_case: "Correction of glucocorticoid-remediable primary aldosteronism",
    bp_target: "N/A",
    contraindication: "N/A",
    rationale: "Low doses can be safely used during pregnancy"
  },
  "RAS Blockers (ACEi, ARBs, DRI)": {
    use_case: "N/A",
    bp_target: "N/A",
    contraindication: "Absolutely Contraindicated",
    rationale: "Known adverse fetal/neonatal outcomes; risk of oligohydramnios and birth malformations (2nd/3rd trimesters)"
  },
  "Mineralocorticoid Receptor Antagonists (Spironolactone)": {
    use_case: "N/A",
    bp_target: "N/A",
    contraindication: "Contraindicated",
    rationale: "Fetal anti-androgen effects"
  },
  "Atenolol (Beta-blocker)": {
    use_case: "N/A",
    bp_target: "N/A",
    contraindication: "Avoid/Contraindicated",
    rationale: "Associated with fetal growth restriction"
  },
  "Sodium-Nitroprusside": {
    use_case: "N/A",
    bp_target: "N/A",
    contraindication: "Avoid",
    rationale: "Danger of fetal cyanide poisoning with prolonged treatment"
  },
  "Thiazide Diuretics": {
    use_case: "N/A",
    bp_target: "N/A",
    contraindication: "Avoid/Contraindicated (unless for pre-existing HTN)",
    rationale: "Potential risk of fetal-neonatal adverse events (thrombocytopenia, electrolyte imbalance)"
  },
  "Furosemide (Loop Diuretic)": {
    use_case: "Only for specific indications (e.g., severe pulmonary edema, heart failure)",
    bp_target: "N/A",
    contraindication: "Not for routine use",
    rationale: "Risk of maternal volume depletion"
  }
};

// Drug Interactions Data
export const drugInteractionsData = {
  "RAS Blockers (ACEi)": {
    "RAS Blockers (ARB)": {
      interaction_type: "Intraclass Contraindication",
      interaction_result: "Dual RAS Blockade is Contraindicated",
      detail_rationale: "Negative recommendation and not recommended in CKD or any other BP-treatment scenario. Increases the risk of hyperkalemia, end-stage renal failure, and stroke."
    }
  },
  "Beta-Blockers (BBs)": {
    "Diuretics": {
      interaction_type: "Intraclass Undesirable Combination",
      interaction_result: "Increased Diabetogenic Risk; Should be avoided",
      detail_rationale: "Can significantly increase the risk of new-onset diabetes mellitus in individuals who are already at risk (impaired glucose tolerance, obesity, metabolic syndrome)."
    },
    "Non-Dihydropyridine CCBs (e.g., verapamil, diltiazem)": {
      interaction_type: "Intraclass Contraindication",
      interaction_result: "Avoid Combination; Contraindication",
      detail_rationale: "Non-DHP CCBs have negative inotropic and anti-arrhythmic activity and should not be used in heart failure."
    }
  },
  "RAS Blockers (ACEi/ARBs)": {
    "Mineralocorticoid Receptor Antagonists (MRAs/Spironolactone)": {
      interaction_type: "Intraclass Caution/Risk",
      interaction_result: "High Risk of Hyperkalemia",
      detail_rationale: "Spironolactone significantly increases the risk of hyperkalemia when added to ACEi/ARBs. Serum electrolytes and kidney function must be monitored frequently after initiation."
    }
  },
  "Nonsteroidal Anti-inflammatory Drugs (NSAIDs, including COX-2 inhibitors)": {
    "RAAS-inhibitors, Beta-blockers, Most Antihypertensives (Except CCBs)": {
      interaction_type: "Antagonism/Drug-Induced Hypertension",
      interaction_result: "Antagonizes BP Lowering/Raises BP",
      detail_rationale: "NSAIDs can cause salt retention and interfere with the action of all antihypertensives except Calcium Channel Blockers (CCBs). Average BP increase is 3/1 mmHg. High doses should be avoided in patients with inflammatory rheumatic diseases (IRD)."
    }
  },
  "Corticosteroids / Steroids": {
    "Antihypertensive Therapy, ARR Test": {
      interaction_type: "Drug-Induced Hypertension/Test Interference",
      interaction_result: "Raises BP / Antagonizes Antihypertensive Effects",
      detail_rationale: "Steroids can cause a false positive Aldosterone-to-Renin Ratio (ARR) test."
    }
  },
  "Combined Oral Contraceptive Pills (>50 mcg estrogen)": {
    "Blood Pressure": {
      interaction_type: "Drug-Induced Hypertension",
      interaction_result: "Raises BP (average 6/3 mmHg)",
      detail_rationale: "Oral contraceptives are among the most common causes of drug-induced hypertension in young women. Progestin-only contraceptives are generally considered safe."
    }
  },
  "Selective norepinephrine and serotonin reuptake inhibitors (SNRIs)": {
    "Blood Pressure": {
      interaction_type: "Drug-Induced Hypertension",
      interaction_result: "Raises BP (average 2/1 mmHg)",
      detail_rationale: "N/A"
    }
  },
  "Tricyclic Antidepressants": {
    "Blood Pressure": {
      interaction_type: "Drug-Induced Hypertension",
      interaction_result: "Raises BP",
      detail_rationale: "Increases the odds ratio of hypertension (3.19)."
    }
  },
  "Selective serotonin reuptake inhibitors (SRIs)": {
    "CCBs and alpha1-blockers": {
      interaction_type: "Adverse Effect Caution",
      interaction_result: "Causes Orthostatic Hypotension (CCBs/alpha1-blockers should be used with care)",
      detail_rationale: "Beta-blockers (excluding metoprolol) may be used if drug-induced tachycardia (from antidepressants/antipsychotics) is present."
    }
  }
};
