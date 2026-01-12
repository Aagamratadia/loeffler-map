"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { DrugInteractionsTool } from "@/components/DrugInteractionsTool";

interface DrugInteractionSectionProps {
  takingOtherDrugs: string;
  onUpdate: (value: string) => void;
  age?: number | "";
  sbp?: number | "";
  dbp?: number | "";
  mlReady?: boolean;
}

export const DrugInteractionSection = ({
  takingOtherDrugs,
  onUpdate,
  age,
  sbp,
  dbp,
  mlReady,
}: DrugInteractionSectionProps) => {
  return (
    <div className="space-y-4">
      {mlReady && (
        <Alert variant="default" className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-800">
            Patient vitals are complete. ML recommendations will load
            automatically when you indicate yes.
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
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <h4 className="font-semibold text-cyan-900 text-sm">
              Drug Interactions Assessment
            </h4>
            <p className="text-xs text-cyan-700">
              Check for potential interactions with recommended antihypertensive
              medications
            </p>
            <DrugInteractionsTool
              prefilledAge={age}
              prefilledSbp={sbp}
              prefilledDbp={dbp}
              isDisabled={mlReady}
            />
          </div>
        </div>
      )}
    </div>
  );
};
