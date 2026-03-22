Technical Specification: Unified Patient Assessment Interface
1. Overview
This document specifies the technical requirements to refactor the Loeffler Map application from a tab-based navigation model to a Single-Page Comprehensive Assessment interface. The goal is to allow clinicians to enter patient demographics and vitals once, which then dynamically drives the visibility and data population of downstream clinical tools (Pregnancy Safety, Drug Interactions).

2. Architecture & Data Flow
2.1. Concept: Lifted State
Currently, components like DrugInteractionsTool manage their own state for inputs like Age and BP. In the new architecture:

Parent Component (page.tsx): Will hold the "Truth" for patient data (Age, SBP, DBP, Pregnancy Status, Comorbidities).

Child Components: Will receive this data via props to avoid double-entry.

Conditional Rendering: Child components will only mount if specific trigger conditions (e.g., "Is Pregnant?") are met.

2.2. Data Model
The central state object in src/app/page.tsx will adhere to the following interface:

TypeScript

interface PatientAssessment {
  // Demographics (Source 2-5)
  name: string;
  aadhar?: string;
  mobile?: string;
  age: number | "";
  
  // Vitals (Source 6-8)
  sbp: number | ""; // Systolic
  dbp: number | ""; // Diastolic
  
  // Clinical Profile (Source 10-12)
  comorbidities: {
    diabetes: boolean;
    heartCondition: boolean;
    ckd: boolean; // Chronic Kidney Disease
    other: boolean;
  };

  // Triggers (Source 14, 20)
  isPregnant: "yes" | "no";
  takingOtherDrugs: "yes" | "no";
}
3. Component Specifications
3.1. Parent Container (src/app/page.tsx)
This component will replace the current tabbed interface.

Responsibility:

Render the form sections sequentially.

Calculate and display "BP Grade" dynamically.

Manage visibility of child tools.

Logic - BP Grading:

Implement a helper function calculateBPGrade(sbp, dbp) based on standard guidelines (e.g., AHA):

Normal: <120 AND <80

Elevated: 120-129 AND <80

Stage 1: 130-139 OR 80-89

Stage 2: ≥140 OR ≥90

Logic - Conditional Mounting:

If isPregnant === 'yes', render <PregnancySafetyTool />.

If takingOtherDrugs === 'yes', render <DrugInteractionsTool age={...} sbp={...} dbp={...} />.

3.2. Component Refactor: DrugInteractionsTool.tsx
This component must be modified to accept external data.

Current State: Manages age, sysBloodPressure, diaBloodPressure internally.

Required Changes:

Add Props Interface:

TypeScript

interface DrugInteractionsToolProps {
  prefilledAge?: number | "";
  prefilledSbp?: number | "";
  prefilledDbp?: number | "";
}
Effect Hook: Add a useEffect that listens for changes in these props and updates the internal state (or directly uses them for the API call), ensuring the ML model runs automatically when the parent form is filled.

UI Update: If props are provided, hide or disable the corresponding input fields inside this component to prevent confusion.

4. UI/UX Layout Structure
The page will be divided into 4 vertical cards (Sources 1-23 from PDF).

Section 1: Patient Details & Vitals
Layout: 2-column grid.

Fields: Name, Aadhar, Mobile, Age.

Vitals Sub-section:

Row with SBP and DBP inputs.

Live Feedback: A badge displaying the calculated "BP Grade" (e.g., "Stage 1 Hypertension") appearing immediately below the inputs.

Section 2: Clinical Profile
Type: Checkbox Group.

Labels: "Diabetes", "Heart Condition", "Chronic Kidney Disease", "Other".

Section 3: Pregnancy Assessment
Question: "Is the female patient pregnant?" (Radio: Yes/No).

Action:

No: Section ends.

Yes: Reveal the PregnancySafetyTool inside a nested card.

Section 4: Polypharmacy (Interactions)
Question: "Is the patient taking any other drug?" (Radio: Yes/No).

Action:

No: Section ends.

Yes: Reveal the DrugInteractionsTool.

Auto-Complete: The tool should immediately trigger its "ML Recommendations" using the Age/BP passed from Section 1, without requiring the user to type them again.

5. Implementation Roadmap
Refactor Child Component:

Modify src/components/DrugInteractionsTool.tsx to accept prefilled* props.

Create Helper:

Create src/lib/medical-calcs.ts for the BP Grading logic to keep the component clean.

Rebuild Page:

Rewrite src/app/page.tsx entirely.

Import UI components (Card, Input, Label, RadioGroup, Checkbox) from shadcn/ui.

Implement the state object and render methods.

Testing:

Verify BP Grade updates in real-time.

Verify toggling "Pregnancy" shows/hides the tool.

Verify data entered in Section 1 correctly propagates to the Interaction Tool in Section 4.