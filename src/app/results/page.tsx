"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeartPulse, Calendar, ArrowLeft, Printer, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import Link from "next/link";

type Prediction = {
  _id: string;
  tool: string;
  inputs: Record<string, any>;
  result: any;
  metadata?: {
    patientDetails?: {
      name?: string;
      aadhar?: string;
      abha?: string;
      mobile?: string;
      age?: string;
      sbp?: string;
      dbp?: string;
      comorbidities?: Record<string, boolean>;
      isPregnant?: string;
      takingOtherDrugs?: string;
    };
  };
  createdAt: string;
};

const toolNames: Record<string, string> = {
  treatmentPlans: "Treatment Plans",
  drugDosing: "Drug Dosing",
  drugClasses: "Antihypertensive Classes",
  pregnancySafety: "Pregnancy Safety",
  drugInteractions: "Drug Interactions",
};

const ResultsPage = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [filteredPredictions, setFilteredPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch("/api/predictions");
        if (!response.ok) throw new Error("Failed to fetch results");
        const data = await response.json();
        setPredictions(data.predictions || []);
        setFilteredPredictions(data.predictions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  useEffect(() => {
    if (!predictions.length) return;

    let filtered = [...predictions];

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((p) => new Date(p.createdAt) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((p) => new Date(p.createdAt) <= end);
    }

    setFilteredPredictions(filtered);
  }, [predictions, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this result? This action cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/predictions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete result");
      }

      // Remove from both lists
      setPredictions(prev => prev.filter(p => p._id !== id));
      setFilteredPredictions(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete result");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const renderInputs = (inputs: Record<string, any>) => {
    return Object.entries(inputs)
      .filter(([_, value]) => value)
      .map(([key, value]) => (
        <div key={key} className="text-sm">
          <span className="font-medium capitalize">
            {key.replace(/([A-Z])/g, " $1").trim()}:
          </span>{" "}
          <span className="text-muted-foreground">{String(value)}</span>
        </div>
      ));
  };

  const renderResult = (result: any) => {
    if (typeof result === "object" && result !== null) {
      return (
        <div className="space-y-2 mt-3">
          {Object.entries(result).map(([key, value]) => (
            <div key={key} className="text-sm">
              <span className="font-medium capitalize">
                {key.replace(/_/g, " ")}:
              </span>{" "}
              <span className="text-muted-foreground">{String(value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-sm text-muted-foreground mt-3">{String(result)}</p>;
  };

  const renderPatientDetails = (patientDetails: any) => {
    if (!patientDetails) return null;

    const comorbidities = patientDetails.comorbidities 
      ? Object.entries(patientDetails.comorbidities)
          .filter(([_, value]) => value)
          .map(([key, _]) => key.replace(/([A-Z])/g, " $1").trim())
          .join(", ")
      : "None";

    return (
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <HeartPulse className="h-4 w-4" />
          Patient Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {patientDetails.name && (
            <div className="text-sm">
              <span className="font-medium text-blue-900">Name:</span>{" "}
              <span className="text-blue-700">{patientDetails.name}</span>
            </div>
          )}
          {patientDetails.aadhar && (
            <div className="text-sm">
              <span className="font-medium text-blue-900">Aadhar:</span>{" "}
              <span className="text-blue-700">{patientDetails.aadhar}</span>
            </div>
          )}
          {patientDetails.abha && (
            <div className="text-sm">
              <span className="font-medium text-blue-900">ABHA:</span>{" "}
              <span className="text-blue-700">{patientDetails.abha}</span>
            </div>
          )}
          {patientDetails.mobile && (
            <div className="text-sm">
              <span className="font-medium text-blue-900">Mobile:</span>{" "}
              <span className="text-blue-700">{patientDetails.mobile}</span>
            </div>
          )}

          {patientDetails.age && (
            <div className="text-sm">
              <span className="font-medium text-blue-900">Age:</span>{" "}
              <span className="text-blue-700">{patientDetails.age} years</span>
            </div>
          )}
          {(patientDetails.sbp || patientDetails.dbp) && (
            <div className="text-sm">
              <span className="font-medium text-blue-900">Blood Pressure:</span>{" "}
              <span className="text-blue-700">{patientDetails.sbp}/{patientDetails.dbp} mmHg</span>
            </div>
          )}
          {comorbidities !== "None" && (
            <div className="text-sm col-span-full">
              <span className="font-medium text-blue-900">Comorbidities:</span>{" "}
              <span className="text-blue-700">{comorbidities}</span>
            </div>
          )}
          {patientDetails.isPregnant && (
            <div className="text-sm">
              <span className="font-medium text-blue-900">Pregnant:</span>{" "}
              <span className="text-blue-700">{patientDetails.isPregnant}</span>
            </div>
          )}
          {patientDetails.takingOtherDrugs && (
            <div className="text-sm">
              <span className="font-medium text-blue-900">Taking Other Drugs:</span>{" "}
              <span className="text-blue-700">{patientDetails.takingOtherDrugs}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <HeartPulse className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Saved Results
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                View your saved predictions and queries
              </p>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              {filteredPredictions.length > 0 && (
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  Print All
                </button>
              )}
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Date Filters */}
        {!loading && !error && predictions.length > 0 && (
          <Card className="p-6 mb-6 print:hidden">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filter by Date Range
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            {(startDate || endDate) && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredPredictions.length} of {predictions.length} results
                </p>
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </Card>
        )}
        
        {loading && (
          <div className="text-center text-muted-foreground py-12">
            Loading results...
          </div>
        )}

        {error && (
          <Card className="p-6 bg-destructive/10 border-destructive/20">
            <p className="text-destructive font-medium">{error}</p>
          </Card>
        )}

        {!loading && !error && predictions.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              No saved results yet. Start using the tools to generate predictions.
            </p>
            <Link
              href="/"
              className="inline-block mt-4 text-primary hover:underline"
            >
              Go to Tools
            </Link>
          </Card>
        )}

        {!loading && !error && predictions.length > 0 && filteredPredictions.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              No results found for the selected date range.
            </p>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="inline-block mt-4 text-primary hover:underline"
            >
              Clear Filters
            </button>
          </Card>
        )}

        {!loading && !error && filteredPredictions.length > 0 && (
          <div className="space-y-4">
            {filteredPredictions.map((prediction) => (
              <Card key={prediction._id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-primary border-primary">
                      {toolNames[prediction.tool] || prediction.tool}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(prediction.createdAt)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(prediction._id)}
                    disabled={deletingId === prediction._id}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {/* Patient Details */}
                  {prediction.metadata?.patientDetails && (
                    <div>
                      {renderPatientDetails(prediction.metadata.patientDetails)}
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Inputs</h3>
                    <div className="space-y-1 pl-3 border-l-2 border-muted">
                      {renderInputs(prediction.inputs)}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Result</h3>
                    <div className="pl-3 border-l-2 border-primary/30">
                      {renderResult(prediction.result)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ResultsPage;
