"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BPGradeResult, PatientAssessment } from "@/app/types/assessment";
import { TreatmentPlansTool } from "@/components/TreatmentPlansTool";
import { DrugClassesTool } from "@/components/DrugClassesTool";

interface ClinicalProtocolsSectionProps {
  bpGrade: BPGradeResult | null;
  age?: number | "";
  sbp?: number | "";
  dbp?: number | "";
  comorbidities: PatientAssessment["comorbidities"];
  isPregnant?: string;
  assessment?: PatientAssessment;
}

export const ClinicalProtocolsSection = ({
  bpGrade,
  age,
  sbp,
  dbp,
  comorbidities,
  isPregnant,
  assessment,
}: ClinicalProtocolsSectionProps) => {
  const isVisible = age !== "" && sbp !== "" && dbp !== "";

  if (!isVisible) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px bg-gray-200 flex-1" />
        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Clinical Protocols</span>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      {/* Combined Treatment Plan + Dosing Card */}
      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              5.1
            </span>
            Treatment Plan & Drug Dosing
          </CardTitle>
          <CardDescription>
            ML recommendations + dosing guidelines for BP Grade:{" "}
            <span className="font-semibold">{bpGrade?.grade}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TreatmentPlansTool
            prefilledAge={age !== undefined ? String(age) : undefined}
            prefilledSbp={sbp !== undefined ? String(sbp) : undefined}
            prefilledDbp={dbp !== undefined ? String(dbp) : undefined}
            prefilledBpGrade={bpGrade}
            patientAssessment={assessment}
            isDisabled={true}
          />
        </CardContent>
      </Card>

      {/* Drug Classes Card (Full Width) */}
      <Card className="shadow-sm border-l-4 border-l-emerald-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
              5.2
            </span>
            Available Drug Classes
          </CardTitle>
          <CardDescription>
            Comprehensive overview of antihypertensive medication classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DrugClassesTool
            prefilledAge={age !== undefined ? String(age) : undefined}
            prefilledSbp={sbp !== undefined ? String(sbp) : undefined}
            prefilledDbp={dbp !== undefined ? String(dbp) : undefined}
            patientAssessment={assessment}
            isDisabled={true}
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
};
