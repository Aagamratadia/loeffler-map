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
