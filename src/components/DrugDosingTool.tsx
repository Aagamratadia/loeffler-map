import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { drugDosingData } from "@/data/drugData";
import { logPrediction } from "@/lib/logPrediction";

export const DrugDosingTool = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [result, setResult] = useState<any>(null);

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
    
    if (selectedClass && agent && drugDosingData[selectedClass as keyof typeof drugDosingData]?.[agent as any]) {
      setResult(drugDosingData[selectedClass as keyof typeof drugDosingData][agent as any]);
    } else {
      setResult(null);
    }
  };

  const availableAgents = selectedClass ? Object.keys(drugDosingData[selectedClass as keyof typeof drugDosingData] || {}) : [];

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
            Select a drug class and specific agent to view dosing recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

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
