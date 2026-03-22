"use client";

import { useState, useMemo } from "react";
import { PatientDetailsForm } from "@/components/assessment/PatientDetailsForm";
import { ClinicalProfileForm } from "@/components/assessment/ClinicalProfileForm";
import { PregnancySection } from "@/components/assessment/PregnancySection";
import { DrugInteractionSection } from "@/components/assessment/DrugInteractionSection";
import { ClinicalProtocolsSection } from "@/components/assessment/ClinicalProtocolsSection";
import { PatientAssessment } from "@/app/types/assessment";
import { calculateBPGrade, validateAssessment, canRunMLModels, getAssessmentStatus } from "@/lib/medical-calcs";
import { HeartPulse, History, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const HomePage = () => {
  // Lifted state: Parent owns all patient assessment data
  const [assessment, setAssessment] = useState<PatientAssessment>({
    name: "",
    aadhar: "",
    abha: "",
    mobile: "",
    age: "",
    sbp: "",
    dbp: "",
    gender: "",
    comorbidities: {
      diabetes: false,
      heartCondition: false,
      ckd: false,
      other: false,
    },
    isPregnant: "",
    takingOtherDrugs: "",
  });

  // Memoize BP grade calculation
  const bpGrade = useMemo(() => {
    if (assessment.sbp !== "" && assessment.dbp !== "") {
      return calculateBPGrade(
        assessment.sbp,
        assessment.dbp
      );
    }
    return null;
  }, [assessment.sbp, assessment.dbp]);

  // Memoize ML readiness check
  const mlReady = useMemo(() => {
    return canRunMLModels(assessment);
  }, [assessment.age, assessment.sbp, assessment.dbp]);

  // Memoize validation status
  const validationStatus = useMemo(() => {
    return validateAssessment(assessment);
  }, [assessment]);
  // Memoize assessment status text
  const assessmentStatus = useMemo(() => {
    return getAssessmentStatus(assessment);
  }, [assessment]);

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
                  Loeffler Assessment
                </h1>
                <p className="text-xs md:text-sm text-slate-600 hidden sm:block">
                  Comprehensive hypertension management evaluation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200 border border-transparent hover:border-purple-200"
              >
                <span className="hidden sm:inline">Admin</span>
                <span className="sm:hidden">⚙️</span>
              </Link>
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-10 max-w-6xl">
        {/* Assessment Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Patient Assessment</h2>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              mlReady 
                ? "bg-green-100 text-green-800" 
                : "bg-amber-100 text-amber-800"
            }`}>
              {mlReady ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Ready for ML Analysis
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Complete vital signs
                </>
              )}
            </div>
          </div>
          <p className="text-slate-600">{assessmentStatus}</p>
        </div>

        {/* Section 1: Patient Details */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-800">Patient Details & Vital Signs</h3>
            {validationStatus.demographics && (
              <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
            )}
          </div>
          <PatientDetailsForm
            name={assessment.name}
            aadhar={assessment.aadhar}
            abha={assessment.abha}
            mobile={assessment.mobile}
            age={assessment.age}
            sbp={assessment.sbp}
            dbp={assessment.dbp}
            gender={assessment.gender}
            bpGrade={bpGrade}
            onUpdate={(field: string, value: any) => {
              setAssessment(prev => {
                const updated = { ...prev, [field]: value };
                // Reset pregnancy if gender changes away from female
                if (field === "gender" && value !== "female") {
                  updated.isPregnant = "";
                }
                return updated;
              });
            }}
          />
        </div>

        {/* Section 2: Clinical Profile */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-800">Clinical Profile</h3>
            {validationStatus.comorbidities && (
              <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
            )}
          </div>
          <ClinicalProfileForm
            comorbidities={assessment.comorbidities}
            onUpdate={(comorbidities) => {
              setAssessment(prev => ({
                ...prev,
                comorbidities,
              }));
            }}
          />
        </div>

        {/* Section 3: Pregnancy Safety (Female patients under 55 only) */}
        {assessment.gender === 'female' && assessment.age && parseFloat(assessment.age.toString()) < 55 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-800">Pregnancy Considerations</h3>
              {validationStatus.pregnancy && (
                <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </div>
            <PregnancySection
              isPregnant={assessment.isPregnant}
              patientAge={assessment.age}
              onUpdate={(value: string) => {
                setAssessment(prev => ({
                  ...prev,
                  isPregnant: value as "yes" | "no" | "",
                }));
              }}
            />
          </div>
        )}

        {/* Section 4: Drug Interactions (Conditional on mlReady) */}
        {mlReady && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                4
              </div>
              <h3 className="text-xl font-bold text-slate-800">Drug Interaction Assessment</h3>
            </div>
            <DrugInteractionSection
              takingOtherDrugs={assessment.takingOtherDrugs}
              age={assessment.age}
              sbp={assessment.sbp}
              dbp={assessment.dbp}
              mlReady={mlReady}
              onUpdate={(value: string) => {
                setAssessment(prev => ({
                  ...prev,
                  takingOtherDrugs: value as "yes" | "no" | "",
                }));
              }}
            />
          </div>
        )}

        {/* Section 5: Clinical Protocols (ML-Generated) */}
        {mlReady && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                5
              </div>
              <h3 className="text-xl font-bold text-slate-800">AI-Generated Clinical Protocols</h3>
            </div>
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Sections 5.1, 5.2, and 5.3 are automatically generated based on patient vitals and will populate once complete vital signs are provided.
              </AlertDescription>
            </Alert>
            <ClinicalProtocolsSection
              age={assessment.age}
              sbp={assessment.sbp}
              dbp={assessment.dbp}
              bpGrade={bpGrade}
              isPregnant={assessment.isPregnant}
              comorbidities={assessment.comorbidities}
              assessment={assessment}
            />
          </div>
        )}

        {/* Not Ready State */}
        {!mlReady && (
          <Card className="p-8 bg-amber-50 border-amber-200 text-center">
            <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-amber-900 mb-2">Complete Patient Vitals to Proceed</p>
            <p className="text-amber-800">
              Please enter age and blood pressure readings in Section 1 to unlock AI-powered clinical protocols and drug interaction analysis.
            </p>
          </Card>
        )}

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
