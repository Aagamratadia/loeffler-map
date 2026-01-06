import { useEffect, useState } from "react";
import { drugInteractionsData } from "@/data/drugData";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { logPrediction } from "@/lib/logPrediction";

export const DrugInteractionsTool = () => {
  const [age, setAge] = useState("");
  const [sysBloodPressure, setSysBloodPressure] = useState("");
  const [diaBloodPressure, setDiaBloodPressure] = useState("");
  const [selectedAgentA, setSelectedAgentA] = useState("");
  const [selectedAgentB, setSelectedAgentB] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mlResults, setMlResults] = useState<any>(null);

  const agentsA = Object.keys(drugInteractionsData);
  const agentsB = selectedAgentA ? Object.keys(drugInteractionsData[selectedAgentA as keyof typeof drugInteractionsData]) : [];

  const handleAgentAChange = (value: string) => {
    setSelectedAgentA(value);
    setSelectedAgentB("");
    setResult(null);
  };

  const handleAgentBChange = (value: string) => {
    setSelectedAgentB(value);
    if (value && selectedAgentA) {
      const data = drugInteractionsData[selectedAgentA as keyof typeof drugInteractionsData];
      setResult(data?.[value as keyof typeof data]);
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
            tool: "antihypertensive-recommender",
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

  useEffect(() => {
    if (!result || !selectedAgentA || !selectedAgentB) return;

    logPrediction({
      tool: "drugInteractions",
      inputs: {
        agentA: selectedAgentA,
        agentB: selectedAgentB,
      },
      result,
    });
  }, [result, selectedAgentA, selectedAgentB]);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card border-border shadow-sm">
        <div className="space-y-4">
          {/* ML Inputs */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-blue-900">ML-Powered Recommendations (Age + BP)</h3>
            
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
            <h3 className="font-semibold">Or Check Drug Interactions</h3>
            <div className="space-y-2">
              <Label htmlFor="agentA" className="text-sm font-semibold text-foreground">
                Select Primary Agent/Class (A)
              </Label>
              <div className="relative">
                <select
                  id="agentA"
                  value={selectedAgentA}
                  onChange={(e) => handleAgentAChange(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-10"
                >
                  <option value="" disabled>--- Select Primary Agent/Class ---</option>
                  {agentsA.map((agent) => (
                    <option key={agent} value={agent}>{agent}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ML Loading State */}
      {loading && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <p className="text-blue-600 font-semibold">🔄 Analyzing drug compatibility for patient...</p>
        </Card>
      )}

      {/* ML Error State */}
      {error && (
        <Card className="p-6 bg-amber-50 border-amber-200">
          <p className="text-amber-600 font-semibold">⚠️ {error}</p>
        </Card>
      )}

      {/* ML Results */}
      {mlResults && (
        <Card className="p-6 bg-green-50 border-green-200 animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-green-900 mb-4">✅ ML-Recommended Safe Drug Combinations</h3>
          <div className="space-y-4">
            {mlResults.preferredDrugs && (
              <div>
                <p className="text-sm font-semibold text-green-900 mb-2">Safe to Use Together:</p>
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
                <p className="text-sm font-semibold text-red-900 mb-2">Avoid These Combinations:</p>
                <div className="flex flex-wrap gap-2">
                  {mlResults.contraindicated.map((drug: string) => (
                    <span key={drug} className="px-3 py-1 bg-red-200 text-red-900 rounded-full text-sm font-medium">
                      {drug}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Standard Lookup Results */}
      {result && (
        <Card className="p-6 bg-card border-border shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Drug Interaction Details
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Interaction Type:</p>
              <p className="text-foreground leading-relaxed">{result.interaction_type}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Interaction Result:</p>
              <p className="text-foreground leading-relaxed">{result.interaction_result}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Detail / Rationale:</p>
              <p className="text-foreground leading-relaxed">{result.detail_rationale}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
