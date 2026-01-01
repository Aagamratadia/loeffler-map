import { useEffect, useState } from "react";
import { drugClassesData } from "@/data/drugData";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { logPrediction } from "@/lib/logPrediction";

export const DrugClassesTool = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [result, setResult] = useState<any>(null);

  const drugClasses = Object.keys(drugClassesData);
  const categories = selectedClass ? Object.keys(drugClassesData[selectedClass as keyof typeof drugClassesData]) : [];

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    setSelectedCategory("");
    setResult(null);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    if (value && selectedClass) {
      const data = drugClassesData[selectedClass as keyof typeof drugClassesData];
      setResult(data?.[value as keyof typeof data]);
    }
  };

  useEffect(() => {
    if (!result || !selectedClass || !selectedCategory) return;

    logPrediction({
      tool: "drugClasses",
      inputs: {
        drugClass: selectedClass,
        category: selectedCategory,
      },
      result,
    });
  }, [result, selectedClass, selectedCategory]);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card border-border shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="drugClass" className="text-sm font-semibold text-foreground">
              Select Drug Class/Subclass
            </Label>
            <div className="relative">
              <select
                id="drugClass"
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-10"
              >
                <option value="" disabled>--- Select Drug Class ---</option>
                {drugClasses.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-semibold text-foreground">
              Select Category
            </Label>
            <div className="relative">
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={!selectedClass}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-10"
              >
                <option value="" disabled>--- Select Category ---</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
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
              <p className="text-sm font-semibold text-muted-foreground mb-1">Specific Indication:</p>
              <p className="text-foreground leading-relaxed">{result.indication}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Contraindication / Caution:</p>
              <p className="text-foreground leading-relaxed">{result.contraindication}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
