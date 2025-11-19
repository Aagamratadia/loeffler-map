import { useState } from "react";
import { TreatmentPlansTool } from "@/components/TreatmentPlansTool";
import { DrugDosingTool } from "@/components/DrugDosingTool";
import { DrugClassesTool } from "@/components/DrugClassesTool";
import { PregnancySafetyTool } from "@/components/PregnancySafetyTool";
import { DrugInteractionsTool } from "@/components/DrugInteractionsTool";
import { Pill } from "lucide-react";
type TabType = "treatmentPlans" | "drugDosing" | "drugClasses" | "pregnancy" | "interactions";
const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("treatmentPlans");
  const tabs = [{
    id: "treatmentPlans" as TabType,
    label: "Treatment Plans"
  }, {
    id: "drugDosing" as TabType,
    label: "Drug Dosing"
  }, {
    id: "drugClasses" as TabType,
    label: "Antihypertensive Classes"
  }, {
    id: "pregnancy" as TabType,
    label: "Pregnancy Safety"
  }, {
    id: "interactions" as TabType,
    label: "Drug Interactions"
  }];
  return <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Pill className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Loeffler </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Professional reference for antihypertensive medications
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-border bg-muted/30">
            <div className="flex overflow-x-auto">
              {tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id ? "text-primary border-primary bg-background" : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"}`}>
                  {tab.label}
                </button>)}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "treatmentPlans" && <TreatmentPlansTool />}
            {activeTab === "drugDosing" && <DrugDosingTool />}
            {activeTab === "drugClasses" && <DrugClassesTool />}
            {activeTab === "pregnancy" && <PregnancySafetyTool />}
            {activeTab === "interactions" && <DrugInteractionsTool />}
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>For professional medical reference only. Always consult current clinical guidelines.</p>
        </footer>
      </main>
    </div>;
};
export default Index;