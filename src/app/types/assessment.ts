/**
 * Assessment Type Definitions
 * Central data model for patient assessment in the unified interface
 */

/**
 * Main patient assessment object
 * Represents all patient data collected across the assessment form
 */
export interface PatientAssessment {
  // Section 1: Demographics (Sources 2-5)
  name: string;
  aadhar?: string;
  mobile?: string;
  age: number | "";
  dateOfBirth?: string; // ISO format (YYYY-MM-DD)

  // Section 1: Vitals (Sources 6-8)
  sbp: number | ""; // Systolic Blood Pressure (mmHg)
  dbp: number | ""; // Diastolic Blood Pressure (mmHg)

  // Section 2: Clinical Profile (Sources 10-12)
  comorbidities: {
    diabetes: boolean;
    heartCondition: boolean;
    ckd: boolean; // Chronic Kidney Disease
    other: boolean;
  };

  // Section 3: Pregnancy Status (Source 14)
  isPregnant: "yes" | "no" | ""; // Unset initially

  // Section 4: Polypharmacy (Source 20)
  takingOtherDrugs: "yes" | "no" | "";
}

/**
 * Blood Pressure Grade Classification
 * Based on AHA Guidelines
 */
export type BPGrade =
  | "Normal"
  | "Elevated"
  | "Stage 1 Hypertension"
  | "Stage 2 Hypertension"
  | "Critical";

/**
 * Result object from BP grading calculation
 * Includes grade, visual indicator color, and clinical description
 */
export interface BPGradeResult {
  grade: BPGrade;
  color: "green" | "yellow" | "orange" | "red";
  description: string;
}

/**
 * Assessment validation result
 * Indicates which sections of the assessment are complete
 */
export interface ValidationResult {
  demographics: boolean;
  vitals: boolean;
  comorbidities: boolean;
  pregnancy: boolean;
  drugs: boolean;
}
