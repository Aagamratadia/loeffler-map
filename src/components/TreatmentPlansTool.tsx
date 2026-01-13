import { useState, useEffect } from "react";
import { treatmentPlansData } from "@/data/drugData";
import { logPrediction } from "@/lib/logPrediction";
import { TreatmentPlansToolProps } from "@/app/types/props";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, SaveIcon, Check } from "lucide-react";

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
  const [selectedBpDefinition, setSelectedBpDefinition] = useState("");
  const [selectedRiskCategory, setSelectedRiskCategory] = useState("");
  const [sysBloodPressure, setSysBloodPressure] = useState(prefilledSbp ?? "");
  const [diaBloodPressure, setDiaBloodPressure] = useState(prefilledDbp ?? "");
  const [availableRiskCategories, setAvailableRiskCategories] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync prefilled props to state
  useEffect(() => {
    if (prefilledAge !== undefined && prefilledAge !== age) {
      setAge(prefilledAge);
    }
  }, [prefilledAge, age]);

  useEffect(() => {
    if (prefilledSbp !== undefined && prefilledSbp !== sysBloodPressure) {
      setSysBloodPressure(prefilledSbp);
    }
  }, [prefilledSbp, sysBloodPressure]);

  useEffect(() => {
    if (prefilledDbp !== undefined && prefilledDbp !== diaBloodPressure) {
      setDiaBloodPressure(prefilledDbp);
    }
  }, [prefilledDbp, diaBloodPressure]);

  const bpDefinitions = Object.keys(treatmentPlansData);

  useEffect(() => {
    if (selectedBpDefinition) {
      const categories = Object.keys(treatmentPlansData[selectedBpDefinition as keyof typeof treatmentPlansData] || {});
      setAvailableRiskCategories(categories);
      setSelectedRiskCategory("");
      setResults(null);
    } else {
      setAvailableRiskCategories([]);
      setSelectedRiskCategory("");
      setResults(null);
    }
  }, [selectedBpDefinition]);

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
              age: age,
              init_sbp: sysBloodPressure,
              init_dbp: diaBloodPressure,
            },
          }),
        });

        const data = await response.json();
        
        // Add 2-second delay to show ML model is working
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (data.ok && data.result) {
          const resultsObj = {
            preferredDrugs: data.result.preferred_drugs || [],
            contraindicated: data.result.contraindicated_drugs || [],
            matchDistance: data.result.match_distance,
          };
          setResults(resultsObj);
          if (onResultsUpdate) {
            onResultsUpdate(resultsObj);
          }
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
  }, [age, sysBloodPressure, diaBloodPressure, onResultsUpdate]);

  // Also try static lookup if ML fails
  useEffect(() => {
    if (results) return; // ML results take priority

    if (selectedBpDefinition && selectedRiskCategory) {
      const data = treatmentPlansData[selectedBpDefinition as keyof typeof treatmentPlansData];
      if (data) {
        const staticResult = data[selectedRiskCategory as keyof typeof data];
        if (staticResult) {
          setResults(staticResult);
        }
      }
    }
  }, [selectedBpDefinition, selectedRiskCategory, results]);

  useEffect(() => {
    if (!results || !selectedBpDefinition || !selectedRiskCategory) return;

    // Don't auto-save - wait for manual save button click
  }, [results, selectedBpDefinition, selectedRiskCategory]);

  const handleSave = async () => {
    if (!results || !selectedBpDefinition || !selectedRiskCategory) return;
    setSaving(true);
    
    try {
      await logPrediction({
        tool: "treatmentPlans",
        inputs: {
          bpDefinition: selectedBpDefinition,
          riskCategory: selectedRiskCategory,
        },
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
        Enter patient age and blood pressure for ML-powered treatment recommendations.
      </p>

      <div className="space-y-4">
        {/* Age Input */}
        <div className="space-y-2">
          <Label htmlFor="age" className="text-sm font-semibold">
            Age (years)
          </Label>
          <input
            id="age"
            type="number"
            min="0"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter age"
            disabled={isDisabled}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Systolic BP Input */}
        <div className="space-y-2">
          <Label htmlFor="sysBP" className="text-sm font-semibold">
            Systolic BP (mmHg)
          </Label>
          <input
            id="sysBP"
            type="number"
            min="60"
            max="250"
            value={sysBloodPressure}
            onChange={(e) => setSysBloodPressure(e.target.value)}
            placeholder="Enter systolic BP"
            disabled={isDisabled}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Diastolic BP Input */}
        <div className="space-y-2">
          <Label htmlFor="diaBP" className="text-sm font-semibold">
            Diastolic BP (mmHg)
          </Label>
          <input
            id="diaBP"
            type="number"
            min="30"
            max="150"
            value={diaBloodPressure}
            onChange={(e) => setDiaBloodPressure(e.target.value)}
            placeholder="Enter diastolic BP"
            disabled={isDisabled}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Optional: Static lookup as fallback */}
        <div className="space-y-2">
          <Label htmlFor="bpDefinition" className="text-sm font-semibold">
            Select Definition (BP Range) - Optional
          </Label>
          <select
            id="bpDefinition"
            value={selectedBpDefinition}
            onChange={(e) => setSelectedBpDefinition(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          >
            <option value="" disabled>
              --- Select BP Definition (optional) ---
            </option>
            {bpDefinitions.map((def) => (
              <option key={def} value={def}>
                {def}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="riskCategory" className="text-sm font-semibold">
            Select Risk Category - Optional
          </Label>
          <select
            id="riskCategory"
            value={selectedRiskCategory}
            onChange={(e) => setSelectedRiskCategory(e.target.value)}
            disabled={!selectedBpDefinition}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="" disabled>
              --- Select Risk Category ---
            </option>
            {availableRiskCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="p-8 bg-blue-50 border-blue-200 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-blue-600 mb-4 animate-spin" />
          <p className="text-blue-600 font-semibold text-center">Generating personalized treatment plan...</p>
          <p className="text-blue-500 text-sm text-center mt-2">Analyzing patient data with ML model</p>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 bg-amber-50 border-amber-200">
          <p className="text-amber-600 font-semibold">⚠️ {error}</p>
        </Card>
      )}

      {/* ML Results */}
      {results && (results.preferredDrugs || results.therapy) && (
        <Card className="p-6 bg-green-50 border-green-200 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-900">
              ✅ ML-Recommended Treatment Plan
            </h3>
            <Button
              onClick={handleSave}
              disabled={saving || saved}
              size="sm"
              variant="default"
              className="flex items-center gap-2"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <SaveIcon className="h-4 w-4" />
                  Save Result
                </>
              )}
            </Button>
          </div>
          <div className="space-y-4">
            {/* ML-Generated Results */}
            {results.preferredDrugs && (
              <div>
                <span className="font-semibold text-green-900">Preferred Drugs (ML Recommended):</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {results.preferredDrugs.map((drug: string) => (
                    <span
                      key={drug}
                      className="px-3 py-1 bg-green-200 text-green-900 rounded-full text-sm font-medium"
                    >
                      {drug}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {results.contraindicated && (
              <div>
                <span className="font-semibold text-red-900">Contraindicated Drugs:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {results.contraindicated.map((drug: string) => (
                    <span
                      key={drug}
                      className="px-3 py-1 bg-red-200 text-red-900 rounded-full text-sm font-medium"
                    >
                      {drug}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {results.matchDistance !== undefined && (
              <div className="text-sm text-gray-600 mt-3">
                <p>Match confidence: {(100 - Math.min(results.matchDistance * 10, 50)).toFixed(0)}%</p>
              </div>
            )}

            {/* Static lookup results as secondary info */}
            {results.severity && (
              <>
                <hr className="my-4" />
                <h4 className="font-semibold text-gray-700 mb-3">Additional Clinical Guidelines:</h4>
                <div>
                  <span className="font-semibold text-foreground">Severity / Condition:</span>
                  <p className="text-muted-foreground mt-1">{results.severity}</p>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Treatment Initiation Criteria:</span>
                  <p className="text-muted-foreground mt-1">{results.initiation_criteria}</p>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Recommended Strategy:</span>
                  <p className="text-muted-foreground mt-1">{results.strategy}</p>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Initial / Add-On Therapy:</span>
                  <p className="text-muted-foreground mt-1">{results.therapy}</p>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Target BP:</span>
                  <p className="text-muted-foreground mt-1">{results.target_bp}</p>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Notes / Exceptions:</span>
                  <p className="text-muted-foreground mt-1">{results.notes}</p>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
