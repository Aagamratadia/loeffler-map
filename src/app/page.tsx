"use client";

import { useState } from "react";
import { DrugClassesTool } from "@/components/DrugClassesTool";
import { DrugDosingTool } from "@/components/DrugDosingTool";
import { DrugInteractionsTool } from "@/components/DrugInteractionsTool";
import { PregnancySafetyTool } from "@/components/PregnancySafetyTool";
import { TreatmentPlansTool } from "@/components/TreatmentPlansTool";
import { HeartPulse, History, Activity, Beaker, Baby, AlertTriangle, FileText } from "lucide-react";
import Link from "next/link";

type TabType = "treatmentPlans" | "drugDosing" | "drugClasses" | "pregnancy" | "interactions";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("treatmentPlans");
  const tabs = [
    { 
      id: "treatmentPlans" as TabType, 
      label: "Treatment Plans",
      icon: FileText,
      description: "Evidence-based treatment protocols"
    },
    { 
      id: "drugDosing" as TabType, 
      label: "Drug Dosing",
      icon: Beaker,
      description: "Accurate dosing guidelines"
    },
    { 
      id: "drugClasses" as TabType, 
      label: "Drug Classes",
      icon: Activity,
      description: "Antihypertensive classifications"
    },
    { 
      id: "pregnancy" as TabType, 
      label: "Pregnancy Safety",
      icon: Baby,
      description: "Maternal-fetal considerations"
    },
    { 
      id: "interactions" as TabType, 
      label: "Drug Interactions",
      icon: AlertTriangle,
      description: "Important drug combinations"
    },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <HeartPulse className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Loeffler
                </h1>
                <p className="text-xs md:text-sm text-slate-600 hidden sm:block">
                  Clinical reference for antihypertensive medications
                </p>
              </div>
            </div>
            <Link
              href="/results"
              className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Saved Results</span>
              <span className="sm:hidden">Results</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
        {/* Tool Selection Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Select a Tool</h2>
          <p className="text-slate-600 mb-6">Choose from our comprehensive medical reference tools</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    isActive
                      ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  <div className={`inline-flex p-2 rounded-lg mb-3 ${
                    isActive ? "bg-blue-500" : "bg-slate-100 group-hover:bg-blue-100"
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      isActive ? "text-white" : "text-slate-600 group-hover:text-blue-600"
                    }`} />
                  </div>
                  <h3 className={`font-semibold text-sm mb-1 ${
                    isActive ? "text-blue-900" : "text-slate-800"
                  }`}>
                    {tab.label}
                  </h3>
                  <p className={`text-xs ${
                    isActive ? "text-blue-700" : "text-slate-600"
                  }`}>
                    {tab.description}
                  </p>
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Tool Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            {activeTabData && (
              <div className="flex items-center gap-3 text-white">
                <activeTabData.icon className="h-6 w-6" />
                <div>
                  <h2 className="text-xl font-bold">{activeTabData.label}</h2>
                  <p className="text-sm text-blue-100">{activeTabData.description}</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            {activeTab === "treatmentPlans" && <TreatmentPlansTool />}
            {activeTab === "drugDosing" && <DrugDosingTool />}
            {activeTab === "drugClasses" && <DrugClassesTool />}
            {activeTab === "pregnancy" && <PregnancySafetyTool />}
            {activeTab === "interactions" && <DrugInteractionsTool />}
          </div>
        </div>

        <footer className="mt-10 p-6 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900 mb-1">Medical Disclaimer</p>
              <p className="text-sm text-amber-800">
                For professional medical reference only. Always consult current clinical guidelines and verify with authoritative sources before clinical application.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default HomePage;
