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
    description:
      "Coronary artery disease, heart failure, arrhythmia, etc.",
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

export const ClinicalProfileForm = ({
  comorbidities,
  onUpdate,
}: ClinicalProfileFormProps) => {
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
              <p className="text-xs text-gray-500 mt-1">
                {option.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
