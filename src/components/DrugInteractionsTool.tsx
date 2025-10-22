import { useState } from "react";
import { drugInteractionsData } from "@/data/drugData";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";

export const DrugInteractionsTool = () => {
  const [selectedAgentA, setSelectedAgentA] = useState("");
  const [selectedAgentB, setSelectedAgentB] = useState("");
  const [result, setResult] = useState<any>(null);

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
      setResult(data[value as keyof typeof data]);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card border-border shadow-sm">
        <div className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="agentB" className="text-sm font-semibold text-foreground">
              Select Affected Class/Drug (B)
            </Label>
            <div className="relative">
              <select
                id="agentB"
                value={selectedAgentB}
                onChange={(e) => handleAgentBChange(e.target.value)}
                disabled={!selectedAgentA}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-10"
              >
                <option value="" disabled>--- Select Affected Class/Drug ---</option>
                {agentsB.map((agent) => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </Card>

      {result && (
        <Card className="p-6 bg-card border-border shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Results
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
