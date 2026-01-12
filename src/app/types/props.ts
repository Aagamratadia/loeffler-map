/**
 * Component Props Type Definitions
 * Type-safe interfaces for all component props throughout the assessment interface
 */

import { PatientAssessment, BPGrade, BPGradeResult } from "./assessment";

/**
 * Props for DrugInteractionsTool component
 * Used when user indicates they're taking other medications
 */
export interface DrugInteractionsToolProps {
  prefilledAge?: number | "";
  prefilledSbp?: number | "";
  prefilledDbp?: number | "";
  onResultsUpdate?: (results: any) => void;
  isDisabled?: boolean; // Disable inputs if data is pre-filled
}

/**
 * Props for TreatmentPlansTool component
 * Auto-populated when minimum vitals are available
 */
export interface TreatmentPlansToolProps {
  prefilledAge?: string;
  prefilledSbp?: string;
  prefilledDbp?: string;
  prefilledBpGrade?: BPGradeResult | null;
  onResultsUpdate?: (results: any) => void;
  isDisabled?: boolean;
}

/**
 * Props for DrugDosingTool component
 * Auto-populated with dosing calculations based on patient data
 */
export interface DrugDosingToolProps {
  prefilledAge?: string;
  prefilledSbp?: string;
  prefilledDbp?: string;
  prefilledKidneyStatus?: "normal" | "mild" | "moderate" | "severe";
  onResultsUpdate?: (results: any) => void;
  isDisabled?: boolean;
}

/**
 * Props for DrugClassesTool component
 * Displays available drug classes based on BP Grade
 */
export interface DrugClassesToolProps {
  prefilledAge?: string;
  prefilledSbp?: string;
  prefilledDbp?: string;
  onResultsUpdate?: (results: any) => void;
  isDisabled?: boolean;
}

/**
 * Props for PregnancySafetyTool component
 * Provides pregnancy-specific medication safety recommendations
 */
export interface PregnancySafetyToolProps {
  onResultsUpdate?: (results: any) => void;
  isDisabled?: boolean;
}

/**
 * Props for PatientDetailsForm component
 * Section 1: Demographics and vital signs input
 */
export interface PatientDetailsFormProps {
  data: PatientAssessment;
  onUpdate: (field: keyof PatientAssessment, value: any) => void;
  onBPUpdate: (field: "sbp" | "dbp", value: number | "") => void;
  bpGrade?: BPGradeResult | null;
}

/**
 * Props for ClinicalProfileForm component
 * Section 2: Comorbidity selection
 */
export interface ClinicalProfileFormProps {
  comorbidities: PatientAssessment["comorbidities"];
  onUpdate: (comorbidities: PatientAssessment["comorbidities"]) => void;
}

/**
 * Props for PregnancySection component
 * Section 3: Pregnancy assessment with conditional tool rendering
 */
export interface PregnancySectionProps {
  isPregnant: PatientAssessment["isPregnant"];
  onUpdate: (value: PatientAssessment["isPregnant"]) => void;
  patientAge?: number | "";
}

/**
 * Props for DrugInteractionSection component
 * Section 4: Drug interaction assessment with conditional tool rendering
 */
export interface DrugInteractionSectionProps {
  takingOtherDrugs: PatientAssessment["takingOtherDrugs"];
  onUpdate: (value: PatientAssessment["takingOtherDrugs"]) => void;
  age?: number | "";
  sbp?: number | "";
  dbp?: number | "";
  mlReady?: boolean;
}

/**
 * Props for ClinicalProtocolsSection component
 * Section 5: Auto-generated clinical protocols (Treatment, Dosing, Classes)
 * Only renders when minimum vitals are available (mlReady = true)
 */
export interface ClinicalProtocolsSectionProps {
  bpGrade: BPGradeResult | null;
  age?: number | "";
  sbp?: number | "";
  dbp?: number | "";
  comorbidities: PatientAssessment["comorbidities"];
  isPregnant?: string;
}
