import { useState, useEffect } from "react";
import { treatmentPlansData, drugDosingData } from "@/data/drugData";
import { logPrediction } from "@/lib/logPrediction";
import { getBPDefinitionKey } from "@/lib/medical-calcs";
import { TreatmentPlansToolProps } from "@/app/types/props";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [sysBloodPressure, setSysBloodPressure] = useState(prefilledSbp ?? "");
  const [diaBloodPressure, setDiaBloodPressure] = useState(prefilledDbp ?? "");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Drug class/agent selection state
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [dosingResult, setDosingResult] = useState<any>(null);
  const [dosingReady, setDosingReady] = useState(false);
  const [dosingSaving, setDosingSaving] = useState(false);
  const [dosingSaved, setDosingSaved] = useState(false);

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

  // Drug class list
  const drugClasses = Object.keys(drugDosingData);
  const availableAgents = selectedClass
    ? Object.keys((drugDosingData[selectedClass as keyof typeof drugDosingData] || {}) as any)
    : [];

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
    setSelectedAgent("");
    setDosingResult(null);
    setDosingReady(false);
    setDosingSaved(false);
  };

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agent = e.target.value;
    setSelectedAgent(agent);
    if (selectedClass && agent) {
      const classData = drugDosingData[selectedClass as keyof typeof drugDosingData] as any;
      if (classData?.[agent]) {
        setDosingResult(classData[agent]);
        setDosingReady(true);
        setDosingSaved(false);
      } else {
        setDosingResult(null);
        setDosingReady(false);
      }
    }
  };

  // Call ML model ONLY when drug class + agent are both selected
  useEffect(() => {
    if (!age || !sysBloodPressure || !diaBloodPressure || !selectedClass || !selectedAgent) {
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
  }, [
    age, sysBloodPressure, diaBloodPressure,
    selectedClass, selectedAgent,
    patientAssessment?.isPregnant,
    patientAssessment?.comorbidities?.diabetes,
    patientAssessment?.comorbidities?.ckd,
    patientAssessment?.comorbidities?.heartCondition,
  ]);

  const handleSavePlan = async () => {
    if (!results) return;
    setSaving(true);
    try {
      await logPrediction({
        tool: "treatmentPlans",
        inputs: { bpDefinition: autoBpDefinition, drugClass: selectedClass, agent: selectedAgent },
        result: results,
        metadata: {
          patientDetails: patientAssessment ? {
            name: patientAssessment.name,
            aadhar: patientAssessment.aadhar,
            abha: patientAssessment.abha,
            mobile: patientAssessment.mobile,
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

  const handleSaveDosing = async () => {
    if (!dosingResult || !selectedClass || !selectedAgent) return;
    setDosingSaving(true);
    try {
      await logPrediction({
        tool: "drugDosing",
        inputs: { drugClass: selectedClass, agent: selectedAgent },
        result: dosingResult,
        metadata: {
          patientDetails: patientAssessment ? {
            name: patientAssessment.name,
            aadhar: patientAssessment.aadhar,
            abha: patientAssessment.abha,
            mobile: patientAssessment.mobile,
            age: patientAssessment.age,
            sbp: patientAssessment.sbp,
            dbp: patientAssessment.dbp,
            comorbidities: patientAssessment.comorbidities,
            isPregnant: patientAssessment.isPregnant,
            takingOtherDrugs: patientAssessment.takingOtherDrugs,
          } : undefined,
        },
      });
      setDosingSaved(true);
      setTimeout(() => setDosingSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save dosing", error);
    } finally {
      setDosingSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Select a drug class and agent, then the ML model will generate a personalised treatment plan + dosing.
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

      {/* Step 1: Select Drug Class + Agent */}
      <Card className="border-2 border-purple-200 bg-purple-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-purple-900">Step 1 — Select Drug Class &amp; Agent</CardTitle>
          <p className="text-xs text-purple-600">The ML plan will be generated once a class and agent are selected.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="drugClass" className="text-sm font-semibold">Drug Class</Label>
            <select
              id="drugClass"
              value={selectedClass}
              onChange={handleClassChange}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="" disabled>--- Select Drug Class ---</option>
              {drugClasses.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent" className="text-sm font-semibold">Drug Agent</Label>
            <select
              id="agent"
              value={selectedAgent}
              onChange={handleAgentChange}
              disabled={!selectedClass}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" disabled>--- Select Agent ---</option>
              {availableAgents.map((agent) => (
                <option key={agent} value={agent}>{agent}</option>
              ))}
            </select>
          </div>

          {!selectedClass && (
            <p className="text-xs text-purple-500 italic">Please select a drug class to unlock the agent picker and trigger ML analysis.</p>
          )}
          {selectedClass && !selectedAgent && (
            <p className="text-xs text-purple-500 italic">Now pick an agent to generate the ML-recommended treatment plan.</p>
          )}
        </CardContent>
      </Card>


      {/* Loading State */}
      {loading && (
        <Card className="p-8 bg-blue-50 border-blue-200 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-blue-600 mb-4 animate-spin" />
          <p className="text-blue-600 font-semibold text-center">Generating personalised treatment plan...</p>
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
              onClick={handleSavePlan}
              disabled={saving || saved}
              size="sm"
              variant="default"
              className="flex items-center gap-2"
            >
              {saved ? <><Check className="h-4 w-4" />Saved</> : <><SaveIcon className="h-4 w-4" />Save Result</>}
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

            {/* Dosing info embedded in the plan */}
            {dosingResult && (
              <>
                <hr className="my-4" />
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-700">💊 Selected Drug Dosing — {selectedAgent}</h4>
                  <Button
                    onClick={handleSaveDosing}
                    disabled={dosingSaving || dosingSaved}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2 text-green-700 border-green-300 hover:bg-green-100"
                  >
                    {dosingSaved ? <><Check className="h-4 w-4" />Saved</> : <><SaveIcon className="h-4 w-4" />Save Dosing</>}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mb-3">{selectedClass}</p>
                <div className="grid grid-cols-2 gap-4 text-sm bg-white/60 rounded-lg p-3">
                  <div>
                    <p className="text-gray-500 font-medium">Initial Dose</p>
                    <p className="font-semibold text-gray-900">{dosingResult.initial_dose}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Maintenance Dose</p>
                    <p className="font-semibold text-gray-900">{dosingResult.maintenance_dose}</p>
                  </div>
                </div>
                {dosingResult.notes && dosingResult.notes !== "N/A" && (
                  <div className="mt-3 text-sm">
                    <p className="text-gray-500 font-medium">Notes</p>
                    <p className="text-gray-800">{dosingResult.notes}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
