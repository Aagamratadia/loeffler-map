import { useEffect, useState } from "react";
import { pregnancySafetyData } from "@/data/drugData";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PregnancySafetyToolProps } from "@/app/types/props";
import { ChevronDown } from "lucide-react";
import { logPrediction } from "@/lib/logPrediction";

export const PregnancySafetyTool = ({
  onResultsUpdate,
  isDisabled,
}: PregnancySafetyToolProps) => {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [result, setResult] = useState<any>(null);

  const agents = Object.keys(pregnancySafetyData);

  const handleAgentChange = (value: string) => {
    setSelectedAgent(value);
    if (value) {
      const data = pregnancySafetyData[value as keyof typeof pregnancySafetyData];
      setResult(data || null);
    }
  };

  useEffect(() => {
    if (!result || !selectedAgent) return;

    logPrediction({
      tool: "pregnancySafety",
      inputs: { agent: selectedAgent },
      result,
    });
  }, [result, selectedAgent]);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card border-border shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="pregAgent" className="text-sm font-semibold text-foreground">
            Select Drug Agent
          </Label>
          <div className="relative">
            <select
              id="pregAgent"
              value={selectedAgent}
              onChange={(e) => handleAgentChange(e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-10"
            >
              <option value="" disabled>--- Select Drug Agent ---</option>
              {agents.map((agent) => (
                <option key={agent} value={agent}>{agent}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </Card>

      {result && (
        <Card className="p-6 bg-card border-border shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Results
          </h3>
          <div className="space-y-4">
            {result.use_case !== "N/A" && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Primary Use Case:</p>
                <p className="text-foreground leading-relaxed">{result.use_case}</p>
              </div>
            )}
            {result.bp_target !== "N/A" && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">BP Level Target:</p>
                <p className="text-foreground leading-relaxed">{result.bp_target}</p>
              </div>
            )}
            {result.contraindication !== "N/A" && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Contraindication / Caution:</p>
                <p className="text-foreground leading-relaxed">{result.contraindication}</p>
              </div>
            )}
            {result.rationale !== "N/A" && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Rationale / Adverse Effect:</p>
                <p className="text-foreground leading-relaxed">{result.rationale}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
