import { useState, useEffect } from "react";
import { treatmentPlansData } from "@/data/drugData";
import { logPrediction } from "@/lib/logPrediction";
import { getBPDefinitionKey } from "@/lib/medical-calcs";
import { TreatmentPlansToolProps } from "@/app/types/props";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, SaveIcon, Check } from "lucide-react";
import { DrugDosingTool } from "@/components/DrugDosingTool";

export const TreatmentPlansTool = ({
  prefilledAge,
  prefilledSbp,
  prefilledDbp,
  prefilledBpGrade,
  patientAssessment,
  onResultsUpdate,
  isDisabled,
}: TreatmentPlansToolProps) => {
  const [age, setAge] = useState(prefilledAge ?? "");
  const [sysBloodPressure, setSysBloodPressure] = useState(prefilledSbp ?? "");
  const [diaBloodPressure, setDiaBloodPressure] = useState(prefilledDbp ?? "");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync prefilled props to state
  useEffect(() => {
    if (prefilledAge !== undefined && prefilledAge !== age) setAge(prefilledAge);
  }, [prefilledAge]);

  useEffect(() => {
    if (prefilledSbp !== undefined && prefilledSbp !== sysBloodPressure) setSysBloodPressure(prefilledSbp);
  }, [prefilledSbp]);

  useEffect(() => {
    if (prefilledDbp !== undefined && prefilledDbp !== diaBloodPressure) setDiaBloodPressure(prefilledDbp);
  }, [prefilledDbp]);

  // Auto-derive BP definition from SBP/DBP
  const autoBpDefinition = getBPDefinitionKey(
    sysBloodPressure === "" ? "" : Number(sysBloodPressure),
    diaBloodPressure === "" ? "" : Number(diaBloodPressure)
  );

  // Get available risk categories for the auto-detected BP range
  const availableRiskCategories = autoBpDefinition
    ? Object.keys(treatmentPlansData[autoBpDefinition as keyof typeof treatmentPlansData] || {})
    : [];

  // Call ML model when age and BP are provided
  useEffect(() => {
    if (!age || !sysBloodPressure || !diaBloodPressure) {
      setResults(null);
      return;
    }

    const callMLModel = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/predictions-builtime", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tool: "antihypertensive-recommender",
            requestType: "treatment_plan",
            inputs: {
              age: Number(age),
              init_sbp: Number(sysBloodPressure),
              init_dbp: Number(diaBloodPressure),
              // Pass comorbidities for meaningful variation
              diabetes: patientAssessment?.comorbidities?.diabetes ? 1 : 0,
              chronic_kidney_disease: patientAssessment?.comorbidities?.ckd ? 1 : 0,
              heart_failure: patientAssessment?.comorbidities?.heartCondition ? 1 : 0,
              is_pregnant: patientAssessment?.isPregnant === "yes" ? 1 : 0,
            },
          }),
        });

        const data = await response.json();
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (data.ok && data.result) {
          const resultsObj = {
            preferredDrugs: data.result.preferred_drugs || [],
            contraindicated: data.result.contraindicated_drugs || [],
            matchDistance: data.result.match_distance,
            // Also include first static result for additional guidelines
            ...(() => {
              if (autoBpDefinition && availableRiskCategories.length > 0) {
                const defData = treatmentPlansData[autoBpDefinition as keyof typeof treatmentPlansData];
                return defData ? defData[availableRiskCategories[0] as keyof typeof defData] : {};
              }
              return {};
            })(),
          };
          setResults(resultsObj);
          if (onResultsUpdate) onResultsUpdate(resultsObj);
        } else {
          setError(data.error || "No prediction found");
          setResults(null);
        }
      } catch (err) {
        console.error("ML prediction error:", err);
        setError("Failed to get ML prediction");
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    callMLModel();
  }, [age, sysBloodPressure, diaBloodPressure,
    patientAssessment?.isPregnant,
    patientAssessment?.comorbidities?.diabetes,
    patientAssessment?.comorbidities?.ckd,
    patientAssessment?.comorbidities?.heartCondition,
  ]);

  const handleSave = async () => {
    if (!results) return;
    setSaving(true);
    try {
      await logPrediction({
        tool: "treatmentPlans",
        inputs: { bpDefinition: autoBpDefinition },
        result: results,
        metadata: {
          patientDetails: patientAssessment ? {
            name: patientAssessment.name,
            aadhar: patientAssessment.aadhar,
            mobile: patientAssessment.mobile,
            dateOfBirth: patientAssessment.dateOfBirth,
            age: patientAssessment.age,
            sbp: patientAssessment.sbp,
            dbp: patientAssessment.dbp,
            comorbidities: patientAssessment.comorbidities,
            isPregnant: patientAssessment.isPregnant,
            takingOtherDrugs: patientAssessment.takingOtherDrugs,
          } : undefined,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        ML-powered treatment and dosing recommendations based on patient vitals.
      </p>

      {/* Auto-detected BP Range Badge */}
      {autoBpDefinition && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Auto-detected BP Range</p>
          <p className="text-sm font-medium text-blue-900">{autoBpDefinition}</p>
          {availableRiskCategories.length > 0 && (
            <p className="text-xs text-blue-600 mt-1">
              Applicable scenario: {availableRiskCategories.join(" · ")}
            </p>
          )}
        </div>
      )}

      {/* Hidden inputs when disabled – values come from parent */}
      {!isDisabled && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm font-semibold">Age (years)</Label>
            <input
              id="age"
              type="number"
              min="0"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter age"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sysBP" className="text-sm font-semibold">Systolic BP (mmHg)</Label>
              <input
                id="sysBP"
                type="number"
                value={sysBloodPressure}
                onChange={(e) => setSysBloodPressure(e.target.value)}
                placeholder="SBP"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diaBP" className="text-sm font-semibold">Diastolic BP (mmHg)</Label>
              <input
                id="diaBP"
                type="number"
                value={diaBloodPressure}
                onChange={(e) => setDiaBloodPressure(e.target.value)}
                placeholder="DBP"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="p-8 bg-blue-50 border-blue-200 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-blue-600 mb-4 animate-spin" />
          <p className="text-blue-600 font-semibold text-center">Generating treatment plan + dosing...</p>
          <p className="text-blue-500 text-sm text-center mt-2">Analysing patient data with ML model</p>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 bg-amber-50 border-amber-200">
          <p className="text-amber-600 font-semibold">⚠️ {error}</p>
        </Card>
      )}

      {/* ML Results — Treatment Plan */}
      {results && (results.preferredDrugs || results.therapy) && (
        <Card className="p-6 bg-green-50 border-green-200 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-900">✅ ML-Recommended Treatment Plan</h3>
            <Button
              onClick={handleSave}
              disabled={saving || saved}
              size="sm"
              variant="default"
              className="flex items-center gap-2"
            >
              {saved ? (
                <><Check className="h-4 w-4" />Saved</>
              ) : (
                <><SaveIcon className="h-4 w-4" />Save Result</>
              )}
            </Button>
          </div>
          <div className="space-y-4">
            {results.preferredDrugs && (
              <div>
                <span className="font-semibold text-green-900">Preferred Drugs (ML Recommended):</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {results.preferredDrugs.map((drug: string) => (
                    <span key={drug} className="px-3 py-1 bg-green-200 text-green-900 rounded-full text-sm font-medium">
                      {drug}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {results.contraindicated && results.contraindicated.length > 0 && (
              <div>
                <span className="font-semibold text-red-900">Contraindicated Drugs:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {results.contraindicated.map((drug: string) => (
                    <span key={drug} className="px-3 py-1 bg-red-200 text-red-900 rounded-full text-sm font-medium">
                      {drug}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {results.matchDistance !== undefined && (
              <p className="text-sm text-gray-600">
                Match confidence: {(100 - Math.min(results.matchDistance * 10, 50)).toFixed(0)}%
              </p>
            )}
            {results.severity && (
              <>
                <hr className="my-4" />
                <h4 className="font-semibold text-gray-700 mb-3">Clinical Guideline Details:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {[
                    ["Severity", results.severity],
                    ["Initiation Criteria", results.initiation_criteria],
                    ["Strategy", results.strategy],
                    ["Therapy", results.therapy],
                    ["Target BP", results.target_bp],
                    ["Notes", results.notes],
                  ].map(([label, value]) => value && (
                    <div key={label}>
                      <span className="font-semibold text-gray-700">{label}:</span>
                      <p className="text-gray-600 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Dosing section merged in */}
      <div className="border-t pt-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">💊 Drug Dosing Guidelines</h3>
        <DrugDosingTool
          prefilledAge={age || undefined}
          prefilledSbp={sysBloodPressure || undefined}
          prefilledDbp={diaBloodPressure || undefined}
          prefilledKidneyStatus={patientAssessment?.comorbidities?.ckd ? "severe" : "normal"}
          patientAssessment={patientAssessment}
          isDisabled={isDisabled}
          hideMlSection={true}
        />
      </div>
    </div>
  );
};
