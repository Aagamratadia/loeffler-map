"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { PregnancySafetyTool } from "@/components/PregnancySafetyTool";

interface PregnancySectionProps {
  isPregnant: string;
  onUpdate: (value: string) => void;
  patientAge?: number | "";
}

export const PregnancySection = ({
  isPregnant,
  onUpdate,
  patientAge,
}: PregnancySectionProps) => {
  const showWarning =
    patientAge !== "" &&
    (Number(patientAge) < 10 || Number(patientAge) > 55);

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
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 text-sm">
              Pregnancy Safety Assessment
            </h4>
            <p className="text-xs text-purple-700">
              Review medication safety recommendations for pregnancy
            </p>
            <PregnancySafetyTool />
          </div>
        </div>
      )}
    </div>
  );
};
