import { useEffect, useState } from "react";
import { drugClassesData } from "@/data/drugData";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronDown, Loader2 } from "lucide-react";
import { logPrediction } from "@/lib/logPrediction";

export const DrugClassesTool = () => {
  const [age, setAge] = useState("");
  const [sysBloodPressure, setSysBloodPressure] = useState("");
  const [diaBloodPressure, setDiaBloodPressure] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mlResults, setMlResults] = useState<any>(null);

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
          {/* ML Inputs */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-blue-900">ML-Powered Classifications (Age + BP)</h3>
            
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

        {/* ML Loading State */}
        {loading && (
          <Card className="p-8 bg-blue-50 border-blue-200 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-blue-600 mb-4 animate-spin" />
            <p className="text-blue-600 font-semibold text-center">Classifying drugs for patient profile...</p>
            <p className="text-blue-500 text-sm text-center mt-2">Analyzing patient data with ML model</p>
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
            <h3 className="text-lg font-bold text-green-900 mb-4">✅ ML-Recommended Drug Classes</h3>
            <div className="space-y-4">
              {mlResults.preferredDrugs && (
                <div>
                  <p className="text-sm font-semibold text-green-900 mb-2">Recommended Drug Classes:</p>
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
                  <p className="text-sm font-semibold text-red-900 mb-2">Avoid These Classes:</p>
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
              Drug Class Information
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
