import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { drugDosingData } from "@/data/drugData";
import { logPrediction } from "@/lib/logPrediction";

export const DrugDosingTool = () => {
  const [age, setAge] = useState("");
  const [sysBloodPressure, setSysBloodPressure] = useState("");
  const [diaBloodPressure, setDiaBloodPressure] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mlResults, setMlResults] = useState<any>(null);

  const drugClasses = Object.keys(drugDosingData);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newClass = e.target.value;
    setSelectedClass(newClass);
    setSelectedAgent("");
    setResult(null);
  };

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agent = e.target.value;
    setSelectedAgent(agent);
    
    if (selectedClass && agent) {
      const classData = drugDosingData[selectedClass as keyof typeof drugDosingData] as any;
      if (classData?.[agent]) {
        setResult(classData[agent]);
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
            inputs: {
              age: parseFloat(age),
              init_sbp: parseFloat(sysBloodPressure),
              init_dbp: parseFloat(diaBloodPressure),
            },
          }),
        });

        const data = await response.json();
        
        // Add 2-second delay to show ML model is working
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (data.ok && data.result) {
          setMlResults({
            preferredDrugs: data.result.preferred_drugs || [],
            contraindicated: data.result.contraindicated_drugs || [],
            matchDistance: data.result.match_distance,
          });
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
  }, [age, sysBloodPressure, diaBloodPressure]);

  const availableAgents = selectedClass ? Object.keys((drugDosingData[selectedClass as keyof typeof drugDosingData] || {}) as any) : [];

  useEffect(() => {
    if (!result || !selectedClass || !selectedAgent) return;

    logPrediction({
      tool: "drugDosing",
      inputs: {
        drugClass: selectedClass,
        agent: selectedAgent,
      },
      result,
    });
  }, [result, selectedClass, selectedAgent]);

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
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
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
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
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
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
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
          <CardContent className="pt-6">
            <p className="text-blue-600 font-semibold">🔄 Computing personalized dosing recommendations...</p>
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
            <CardTitle className="text-primary">Dosing Information</CardTitle>
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
