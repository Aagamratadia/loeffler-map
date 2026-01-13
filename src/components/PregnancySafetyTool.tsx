import { useEffect, useState } from "react";
import { pregnancySafetyData } from "@/data/drugData";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PregnancySafetyToolProps } from "@/app/types/props";
import { ChevronDown, SaveIcon, Check } from "lucide-react";
import { logPrediction } from "@/lib/logPrediction";

export const PregnancySafetyTool = ({
  onResultsUpdate,
  isDisabled,
}: PregnancySafetyToolProps) => {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const agents = Object.keys(pregnancySafetyData);

  const handleAgentChange = (value: string) => {
    setSelectedAgent(value);
    if (value) {
      const data = pregnancySafetyData[value as keyof typeof pregnancySafetyData];
      setResult(data || null);
      setSaved(false);
    }
  };

  useEffect(() => {
    if (!result || !selectedAgent) return;

    // Don't auto-save - wait for manual save button click
  }, [result, selectedAgent]);

  const handleSave = async () => {
    if (!result || !selectedAgent) return;
    setSaving(true);
    
    try {
      await logPrediction({
        tool: "pregnancySafety",
        inputs: { agent: selectedAgent },
        result,
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
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">
              Results
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
      )}}
    </div>
  );
};
