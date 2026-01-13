import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { drugDosingData } from "@/data/drugData";
import { logPrediction } from "@/lib/logPrediction";
import { DrugDosingToolProps } from "@/app/types/props";
import { Loader2, SaveIcon, Check } from "lucide-react";

export const DrugDosingTool = ({
  prefilledAge,
  prefilledSbp,
  prefilledDbp,
  prefilledKidneyStatus,
  patientAssessment,
  onResultsUpdate,
  isDisabled,
}: DrugDosingToolProps) => {
  const [age, setAge] = useState(prefilledAge ?? "");
  const [sysBloodPressure, setSysBloodPressure] = useState(prefilledSbp ?? "");
  const [diaBloodPressure, setDiaBloodPressure] = useState(prefilledDbp ?? "");
  const [kidneyStatus, setKidneyStatus] = useState(prefilledKidneyStatus ?? "normal");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mlResults, setMlResults] = useState<any>(null);
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

  useEffect(() => {
    if (prefilledKidneyStatus !== undefined && prefilledKidneyStatus !== kidneyStatus) {
      setKidneyStatus(prefilledKidneyStatus);
    }
  }, [prefilledKidneyStatus, kidneyStatus]);

  const drugClasses = Object.keys(drugDosingData);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newClass = e.target.value;
    setSelectedClass(newClass);
    setSelectedAgent("");
    setResult(null);
    setSaved(false);
  };

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agent = e.target.value;
    setSelectedAgent(agent);
    
    if (selectedClass && agent) {
      const classData = drugDosingData[selectedClass as keyof typeof drugDosingData] as any;
      if (classData?.[agent]) {
        setResult(classData[agent]);
        setSaved(false);
      } else {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  };

  // Call ML model when age and BP are provided
  useEffect(() => {
    if (!age || !sysBloodPressure || !diaBloodPressure) {
      setMlResults(null);
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
            tool: "drug-dosing",
            requestType: "drug_dosing",
            inputs: {
              age: age,
              init_sbp: sysBloodPressure,
              init_dbp: diaBloodPressure,
              kidney_status: kidneyStatus,
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
          setMlResults(resultsObj);
          if (onResultsUpdate) {
            onResultsUpdate(resultsObj);
          }
        } else {
          setError(data.error || "No prediction found");
          setMlResults(null);
        }
      } catch (err) {
        console.error("ML prediction error:", err);
        setError("Failed to get ML prediction");
        setMlResults(null);
      } finally {
        setLoading(false);
      }
    };

    callMLModel();
  }, [age, sysBloodPressure, diaBloodPressure, kidneyStatus, onResultsUpdate]);

  const availableAgents = selectedClass ? Object.keys((drugDosingData[selectedClass as keyof typeof drugDosingData] || {}) as any) : [];

  useEffect(() => {
    if (!result || !selectedClass || !selectedAgent) return;

    // Don't auto-save - wait for manual save button click
  }, [result, selectedClass, selectedAgent]);

  const handleSave = async () => {
    if (!result || !selectedClass || !selectedAgent) return;
    setSaving(true);
    
    try {
      await logPrediction({
        tool: "drugDosing",
        inputs: {
          drugClass: selectedClass,
          agent: selectedAgent,
        },
        result,
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
      <Card>
        <CardHeader>
          <CardTitle>Drug Dosing Guidelines</CardTitle>
          <CardDescription>
            Enter patient age & BP for ML-powered recommendations, or select drug class for standard guidelines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ML Inputs */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-blue-900">ML-Powered Dosing (Age + BP)</h3>
            
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
                disabled={isDisabled}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="sysBP" className="text-sm font-semibold">Systolic (mmHg)</Label>
                <input
                  id="sysBP"
                  type="number"
                  min="60"
                  max="250"
                  value={sysBloodPressure}
                  onChange={(e) => setSysBloodPressure(e.target.value)}
                  placeholder="Systolic"
                  disabled={isDisabled}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diaBP" className="text-sm font-semibold">Diastolic (mmHg)</Label>
                <input
                  id="diaBP"
                  type="number"
                  min="30"
                  max="150"
                  value={diaBloodPressure}
                  onChange={(e) => setDiaBloodPressure(e.target.value)}
                  placeholder="Diastolic"
                  disabled={isDisabled}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kidneyStatus" className="text-sm font-semibold">Kidney Status</Label>
              <select
                id="kidneyStatus"
                value={kidneyStatus}
                onChange={(e) => setKidneyStatus(e.target.value as "normal" | "mild" | "moderate" | "severe")}
                disabled={isDisabled}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="normal">Normal</option>
                <option value="mild">Mild CKD</option>
                <option value="moderate">Moderate CKD</option>
                <option value="severe">Severe CKD</option>
              </select>
            </div>
          </div>

          {/* Standard Lookup */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold">Or Browse Drug Classes</h3>
            <div className="space-y-2">
              <Label htmlFor="drugClass">Select Drug Class</Label>
              <select
                id="drugClass"
                value={selectedClass}
                onChange={handleClassChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="" disabled>--- Select Drug Class ---</option>
                {drugClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent">Select Agent</Label>
              <select
                id="agent"
                value={selectedAgent}
                onChange={handleAgentChange}
                disabled={!selectedClass}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>--- Select Agent ---</option>
                {availableAgents.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ML Loading State */}
      {loading && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-8 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-blue-600 mb-4 animate-spin" />
            <p className="text-blue-600 font-semibold text-center">Computing personalized dosing recommendations...</p>
            <p className="text-blue-500 text-sm text-center mt-2">Analyzing patient data with ML model</p>
          </CardContent>
        </Card>
      )}

      {/* ML Error State */}
      {error && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <p className="text-amber-600 font-semibold">⚠️ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* ML Results */}
      {mlResults && (
        <Card className="bg-green-50 border-green-200 animate-in fade-in duration-300">
          <CardHeader>
            <CardTitle className="text-green-900">✅ ML-Recommended Drugs for Patient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mlResults.preferredDrugs && (
              <div>
                <p className="text-sm font-semibold text-green-900 mb-2">Preferred Drugs:</p>
                <div className="flex flex-wrap gap-2">
                  {mlResults.preferredDrugs.map((drug: string) => (
                    <span key={drug} className="px-3 py-1 bg-green-200 text-green-900 rounded-full text-sm font-medium">
                      {drug}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {mlResults.contraindicated && (
              <div>
                <p className="text-sm font-semibold text-red-900 mb-2">Contraindicated:</p>
                <div className="flex flex-wrap gap-2">
                  {mlResults.contraindicated.map((drug: string) => (
                    <span key={drug} className="px-3 py-1 bg-red-200 text-red-900 rounded-full text-sm font-medium">
                      {drug}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Standard Lookup Results */}
      {result && (
        <Card className="animate-in fade-in-50 duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary">Dosing Information</CardTitle>
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
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Initial Dose</p>
                <p className="text-base font-semibold">{result.initial_dose}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Maintenance Dose</p>
                <p className="text-base font-semibold">{result.maintenance_dose}</p>
              </div>
            </div>
            {result.notes && result.notes !== "N/A" && (
              <div className="space-y-1 pt-2 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="text-base">{result.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
