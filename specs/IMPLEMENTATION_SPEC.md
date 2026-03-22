# Detailed Implementation Specification
## Loeffler Map: Unified Patient Assessment Interface Refactor

**Document Version:** 2.0 (Updated with Critical Fixes)  
**Status:** Implementation Ready  
**Last Updated:** January 2026

---

## 🔴 CRITICAL UPDATES FROM REVIEW (Version 2.0)

This specification was reviewed against your existing codebase and the following critical issues were identified and fixed:

### Issue #1: Missing 3 Existing Tools
**Problem:** Your current `page.tsx` contains 5 tools (Treatment Plans, Drug Dosing, Drug Classes, Pregnancy Safety, Drug Interactions), but the original spec only implemented 2 of them. This would have **broken production functionality**.

**Solution:** Added **Section 5: Clinical Protocols** which auto-renders Treatment Plans, Drug Dosing, and Drug Classes when patient vitals are complete. These tools now receive data via props from Section 1, eliminating duplicate data entry.

### Issue #2: API Endpoint Mismatch
**Problem:** Spec referenced `/api/predictions` but your codebase uses `/api/predictions-builtime`.

**Solution:** Updated all API references throughout the spec to use `/api/predictions-builtime`. See Section 7.1 and 7.2.

### Issue #3: Existing Tools Not Refactored
**Problem:** TreatmentPlansTool, DrugDosingTool, and DrugClassesTool were not updated to accept props, so they wouldn't work with the new architecture.

**Solution:** Added complete refactoring specifications for all 4 existing tools (Sections 4.4-4.7). All tools now:
- Accept patient data via props
- Auto-trigger inference when props change via useEffect
- Work seamlessly with the lifted state pattern

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Core Architecture](#core-architecture)
3. [Data Model & State Management](#data-model--state-management)
4. [Component Specifications](#component-specifications)
5. [File Structure & Dependencies](#file-structure--dependencies)
6. [Detailed Implementation Steps](#detailed-implementation-steps)
7. [API Integration](#api-integration)
8. [UI/UX Layout Specifications](#uiux-layout-specifications)
9. [Testing Strategy](#testing-strategy)
10. [Migration & Rollback Plan](#migration--rollback-plan)
11. [Performance Considerations](#performance-considerations)

---

## Executive Summary

This specification defines the technical implementation for refactoring the Loeffler Map application from a tab-based navigation pattern to a **Unified Single-Page Comprehensive Assessment Interface**. The primary goals are:

- **Eliminate data re-entry**: Clinicians enter patient demographics and vitals once
- **Intelligent form flow**: Downstream tools auto-populate with parent component data
- **Conditional rendering**: Clinical tools only appear when contextually relevant
- **Real-time clinical feedback**: BP grading updates dynamically as vitals are entered

**Target Deliverable:** Production-ready assessment page with auto-populating child components and seamless ML inference integration.

---

## Core Architecture

### 2.1 State Management Pattern: Lifted State

The refactored architecture implements **lifted state** to centralize truth:

```
Parent (page.tsx) - State Owner
    │
    ├─→ PatientDetails (Section 1) - Consumer
    ├─→ ClinicalProfile (Section 2) - Consumer
    ├─→ PregnancySafety (Section 3) - Conditional Consumer
    └─→ DrugInteractions (Section 4) - Conditional Consumer + Props
```

**Key Principles:**

- **Single Source of Truth:** `PatientAssessment` object in `page.tsx`
- **Unidirectional Data Flow:** Parent → Child via props only
- **Controlled Components:** Form inputs update parent state via callbacks
- **Reactive Rendering:** Child visibility driven by parent state

### 2.2 Data Flow Diagram

```
User Input (Section 1)
    ↓
Parent State Updated (PatientAssessment)
    ↓
Props Passed to Children
    ↓
Children Re-render with New Props
    ↓
Conditional Rendering Evaluated (isPregnant, takingOtherDrugs)
    ↓
ML Models Triggered via useEffect (Drug Interactions, Pregnancy Safety)
```

### 2.3 Component Hierarchy

```
src/app/page.tsx (AssessmentPage - Root/Parent)
├── Form Control Logic
├── State Management (PatientAssessment)
├── BP Grade Calculation
├── Conditional Rendering Logic
│
├── Section 1: PatientDetailsForm (New Functional Component)
│   ├── Demographics Inputs (Name, Aadhar, Mobile, Age)
│   └── Vitals Inputs (SBP, DBP) + BP Grade Badge
│
├── Section 2: ClinicalProfileForm (New Functional Component)
│   └── Comorbidity Checkboxes
│
├── Section 3: PregnancySection (New Functional Component)
│   ├── Pregnancy Radio Group
│   └── {isPregnant === 'yes' && <PregnancySafetyTool {...props} />}
│
├── Section 4: DrugInteractionSection (New Functional Component)
│   ├── Other Drug Radio Group
│   └── {takingOtherDrugs === 'yes' && <DrugInteractionsTool {...props} />}
│
└── Section 5: ClinicalProtocols (New Functional Component) - CONDITIONALLY RENDERED
    ├── {mlReady && <TreatmentPlansTool {...props} />}
    ├── {mlReady && <DrugDosingTool {...props} />}
    └── {mlReady && <DrugClassesTool {...props} />}
```

**⚠️ Critical Note:** Section 5 only renders when `mlReady === true` (i.e., Age, SBP, and DBP are populated). This ensures tools receive required data automatically from Section 1.

---

## Data Model & State Management

### 3.1 TypeScript Interfaces

#### Main Patient Assessment Interface

```typescript
// src/app/types/assessment.ts (NEW FILE)

export interface PatientAssessment {
  // Section 1: Demographics (Sources 2-5)
  name: string;
  aadhar?: string;
  mobile?: string;
  age: number | "";

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

// Blood Pressure Grade Classification
export type BPGrade = 
  | "Normal"
  | "Elevated"
  | "Stage 1 Hypertension"
  | "Stage 2 Hypertension"
  | "Critical";

export interface BPGradeResult {
  grade: BPGrade;
  color: "green" | "yellow" | "orange" | "red";
  description: string;
}
```

#### Component Props Interfaces

```typescript
// src/app/types/props.ts (NEW FILE)

// DrugInteractionsTool Props
export interface DrugInteractionsToolProps {
  // Pre-filled data from parent
  prefilledAge?: number | "";
  prefilledSbp?: number | "";
  prefilledDbp?: number | "";
  
  // Callbacks
  onResultsUpdate?: (results: any) => void;
  
  // UI state
  isDisabled?: boolean; // Disable inputs if data is pre-filled
}

// PregnancySafetyTool Props
export interface PregnancySafetyToolProps {
  age?: number | "";
  sbp?: number | "";
  dbp?: number | "";
  onResultsUpdate?: (results: any) => void;
}

// TreatmentPlansTool Props
export interface TreatmentPlansToolProps {
  age?: number | "";
  sbp?: number | "";
  dbp?: number | "";
  bpGrade?: BPGrade;
  comorbidities?: PatientAssessment["comorbidities"];
  onResultsUpdate?: (results: any) => void;
}

// DrugDosingTool Props
export interface DrugDosingToolProps {
  age?: number | "";
  sbp?: number | "";
  dbp?: number | "";
  kidneyStatus?: "normal" | "ckd";
  comorbidities?: PatientAssessment["comorbidities"];
  onResultsUpdate?: (results: any) => void;
}

// DrugClassesTool Props
export interface DrugClassesToolProps {
  age?: number | "";
  sbp?: number | "";
  dbp?: number | "";
  bpGrade?: BPGrade;
  onResultsUpdate?: (results: any) => void;
}

// Section Component Props (Internal)
export interface PatientDetailsFormProps {
  data: PatientAssessment;
  onUpdate: (field: keyof PatientAssessment, value: any) => void;
  bpGrade?: BPGradeResult;
}

export interface ClinicalProfileFormProps {
  comorbidities: PatientAssessment["comorbidities"];
  onUpdate: (comorbidities: PatientAssessment["comorbidities"]) => void;
}

export interface PregnancySectionProps {
  isPregnant: PatientAssessment["isPregnant"];
  onUpdate: (value: PatientAssessment["isPregnant"]) => void;
  patientAge?: number | "";
}

export interface DrugInteractionSectionProps {
  takingOtherDrugs: PatientAssessment["takingOtherDrugs"];
  onUpdate: (value: PatientAssessment["takingOtherDrugs"]) => void;
  age?: number | "";
  sbp?: number | "";
  dbp?: number | "";
}
```

### 3.2 State Initialization

```typescript
// Initial state in page.tsx
const initialPatientAssessment: PatientAssessment = {
  name: "",
  aadhar: "",
  mobile: "",
  age: "",
  sbp: "",
  dbp: "",
  comorbidities: {
    diabetes: false,
    heartCondition: false,
    ckd: false,
    other: false,
  },
  isPregnant: "",
  takingOtherDrugs: "",
};

// State declaration
const [assessment, setAssessment] = useState<PatientAssessment>(initialPatientAssessment);
const [bpGrade, setBpGrade] = useState<BPGradeResult | null>(null);
```

---

## Component Specifications

### 4.1 src/lib/medical-calcs.ts (NEW - BP Grading Helper)

**Purpose:** Encapsulate medical calculation logic for BP grading.

```typescript
import { BPGrade, BPGradeResult } from "@/app/types/assessment";

/**
 * Calculate BP Grade based on AHA Guidelines
 * Reference: American Heart Association Blood Pressure Categories
 * 
 * Normal:              <120 AND <80
 * Elevated:            120-129 AND <80
 * Stage 1 HTN:         130-139 OR 80-89
 * Stage 2 HTN:         ≥140 OR ≥90
 * Hypertensive Crisis: >180 AND/OR >120 (critical)
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
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
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
 * Validate patient assessment data completeness
 * Returns an object indicating which sections are complete
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
 * Check if minimum data is present for ML inference
 */
export function canRunMLModels(assessment: PatientAssessment): boolean {
  return (
    assessment.age !== "" &&
    assessment.sbp !== "" &&
    assessment.dbp !== ""
  );
}
```

**Export:** These functions will be imported and used in `page.tsx` and child components.

---

### 4.2 src/app/page.tsx (MAJOR REFACTOR - Root Assessment Page)

**Current State:** Likely uses tab-based navigation (DrugClassesTool, DrugDosingTool, etc. in tabs)

**New State:** Single-page sequential form with conditional sections

#### 4.2.1 Overall Structure

```typescript
"use client"; // React Server Component Boundary

import React, { useState, useCallback, useMemo } from "react";
import { PatientAssessment, BPGradeResult } from "./types/assessment";
import { calculateBPGrade, canRunMLModels } from "@/lib/medical-calcs";

// Component Imports
import PatientDetailsForm from "@/components/assessment/PatientDetailsForm";
import ClinicalProfileForm from "@/components/assessment/ClinicalProfileForm";
import PregnancySection from "@/components/assessment/PregnancySection";
import DrugInteractionSection from "@/components/assessment/DrugInteractionSection";

// UI Imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssessmentPage() {
  // ==================== STATE MANAGEMENT ====================
  const [assessment, setAssessment] = useState<PatientAssessment>({
    name: "",
    aadhar: "",
    mobile: "",
    age: "",
    sbp: "",
    dbp: "",
    comorbidities: {
      diabetes: false,
      heartCondition: false,
      ckd: false,
      other: false,
    },
    isPregnant: "",
    takingOtherDrugs: "",
  });

  // ==================== CALLBACKS ====================
  
  /**
   * Generic field updater for simple fields
   */
  const handleFieldUpdate = useCallback(
    (field: keyof PatientAssessment, value: any) => {
      setAssessment((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  /**
   * Handler for nested comorbidities object
   */
  const handleComorbiditiesUpdate = useCallback(
    (comorbidities: PatientAssessment["comorbidities"]) => {
      setAssessment((prev) => ({
        ...prev,
        comorbidities,
      }));
    },
    []
  );

  /**
   * Specialized handler for BP updates with Grade calculation
   */
  const handleBPUpdate = useCallback(
    (field: "sbp" | "dbp", value: number | "") => {
      setAssessment((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  // ==================== COMPUTED VALUES ====================

  /**
   * Calculate BP Grade whenever SBP or DBP changes
   * Uses useMemo to prevent unnecessary recalculations
   */
  const bpGrade = useMemo(() => {
    return calculateBPGrade(assessment.sbp, assessment.dbp);
  }, [assessment.sbp, assessment.dbp]);

  /**
   * Determine if ML models can run
   */
  const mlReady = useMemo(() => {
    return canRunMLModels(assessment);
  }, [assessment.age, assessment.sbp, assessment.dbp]);

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Patient Assessment
          </h1>
          <p className="text-gray-600">
            Complete the form sections below to receive clinical assessments
          </p>
        </div>

        {/* ========== SECTION 1: PATIENT DETAILS & VITALS ========== */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                1
              </span>
              Patient Details & Vitals
            </CardTitle>
            <CardDescription>
              Enter patient demographics and vital signs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PatientDetailsForm
              data={assessment}
              onUpdate={handleFieldUpdate}
              onBPUpdate={handleBPUpdate}
              bpGrade={bpGrade}
            />
          </CardContent>
        </Card>

        {/* ========== SECTION 2: CLINICAL PROFILE ========== */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                2
              </span>
              Clinical Profile
            </CardTitle>
            <CardDescription>
              Select any existing comorbidities (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClinicalProfileForm
              comorbidities={assessment.comorbidities}
              onUpdate={handleComorbiditiesUpdate}
            />
          </CardContent>
        </Card>

        {/* ========== SECTION 3: PREGNANCY ASSESSMENT ========== */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                3
              </span>
              Pregnancy Assessment
            </CardTitle>
            <CardDescription>
              Pregnancy status affects medication recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PregnancySection
              isPregnant={assessment.isPregnant}
              onUpdate={(value) => handleFieldUpdate("isPregnant", value)}
              patientAge={assessment.age}
            />
          </CardContent>
        </Card>

        {/* ========== SECTION 4: DRUG INTERACTIONS ========== */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                4
              </span>
              Drug Interactions
            </CardTitle>
            <CardDescription>
              Assess potential interactions with other medications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DrugInteractionSection
              takingOtherDrugs={assessment.takingOtherDrugs}
              onUpdate={(value) => handleFieldUpdate("takingOtherDrugs", value)}
              age={assessment.age}
              sbp={assessment.sbp}
              dbp={assessment.dbp}
              mlReady={mlReady}
            />
          </CardContent>
        </Card>

        {/* ========== SECTION 5: CLINICAL PROTOCOLS (Auto-Generated) ========== */}
        {mlReady && (
          <ClinicalProtocolsSection
            bpGrade={bpGrade}
            age={assessment.age}
            sbp={assessment.sbp}
            dbp={assessment.dbp}
            comorbidities={assessment.comorbidities}
            isPregnant={assessment.isPregnant}
          />
        )}

        {/* Debug Footer (Remove in Production) */}
        {process.env.NODE_ENV === "development" && (
          <Card className="bg-gray-100 border-gray-300">
            <CardHeader>
              <CardTitle className="text-sm">Debug State</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(
                  {
                    assessment,
                    bpGrade,
                    mlReady,
                  },
                  null,
                  2
                )}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

---

### 4.3 New Component Files (Create These)

#### 4.3.1 src/components/assessment/PatientDetailsForm.tsx

```typescript
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PatientAssessment, BPGradeResult } from "@/app/types/assessment";

interface PatientDetailsFormProps {
  data: PatientAssessment;
  onUpdate: (field: keyof PatientAssessment, value: any) => void;
  onBPUpdate: (field: "sbp" | "dbp", value: number | "") => void;
  bpGrade?: BPGradeResult | null;
}

export default function PatientDetailsForm({
  data,
  onUpdate,
  onBPUpdate,
  bpGrade,
}: PatientDetailsFormProps) {
  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "age" | "sbp" | "dbp"
  ) => {
    const value = e.target.value === "" ? "" : Number(e.target.value);

    if (field === "age") {
      onUpdate(field, value);
    } else if (field === "sbp" || field === "dbp") {
      onBPUpdate(field, value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Demographics Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Demographics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Patient Name *
            </Label>
            <Input
              id="name"
              placeholder="Full name"
              value={data.name}
              onChange={(e) => onUpdate("name", e.target.value)}
              className="h-10"
            />
          </div>

          {/* Aadhar */}
          <div className="space-y-2">
            <Label htmlFor="aadhar" className="text-sm font-medium">
              Aadhar Number
            </Label>
            <Input
              id="aadhar"
              placeholder="12-digit Aadhar"
              value={data.aadhar || ""}
              onChange={(e) => onUpdate("aadhar", e.target.value || undefined)}
              className="h-10"
              maxLength={12}
            />
          </div>

          {/* Mobile */}
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-sm font-medium">
              Mobile Number
            </Label>
            <Input
              id="mobile"
              placeholder="10-digit mobile number"
              value={data.mobile || ""}
              onChange={(e) => onUpdate("mobile", e.target.value || undefined)}
              className="h-10"
              maxLength={10}
            />
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm font-medium">
              Age (years) *
            </Label>
            <Input
              id="age"
              type="number"
              placeholder="0"
              value={data.age}
              onChange={(e) => handleNumericInput(e, "age")}
              min="0"
              max="150"
              className="h-10"
            />
          </div>
        </div>
      </div>

      {/* Vitals Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Blood Pressure</h3>
        <div className="space-y-4">
          {/* BP Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sbp" className="text-sm font-medium">
                Systolic (SBP) *
              </Label>
              <Input
                id="sbp"
                type="number"
                placeholder="120"
                value={data.sbp}
                onChange={(e) => handleNumericInput(e, "sbp")}
                min="0"
                max="300"
                className="h-10"
              />
              <p className="text-xs text-gray-500">mmHg</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dbp" className="text-sm font-medium">
                Diastolic (DBP) *
              </Label>
              <Input
                id="dbp"
                type="number"
                placeholder="80"
                value={data.dbp}
                onChange={(e) => handleNumericInput(e, "dbp")}
                min="0"
                max="150"
                className="h-10"
              />
              <p className="text-xs text-gray-500">mmHg</p>
            </div>
          </div>

          {/* BP Grade Badge */}
          {bpGrade && (
            <div className="pt-2">
              <div className="inline-flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-sm font-semibold border-2 ${
                    bpGrade.color === "green"
                      ? "border-green-500 text-green-700 bg-green-50"
                      : bpGrade.color === "yellow"
                      ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                      : bpGrade.color === "orange"
                      ? "border-orange-500 text-orange-700 bg-orange-50"
                      : "border-red-500 text-red-700 bg-red-50"
                  }`}
                >
                  {bpGrade.grade}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mt-2">{bpGrade.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

#### 4.3.2 src/components/assessment/ClinicalProfileForm.tsx

```typescript
"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PatientAssessment } from "@/app/types/assessment";

interface ClinicalProfileFormProps {
  comorbidities: PatientAssessment["comorbidities"];
  onUpdate: (comorbidities: PatientAssessment["comorbidities"]) => void;
}

const COMORBIDITY_OPTIONS = [
  {
    id: "diabetes",
    label: "Diabetes Mellitus",
    description: "Type 1 or Type 2",
  },
  {
    id: "heartCondition",
    label: "Heart Condition",
    description: "Coronary artery disease, heart failure, arrhythmia, etc.",
  },
  {
    id: "ckd",
    label: "Chronic Kidney Disease",
    description: "CKD Stage 1-5",
  },
  {
    id: "other",
    label: "Other Chronic Conditions",
    description: "COPD, asthma, liver disease, etc.",
  },
] as const;

export default function ClinicalProfileForm({
  comorbidities,
  onUpdate,
}: ClinicalProfileFormProps) {
  const handleCheckChange = (
    id: keyof typeof comorbidities,
    checked: boolean
  ) => {
    onUpdate({
      ...comorbidities,
      [id]: checked,
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Select any comorbidities present (optional). This helps refine drug
        recommendations.
      </p>
      
      <div className="space-y-3">
        {COMORBIDITY_OPTIONS.map((option) => (
          <div
            key={option.id}
            className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() =>
              handleCheckChange(
                option.id as keyof typeof comorbidities,
                !comorbidities[option.id as keyof typeof comorbidities]
              )
            }
          >
            <Checkbox
              id={option.id}
              checked={
                comorbidities[option.id as keyof typeof comorbidities]
              }
              onCheckedChange={(checked) =>
                handleCheckChange(
                  option.id as keyof typeof comorbidities,
                  checked as boolean
                )
              }
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <Label
                htmlFor={option.id}
                className="text-sm font-medium text-gray-900 cursor-pointer block"
              >
                {option.label}
              </Label>
              <p className="text-xs text-gray-500 mt-1">{option.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 4.3.3 src/components/assessment/PregnancySection.tsx

```typescript
"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import PregnancySafetyTool from "@/components/PregnancySafetyTool";

interface PregnancySectionProps {
  isPregnant: string;
  onUpdate: (value: string) => void;
  patientAge?: number | "";
}

export default function PregnancySection({
  isPregnant,
  onUpdate,
  patientAge,
}: PregnancySectionProps) {
  const showWarning = patientAge !== "" && (Number(patientAge) < 10 || Number(patientAge) > 55);

  return (
    <div className="space-y-4">
      {showWarning && (
        <Alert variant="default" className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800">
            Note: Pregnancy is unlikely at this age but answering this question
            ensures complete assessment coverage.
          </AlertDescription>
        </Alert>
      )}

      <RadioGroup value={isPregnant} onValueChange={onUpdate}>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
            <RadioGroupItem value="no" id="not-pregnant" />
            <Label
              htmlFor="not-pregnant"
              className="text-sm font-medium text-gray-900 cursor-pointer flex-1"
            >
              No - Patient is not pregnant
            </Label>
          </div>

          <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
            <RadioGroupItem value="yes" id="pregnant" />
            <Label
              htmlFor="pregnant"
              className="text-sm font-medium text-gray-900 cursor-pointer flex-1"
            >
              Yes - Patient is pregnant
            </Label>
          </div>
        </div>
      </RadioGroup>

      {/* Conditionally Render PregnancySafetyTool */}
      {isPregnant === "yes" && (
        <Card className="mt-4 border-l-4 border-l-purple-500 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-base">Pregnancy Safety Assessment</CardTitle>
            <CardDescription>
              Review medication safety recommendations for pregnancy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PregnancySafetyTool
              age={patientAge}
              sbp=""
              dbp=""
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

#### 4.3.4 src/components/assessment/DrugInteractionSection.tsx

```typescript
"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import DrugInteractionsTool from "@/components/DrugInteractionsTool";

interface DrugInteractionSectionProps {
  takingOtherDrugs: string;
  onUpdate: (value: string) => void;
  age?: number | "";
  sbp?: number | "";
  dbp?: number | "";
  mlReady?: boolean;
}

export default function DrugInteractionSection({
  takingOtherDrugs,
  onUpdate,
  age,
  sbp,
  dbp,
  mlReady,
}: DrugInteractionSectionProps) {
  return (
    <div className="space-y-4">
      {mlReady && (
        <Alert variant="default" className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-800">
            Patient vitals are complete. ML recommendations will load automatically
            when you indicate yes.
          </AlertDescription>
        </Alert>
      )}

      <RadioGroup value={takingOtherDrugs} onValueChange={onUpdate}>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
            <RadioGroupItem value="no" id="no-drugs" />
            <Label
              htmlFor="no-drugs"
              className="text-sm font-medium text-gray-900 cursor-pointer flex-1"
            >
              No - Not taking other medications
            </Label>
          </div>

          <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
            <RadioGroupItem value="yes" id="yes-drugs" />
            <Label
              htmlFor="yes-drugs"
              className="text-sm font-medium text-gray-900 cursor-pointer flex-1"
            >
              Yes - Taking other medications
            </Label>
          </div>
        </div>
      </RadioGroup>

      {/* Conditionally Render DrugInteractionsTool */}
      {takingOtherDrugs === "yes" && (
        <Card className="mt-4 border-l-4 border-l-cyan-500 bg-cyan-50">
          <CardHeader>
            <CardTitle className="text-base">Drug Interactions Assessment</CardTitle>
            <CardDescription>
              Check for potential interactions with recommended antihypertensive
              medications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DrugInteractionsTool
              prefilledAge={age}
              prefilledSbp={sbp}
              prefilledDbp={dbp}
              isDisabled={mlReady}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

#### 4.3.5 src/components/assessment/ClinicalProtocolsSection.tsx (NEW - Section 5)

```typescript
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BPGradeResult, PatientAssessment } from "@/app/types/assessment";
import TreatmentPlansTool from "@/components/TreatmentPlansTool";
import DrugDosingTool from "@/components/DrugDosingTool";
import DrugClassesTool from "@/components/DrugClassesTool";

interface ClinicalProtocolsSectionProps {
  bpGrade: BPGradeResult | null;
  age?: number | "";
  sbp?: number | "";
  dbp?: number | "";
  comorbidities: PatientAssessment["comorbidities"];
  isPregnant?: string;
}

export default function ClinicalProtocolsSection({
  bpGrade,
  age,
  sbp,
  dbp,
  comorbidities,
  isPregnant,
}: ClinicalProtocolsSectionProps) {
  // Only show this section if minimum vitals are available
  const isVisible = age !== "" && sbp !== "" && dbp !== "";

  if (!isVisible) {
    return null;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px bg-gray-200 flex-1" />
        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          Clinical Protocols
        </span>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      {/* Protocol Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Treatment Plans Card */}
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                5.1
              </span>
              Treatment Protocol
            </CardTitle>
            <CardDescription>
              Recommended based on BP Grade: <span className="font-semibold">{bpGrade?.grade}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TreatmentPlansTool
              age={age}
              sbp={sbp}
              dbp={dbp}
              bpGrade={bpGrade?.grade}
              comorbidities={comorbidities}
            />
          </CardContent>
        </Card>

        {/* Dosing Guidelines Card */}
        <Card className="shadow-sm border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                5.2
              </span>
              Dosing Guidelines
            </CardTitle>
            <CardDescription>
              Individualized dosage recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DrugDosingTool
              age={age}
              sbp={sbp}
              dbp={dbp}
              kidneyStatus={comorbidities.ckd ? "ckd" : "normal"}
              comorbidities={comorbidities}
            />
          </CardContent>
        </Card>
      </div>

      {/* Drug Classes Card (Full Width) */}
      <Card className="shadow-sm border-l-4 border-l-emerald-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
              5.3
            </span>
            Available Drug Classes
          </CardTitle>
          <CardDescription>
            Comprehensive overview of antihypertensive medication classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DrugClassesTool
            age={age}
            sbp={sbp}
            dbp={dbp}
            bpGrade={bpGrade?.grade}
          />
        </CardContent>
      </Card>

      {/* Pregnancy Warning */}
      {isPregnant === "yes" && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-900">
            <strong>⚠️ Pregnancy Notice:</strong> All recommendations above should be reviewed in conjunction with the Pregnancy Safety Assessment (Section 3) to ensure medication compatibility.
          </p>
        </div>
      )}
    </div>
  );
}
```

---

### 4.4 Refactor: src/components/DrugInteractionsTool.tsx

**Current State:** Manages age, sbp, dbp internally  
**New State:** Accept these as props, with optional controlled behavior

```typescript
"use client";

import React, { useState, useEffect } from "react";
import { DrugInteractionsToolProps } from "@/app/types/props";

export default function DrugInteractionsTool({
  prefilledAge,
  prefilledSbp,
  prefilledDbp,
  onResultsUpdate,
  isDisabled = false,
}: DrugInteractionsToolProps) {
  // Internal state for when props are NOT provided
  const [internalAge, setInternalAge] = useState<number | "">(prefilledAge ?? "");
  const [internalSbp, setInternalSbp] = useState<number | "">(prefilledSbp ?? "");
  const [internalDbp, setInternalDbp] = useState<number | "">(prefilledDbp ?? "");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Effect: Sync prefilled props to internal state
  useEffect(() => {
    if (prefilledAge !== undefined) setInternalAge(prefilledAge);
    if (prefilledSbp !== undefined) setInternalSbp(prefilledSbp);
    if (prefilledDbp !== undefined) setInternalDbp(prefilledDbp);
  }, [prefilledAge, prefilledSbp, prefilledDbp]);

  // Effect: Trigger ML inference when vitals change
  useEffect(() => {
    if (internalAge !== "" && internalSbp !== "" && internalDbp !== "") {
      triggerMLInference();
    }
  }, [internalAge, internalSbp, internalDbp]);

  const triggerMLInference = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: internalAge,
          sbp: internalSbp,
          dbp: internalDbp,
        }),
      });

      const data = await response.json();
      setResults(data);
      onResultsUpdate?.(data);
    } catch (error) {
      console.error("ML inference failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Determine if fields should be disabled
  const ageDisabled = prefilledAge !== undefined || isDisabled;
  const sbpDisabled = prefilledSbp !== undefined || isDisabled;
  const dbpDisabled = prefilledDbp !== undefined || isDisabled;

  return (
    <div className="space-y-4">
      {/* Input Section (hidden if pre-filled) */}
      {!ageDisabled && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-3 gap-3">
            {/* Age Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Age</label>
              <input
                type="number"
                value={internalAge}
                onChange={(e) =>
                  setInternalAge(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="Years"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* SBP Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">SBP (mmHg)</label>
              <input
                type="number"
                value={internalSbp}
                onChange={(e) =>
                  setInternalSbp(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="Systolic"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* DBP Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">DBP (mmHg)</label>
              <input
                type="number"
                value={internalDbp}
                onChange={(e) =>
                  setInternalDbp(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="Diastolic"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Pre-filled Data Display (shown if pre-filled) */}
      {(ageDisabled || isDisabled) && prefilledAge !== undefined && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="text-blue-800">
            <strong>Patient Vitals:</strong> Age {prefilledAge} years,
            BP {prefilledSbp}/{prefilledDbp} mmHg
          </p>
        </div>
      )}

      {/* Results Section */}
      {loading && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Loading drug interaction recommendations...
          </p>
        </div>
      )}

      {results && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
          <p className="text-sm font-semibold text-green-900">
            ML Recommendations:
          </p>
          <pre className="text-xs bg-white p-2 rounded border border-green-200 overflow-auto max-h-60">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

---

### 4.5 Refactor: src/components/TreatmentPlansTool.tsx

**Current State:** Likely manages its own state
**New State:** Accept BP Grade and comorbidities as props for auto-population

```typescript
"use client";

import React, { useEffect, useState } from "react";
import { TreatmentPlansToolProps } from "@/app/types/props";

export default function TreatmentPlansTool({
  age,
  sbp,
  dbp,
  bpGrade,
  comorbidities,
  onResultsUpdate,
}: TreatmentPlansToolProps) {
  const [protocols, setProtocols] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Auto-trigger protocol generation when props change
  useEffect(() => {
    if (age !== "" && sbp !== "" && dbp !== "" && bpGrade) {
      generateProtocols();
    }
  }, [age, sbp, dbp, bpGrade, comorbidities]);

  const generateProtocols = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/predictions-builtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          sbp,
          dbp,
          comorbidities,
          requestType: "treatment_plan", // Distinguish from other API calls
        }),
      });

      const data = await response.json();
      setProtocols(data);
      onResultsUpdate?.(data);
    } catch (error) {
      console.error("Treatment protocol generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-600">Loading treatment protocols...</div>;
  }

  if (!protocols) {
    return <div className="text-sm text-gray-500">Enter patient vitals to generate protocols.</div>;
  }

  return (
    <div className="space-y-3">
      <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-80">
        {JSON.stringify(protocols, null, 2)}
      </pre>
    </div>
  );
}
```

### 4.6 Refactor: src/components/DrugDosingTool.tsx

**Current State:** Manages its own state
**New State:** Accept patient vitals and kidney function as props

```typescript
"use client";

import React, { useEffect, useState } from "react";
import { DrugDosingToolProps } from "@/app/types/props";

export default function DrugDosingTool({
  age,
  sbp,
  dbp,
  kidneyStatus = "normal",
  comorbidities,
  onResultsUpdate,
}: DrugDosingToolProps) {
  const [dosages, setDosages] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Auto-trigger dosage calculation when props change
  useEffect(() => {
    if (age !== "" && sbp !== "" && dbp !== "") {
      calculateDosages();
    }
  }, [age, sbp, dbp, kidneyStatus, comorbidities]);

  const calculateDosages = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/predictions-builtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          sbp,
          dbp,
          kidneyStatus,
          comorbidities,
          requestType: "drug_dosing",
        }),
      });

      const data = await response.json();
      setDosages(data);
      onResultsUpdate?.(data);
    } catch (error) {
      console.error("Dosage calculation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-600">Calculating optimal dosages...</div>;
  }

  if (!dosages) {
    return <div className="text-sm text-gray-500">Enter patient vitals to calculate dosages.</div>;
  }

  return (
    <div className="space-y-3">
      {/* Kidney Function Indicator */}
      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
        <strong>Kidney Status:</strong> {kidneyStatus === "ckd" ? "CKD (adjusted dosing)" : "Normal"}
      </div>

      {/* Dosage Table */}
      <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-80">
        {JSON.stringify(dosages, null, 2)}
      </pre>
    </div>
  );
}
```

### 4.7 Refactor: src/components/DrugClassesTool.tsx

**Current State:** Likely static or minimal interactivity
**New State:** Accept BP Grade as prop for context-aware filtering

```typescript
"use client";

import React, { useEffect, useState } from "react";
import { DrugClassesToolProps } from "@/app/types/props";

export default function DrugClassesTool({
  age,
  sbp,
  dbp,
  bpGrade,
  onResultsUpdate,
}: DrugClassesToolProps) {
  const [drugClasses, setDrugClasses] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Auto-trigger drug class retrieval when BP Grade changes
  useEffect(() => {
    if (bpGrade) {
      fetchDrugClasses();
    }
  }, [bpGrade, age, sbp, dbp]);

  const fetchDrugClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/predictions-builtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          sbp,
          dbp,
          bpGrade,
          requestType: "drug_classes",
        }),
      });

      const data = await response.json();
      setDrugClasses(data);
      onResultsUpdate?.(data);
    } catch (error) {
      console.error("Failed to retrieve drug classes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-600">Loading drug class information...</div>;
  }

  if (!drugClasses) {
    return <div className="text-sm text-gray-500">Enter patient vitals to view available drug classes.</div>;
  }

  return (
    <div className="space-y-3">
      <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-96">
        {JSON.stringify(drugClasses, null, 2)}
      </pre>
    </div>
  );
}
```

---

## File Structure & Dependencies

### 5.1 New File Structure

```
src/
├── app/
│   ├── page.tsx                          [REFACTOR: Main assessment page]
│   ├── types/                             [NEW DIRECTORY]
│   │   ├── assessment.ts                 [NEW: Patient data types]
│   │   └── props.ts                      [NEW: Component prop types]
│   └── api/
│       └── predictions-builtime/
│           └── route.ts                  [EXISTING: ML API]
│
├── components/
│   ├── assessment/                        [NEW DIRECTORY]
│   │   ├── PatientDetailsForm.tsx        [NEW]
│   │   ├── ClinicalProfileForm.tsx       [NEW]
│   │   ├── PregnancySection.tsx          [NEW]
│   │   ├── DrugInteractionSection.tsx    [NEW]
│   │   └── ClinicalProtocolsSection.tsx  [NEW]
│   │
│   ├── DrugInteractionsTool.tsx          [REFACTOR: Add props support]
│   ├── TreatmentPlansTool.tsx            [REFACTOR: Add props support + auto-trigger]
│   ├── DrugDosingTool.tsx                [REFACTOR: Add props support + auto-trigger]
│   ├── DrugClassesTool.tsx               [REFACTOR: Add props support + auto-trigger]
│   ├── PregnancySafetyTool.tsx           [EXISTING: No changes needed]
│   └── ui/                                [EXISTING: shadcn/ui components]
│
└── lib/
    ├── medical-calcs.ts                  [NEW: BP grading logic]
    ├── ml-inference.ts                   [EXISTING]
    └── ...
```

**Key Changes:**
- `/api/predictions` → `/api/predictions-builtime` (updated endpoint)
- 5 new assessment components (4 in assessment/, 1 standalone for protocols)
- 4 existing tools refactored to accept props and auto-trigger inference

### 5.2 Import Dependencies

**New imports required in `page.tsx`:**

```typescript
import React, { useState, useCallback, useMemo } from "react";
import { PatientAssessment, BPGradeResult } from "./types/assessment";
import { calculateBPGrade, canRunMLModels } from "@/lib/medical-calcs";
import PatientDetailsForm from "@/components/assessment/PatientDetailsForm";
import ClinicalProfileForm from "@/components/assessment/ClinicalProfileForm";
import PregnancySection from "@/components/assessment/PregnancySection";
import DrugInteractionSection from "@/components/assessment/DrugInteractionSection";
import ClinicalProtocolsSection from "@/components/assessment/ClinicalProtocolsSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
```

**Refactored component imports in assessment components:**
- `TreatmentPlansTool` - from `@/components/TreatmentPlansTool`
- `DrugDosingTool` - from `@/components/DrugDosingTool`
- `DrugClassesTool` - from `@/components/DrugClassesTool`
- `DrugInteractionsTool` - from `@/components/DrugInteractionsTool`
- `PregnancySafetyTool` - from `@/components/PregnancySafetyTool`

**Existing shadcn/ui dependencies:**
- Input
- Label
- RadioGroup
- Checkbox
- Badge
- Card
- Alert

---

## Detailed Implementation Steps

### 6.1 Phase 1: Type Definitions (Step 1-2, ~30 mins)

**Step 1.1:** Create `src/app/types/assessment.ts`
- Define `PatientAssessment` interface
- Define `BPGrade` and `BPGradeResult` types
- Add comprehensive JSDoc comments

**Step 1.2:** Create `src/app/types/props.ts`
- Define all component prop interfaces
- Ensure consistency with assessment.ts types

### 6.2 Phase 2: Medical Utilities (Step 3, ~45 mins)

**Step 2.1:** Create `src/lib/medical-calcs.ts`
- Implement `calculateBPGrade()` with full logic
- Implement `validateAssessment()` helper
- Implement `canRunMLModels()` predicate
- Add unit tests (optional but recommended)

### 6.3 Phase 3: Component Creation (Steps 4-7, ~2-3 hours)

**Step 3.1:** Create `src/components/assessment/PatientDetailsForm.tsx`
- Two-column demographics grid
- BP inputs with real-time grade calculation
- Integrate with Badge component for BP Grade display

**Step 3.2:** Create `src/components/assessment/ClinicalProfileForm.tsx`
- Comorbidity checkbox group
- Proper accessibility (labels, descriptions)

**Step 3.3:** Create `src/components/assessment/PregnancySection.tsx`
- Radio group for pregnancy status
- Conditional rendering of PregnancySafetyTool
- Age-based warning alerts

**Step 3.4:** Create `src/components/assessment/DrugInteractionSection.tsx`
- Radio group for other drug status
- Conditional rendering of DrugInteractionsTool
- Status indicators for ML readiness

**Step 3.5:** Create `src/components/assessment/ClinicalProtocolsSection.tsx`
- Conditional rendering (only shows when mlReady === true)
- Three-card layout for Treatment Plans, Dosing, and Drug Classes
- Pregnancy warning message
- Uses new refactored tool components

### 6.4 Phase 4: Refactoring Existing Tools (Step 8, ~2 hours)

**Step 4.1:** Refactor `src/components/DrugInteractionsTool.tsx`
- Add prop interfaces (prefilledAge, prefilledSbp, prefilledDbp)
- Add useEffect for prop sync
- Implement field disabling logic
- Add useEffect to trigger ML on prop changes
- **API Endpoint:** `/api/predictions-builtime`

**Step 4.2:** Refactor `src/components/TreatmentPlansTool.tsx`
- Add props: age, sbp, dbp, bpGrade, comorbidities
- Add useEffect to auto-trigger protocol generation
- **API Endpoint:** `/api/predictions-builtime` with `requestType: "treatment_plan"`

**Step 4.3:** Refactor `src/components/DrugDosingTool.tsx`
- Add props: age, sbp, dbp, kidneyStatus, comorbidities
- Add useEffect to auto-trigger dosage calculation
- Display kidney function status indicator
- **API Endpoint:** `/api/predictions-builtime` with `requestType: "drug_dosing"`

**Step 4.4:** Refactor `src/components/DrugClassesTool.tsx`
- Add props: age, sbp, dbp, bpGrade
- Add useEffect to auto-trigger drug class retrieval
- **API Endpoint:** `/api/predictions-builtime` with `requestType: "drug_classes"`

### 6.5 Phase 5: Page Refactoring (Step 9, ~1.5 hours)

**Step 5.1:** Rewrite `src/app/page.tsx`
- Implement lifted state pattern with PatientAssessment
- Create callback handlers for all form inputs
- Import and integrate all 5 section components
- Add ClinicalProtocolsSection with conditional rendering (mlReady)
- Add layout with Cards, numbered section headers, and proper spacing
- Add development debug footer (remove in production)
- **Critical:** Import ClinicalProtocolsSection and render after Section 4

### 6.6 Phase 6: Testing & Validation (Step 10, ~1-2 hours)

**Step 6.1:** Manual Testing Checklist
- [ ] Load page, verify all sections render
- [ ] Enter patient details, verify state updates
- [ ] Check BP Grade badge updates in real-time
- [ ] Toggle pregnancy status, verify tool appears/disappears
- [ ] Verify PregnancySafetyTool receives correct props
- [ ] Toggle other drugs status, verify tool appears/disappears
- [ ] Verify DrugInteractionsTool auto-populates with age/BP
- [ ] Verify ML inference triggers when vitals complete
- [ ] Test mobile responsive layout
- [ ] Verify form validation (required fields)

---

## API Integration

### 7.1 Backend API Endpoints (Existing)

#### POST /api/predictions-builtime

**Endpoint:** `/api/predictions-builtime` (Note: This is the active endpoint in your codebase)

**Request:**
```json
{
  "age": 55,
  "sbp": 145,
  "dbp": 95,
  "comorbidities": {
    "diabetes": true,
    "heartCondition": false,
    "ckd": false,
    "other": false
  }
}
```

**Response (Expected):**
```json
{
  "predictions": [
    {
      "drug_class": "ACE Inhibitor",
      "drug_name": "Lisinopril",
      "indication": "First-line for hypertension with diabetes",
      "dosage": "10-40 mg/day",
      "interactions_risk": "Low"
    }
  ],
  "confidence": 0.92
}
```

**Legacy Endpoint:** `/api/predictions` (deprecated - use predictions-builtime)

### 7.2 Frontend API Integration

**In DrugInteractionsTool.tsx:**

```typescript
const triggerMLInference = async () => {
  if (!internalAge || !internalSbp || !internalDbp) return;

  setLoading(true);
  try {
    const response = await fetch("/api/predictions-builtime", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age: internalAge,
        sbp: internalSbp,
        dbp: internalDbp,
        // Optional: add comorbidities from parent if available
      }),
    });

    if (!response.ok) throw new Error("API request failed");
    
    const data = await response.json();
    setResults(data);
    onResultsUpdate?.(data);
  } catch (error) {
    console.error("ML inference error:", error);
    setResults({ error: "Failed to load recommendations" });
  } finally {
    setLoading(false);
  }
};
```

**In TreatmentPlansTool.tsx and DrugDosingTool.tsx:**
- Use the same `/api/predictions-builtime` endpoint
- Pass relevant props (age, sbp, dbp, comorbidities) to the ML model
- Auto-trigger inference when props change via useEffect

---

## UI/UX Layout Specifications

### 8.1 Overall Page Layout

```
┌─────────────────────────────────────────────┐
│  Patient Assessment                         │
│  Complete the form sections below...        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  ① Patient Details & Vitals                │
│  ────────────────────────────────────────   │
│  [Name input]    [Aadhar input]             │
│  [Mobile input]  [Age input]                │
│                                             │
│  SBP [input]  DBP [input]                  │
│  ✓ BP Grade: Normal (green badge)         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  ② Clinical Profile                        │
│  ────────────────────────────────────────   │
│  ☐ Diabetes Mellitus                       │
│  ☐ Heart Condition                         │
│  ☐ Chronic Kidney Disease                  │
│  ☐ Other Chronic Conditions                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  ③ Pregnancy Assessment                    │
│  ────────────────────────────────────────   │
│  ◯ No - Not pregnant                       │
│  ◯ Yes - Is pregnant                       │
│  [If Yes: PregnancySafetyTool appears]     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  ④ Drug Interactions                       │
│  ────────────────────────────────────────   │
│  ◯ No - Not taking other drugs             │
│  ◯ Yes - Taking other drugs                │
│  [If Yes: DrugInteractionsTool appears]    │
└─────────────────────────────────────────────┘
```

### 8.2 Responsive Behavior

| Screen Size | Layout | Notes |
|---|---|---|
| Mobile (< 640px) | Single column, full width | Vertical form layout |
| Tablet (640-1024px) | Mostly single column | Demographics grid to 2 cols |
| Desktop (> 1024px) | Optimized 2-column grids | Full responsive grid support |

### 8.3 Color Scheme & Badges

**BP Grade Colors:**

| Grade | Badge Color | Border | Background |
|---|---|---|---|
| Normal | Green | `border-green-500` | `bg-green-50` |
| Elevated | Yellow | `border-yellow-500` | `bg-yellow-50` |
| Stage 1 | Orange | `border-orange-500` | `bg-orange-50` |
| Stage 2 | Red | `border-red-500` | `bg-red-50` |
| Critical | Red Dark | `border-red-600` | `bg-red-100` |

**Section Numbers:**

All section numbers use:
- Background: `bg-blue-100`
- Text: `text-blue-700`
- Border Radius: `rounded-full`
- Size: 32px (h-8 w-8)

---

## Testing Strategy

### 9.1 Unit Tests

**File:** `src/lib/medical-calcs.test.ts`

```typescript
import { calculateBPGrade, validateAssessment, canRunMLModels } from "@/lib/medical-calcs";

describe("calculateBPGrade", () => {
  test("returns Normal for SBP < 120 and DBP < 80", () => {
    const result = calculateBPGrade(110, 70);
    expect(result.grade).toBe("Normal");
    expect(result.color).toBe("green");
  });

  test("returns Elevated for SBP 120-129 and DBP < 80", () => {
    const result = calculateBPGrade(125, 75);
    expect(result.grade).toBe("Elevated");
  });

  test("returns Stage 1 for SBP 130-139 or DBP 80-89", () => {
    expect(calculateBPGrade(135, 85).grade).toBe("Stage 1 Hypertension");
  });

  test("returns Stage 2 for SBP ≥ 140 or DBP ≥ 90", () => {
    expect(calculateBPGrade(145, 95).grade).toBe("Stage 2 Hypertension");
  });

  test("returns Critical for SBP > 180 or DBP > 120", () => {
    const result = calculateBPGrade(190, 130);
    expect(result.grade).toBe("Critical");
    expect(result.color).toBe("red");
  });

  test("handles empty values gracefully", () => {
    const result = calculateBPGrade("", "");
    expect(result.grade).toBe("Normal");
  });
});

describe("canRunMLModels", () => {
  test("returns true when age, sbp, and dbp are present", () => {
    const assessment = { age: 55, sbp: 140, dbp: 90 } as any;
    expect(canRunMLModels(assessment)).toBe(true);
  });

  test("returns false when any vital is missing", () => {
    const assessment1 = { age: "", sbp: 140, dbp: 90 } as any;
    expect(canRunMLModels(assessment1)).toBe(false);

    const assessment2 = { age: 55, sbp: "", dbp: 90 } as any;
    expect(canRunMLModels(assessment2)).toBe(false);
  });
});
```

### 9.2 Integration Tests

**Scenario 1: Complete Patient Flow with Auto-Generation**
1. User enters demographics (Name, Age)
2. User enters vitals (SBP, DBP)
3. Verify BP Grade updates in real-time
4. Verify Section 5 (Clinical Protocols) appears
5. Verify TreatmentPlansTool auto-populates with BP Grade
6. Verify DrugDosingTool auto-populates with Age + Kidney Status
7. Verify DrugClassesTool auto-populates with BP Grade
8. User selects comorbidities (Diabetes, CKD, etc.)
9. Verify TreatmentPlansTool results update based on comorbidities
10. Verify DrugDosingTool updates kidney status based on CKD checkbox

**Scenario 2: Conditional Rendering (Pregnancy)**
1. Select "Yes" for pregnancy
2. Verify PregnancySafetyTool appears in Section 3
3. Verify pregnancy warning appears in Section 5
4. Select "No" for pregnancy
5. Verify PregnancySafetyTool disappears
6. Verify pregnancy warning disappears

**Scenario 3: Conditional Rendering (Drug Interactions)**
1. Verify Section 4 radio group is visible
2. Select "No" for other drugs
3. Verify DrugInteractionsTool does NOT appear
4. Select "Yes" for other drugs
5. Verify DrugInteractionsTool appears with auto-populated vitals
6. Verify vitals are read-only in DrugInteractionsTool
7. Verify ML inference runs automatically

**Scenario 4: Data Synchronization Across All Tools**
1. Fill demographics and vitals (Age 55, SBP 140, DBP 90)
2. Check Diabetes and CKD comorbidities
3. Verify all tools in Section 5 receive correct data:
   - TreatmentPlansTool: BP Grade + Comorbidities
   - DrugDosingTool: Age + Kidney Status (CKD)
   - DrugClassesTool: BP Grade
4. Modify vitals (SBP to 150)
5. Verify all tools update automatically

**Scenario 5: Form Validation & Edge Cases**
1. Load page with no data
2. Verify Section 5 (Clinical Protocols) is hidden
3. Enter only Age, no BP
4. Verify Section 5 remains hidden
5. Enter Age + BP
6. Verify Section 5 appears and all tools load

### 9.3 Manual Testing Checklist

- [ ] Page loads without errors
- [ ] All 5 sections render correctly
- [ ] Form inputs accept proper values
- [ ] BP Grade updates in real-time as vitals change
- [ ] Age range warnings display appropriately
- [ ] Pregnancy section conditional rendering works
- [ ] Drug interaction section conditional rendering works
- [ ] **[NEW]** Section 5 (Clinical Protocols) hidden when vitals incomplete
- [ ] **[NEW]** Section 5 appears when Age + SBP + DBP populated
- [ ] **[NEW]** TreatmentPlansTool receives BP Grade + Comorbidities
- [ ] **[NEW]** DrugDosingTool receives Age + Kidney Status
- [ ] **[NEW]** DrugClassesTool receives BP Grade
- [ ] **[NEW]** All Section 5 tools auto-trigger inference
- [ ] **[NEW]** Modifying vitals updates all Section 5 tools
- [ ] **[NEW]** Pregnancy warning displays in Section 5 when pregnant
- [ ] DrugInteractionsTool auto-populates with vitals
- [ ] ML inference triggers automatically
- [ ] Mobile responsive layout functions correctly
- [ ] Accessibility (keyboard navigation, screen reader compatibility)
- [ ] Error states handled gracefully (API failures, invalid input)
- [ ] **[NEW]** API endpoint `/api/predictions-builtime` used correctly

---

## Migration & Rollback Plan

### 10.1 Backward Compatibility

**Current State:** Tab-based interface with individual tools

**Migration Strategy:**
1. Create new assessment components alongside existing ones
2. Introduce new `page.tsx` as default
3. Keep old component structure intact in `/components/legacy/` if rollback needed
4. Gradually deprecate old tab-based navigation

### 10.2 Rollback Procedure

If issues arise post-deployment:

1. Revert `src/app/page.tsx` to previous version
2. Keep new component files (they're not loaded in rollback state)
3. Verify tab-based navigation loads correctly
4. Document issues for post-mortem analysis

### 10.3 Feature Flags (Optional)

```typescript
// Environment variable in .env.local
NEXT_PUBLIC_USE_NEW_ASSESSMENT=true

// In page.tsx
const useNewAssessment = process.env.NEXT_PUBLIC_USE_NEW_ASSESSMENT === "true";

if (!useNewAssessment) {
  return <LegacyTabInterface />; // Fallback to old interface
}

// Render new interface
return <NewUnifiedAssessment />;
```

---

## Performance Considerations

### 11.1 Optimization Strategies

**Memoization:**
- Use `useMemo` for BP Grade calculation
- Use `useCallback` for event handlers to prevent unnecessary re-renders

```typescript
const bpGrade = useMemo(() => {
  return calculateBPGrade(assessment.sbp, assessment.dbp);
}, [assessment.sbp, assessment.dbp]);
```

**Code Splitting:**
- Load PregnancySafetyTool and DrugInteractionsTool dynamically

```typescript
import dynamic from "next/dynamic";

const PregnancySafetyTool = dynamic(
  () => import("@/components/PregnancySafetyTool"),
  { loading: () => <Skeleton /> }
);
```

**API Debouncing:**
- Debounce ML inference calls to avoid excessive API requests

```typescript
const debouncedMLInference = useMemo(
  () => debounce(triggerMLInference, 500),
  []
);
```

### 11.2 Bundle Size Impact

- New type files: ~2KB
- New medical-calcs: ~1.5KB
- Four new components: ~12KB
- **Total Estimated:** ~15.5KB (gzipped: ~4KB)

---

## Summary Table

| Task | Component/File | Effort | Dependencies |
|---|---|---|---|
| Type definitions | `assessment.ts`, `props.ts` | Low | None |
| Medical utils | `medical-calcs.ts` | Low | Types |
| Patient form | `PatientDetailsForm.tsx` | Medium | Types, UI |
| Clinical profile | `ClinicalProfileForm.tsx` | Low | Types, UI |
| Pregnancy section | `PregnancySection.tsx` | Medium | Types, UI |
| Drug interaction section | `DrugInteractionSection.tsx` | Medium | Types, UI |
| **[NEW]** Clinical protocols section | `ClinicalProtocolsSection.tsx` | Medium | Types, refactored tools |
| Refactor DrugInteractionsTool | Update existing | Medium | Types |
| **[NEW]** Refactor TreatmentPlansTool | Update existing | Medium | Types |
| **[NEW]** Refactor DrugDosingTool | Update existing | Medium | Types |
| **[NEW]** Refactor DrugClassesTool | Update existing | Medium | Types |
| Main page refactor | `page.tsx` | High | All above |
| Testing | Various | Medium | All above |

**Total Estimated Effort:** 16-20 hours (2.5-3 sprint days)

**Critical Changes from Original Spec:**
- ✅ Added Section 5 (Clinical Protocols) to prevent loss of existing tools
- ✅ Refactored all 4 existing tools to accept props and auto-trigger
- ✅ Updated API endpoint from `/api/predictions` to `/api/predictions-builtime`
- ✅ Added pregnancy warning in Section 5
- ✅ Added kidney status indicator in DrugDosingTool
