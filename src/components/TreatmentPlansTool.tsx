import { useState, useEffect } from "react";
import { treatmentPlansData } from "@/data/drugData";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export const TreatmentPlansTool = () => {
  const [selectedBpDefinition, setSelectedBpDefinition] = useState("");
  const [selectedRiskCategory, setSelectedRiskCategory] = useState("");
  const [availableRiskCategories, setAvailableRiskCategories] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);

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

  useEffect(() => {
    if (selectedBpDefinition && selectedRiskCategory) {
      const data = treatmentPlansData[selectedBpDefinition as keyof typeof treatmentPlansData];
      if (data) {
        const result = data[selectedRiskCategory as keyof typeof data];
        setResults(result || null);
      }
    } else {
      setResults(null);
    }
  }, [selectedBpDefinition, selectedRiskCategory]);

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Select a BP definition and risk category to see the recommended treatment plan.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bpDefinition" className="text-sm font-semibold">
            Select Definition (BP Range)
          </Label>
          <select
            id="bpDefinition"
            value={selectedBpDefinition}
            onChange={(e) => setSelectedBpDefinition(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          >
            <option value="" disabled>
              --- Select BP Definition ---
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
            Select Risk Category
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

      {results && (
        <Card className="p-6 bg-muted/30 border-primary/20 animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-primary mb-4">Treatment Plan</h3>
          <div className="space-y-4">
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
          </div>
        </Card>
      )}
    </div>
  );
};
