"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PatientAssessment, BPGradeResult } from "@/app/types/assessment";

interface PatientDetailsFormProps {
  name: string;
  aadhar?: string;
  mobile?: string;
  age: number | "";
  dateOfBirth?: string;
  sbp: number | "";
  dbp: number | "";
  onUpdate: (field: string, value: any) => void;
  bpGrade?: BPGradeResult | null;
}

export const PatientDetailsForm = ({
  name,
  aadhar,
  mobile,
  age,
  dateOfBirth,
  sbp,
  dbp,
  onUpdate,
  bpGrade,
}: PatientDetailsFormProps) => {
  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "age" | "sbp" | "dbp"
  ) => {
    const value = e.target.value === "" ? "" : Number(e.target.value);

    if (field === "age") {
      onUpdate("age", e.target.value);
    } else if (field === "sbp" || field === "dbp") {
      onUpdate(field, e.target.value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Demographics Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Demographics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Patient Name *
            </Label>
            <Input
              id="name"
              placeholder="Full name"
              value={name}
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
              value={aadhar || ""}
              onChange={(e) =>
                onUpdate("aadhar", e.target.value || undefined)
              }
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
              value={mobile || ""}
              onChange={(e) =>
                onUpdate("mobile", e.target.value || undefined)
              }
              className="h-10"
              maxLength={10}
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-sm font-medium">
              Date of Birth
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth || ""}
              onChange={(e) =>
                onUpdate("dateOfBirth", e.target.value || undefined)
              }
              className="h-10"
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
              value={age}
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
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Blood Pressure
        </h3>
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
                value={sbp}
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
                value={dbp}
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
              <p className="text-xs text-gray-600 mt-2">
                {bpGrade.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
