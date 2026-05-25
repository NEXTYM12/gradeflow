import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Predictions() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [targetCGPA, setTargetCGPA] = useState(3.5);
  const [upcomingCredits, setUpcomingCredits] = useState(12);
  const [prediction, setPrediction] = useState<any>(null);

  const { data: requiredScoreData, isLoading: requiredScoreLoading } = trpc.prediction.requiredScore.useQuery(
    { targetCGPA, upcomingCourseCredits: upcomingCredits },
    { enabled: false }
  );
  const { data: predictedCGPAData, isLoading: predictedCGPALoading } = trpc.prediction.predictedCGPA.useQuery(
    targetCGPA,
    { enabled: false }
  );

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [loading, user, setLocation]);

  const handleCalculateRequired = async () => {
    try {
      if (requiredScoreData) {
        setPrediction(requiredScoreData);
        toast.success("Prediction calculated");
      }
    } catch (error) {
      toast.error("Failed to calculate prediction");
    }
  };

  const handlePredictCGPA = async () => {
    try {
      if (predictedCGPAData) {
        setPrediction(predictedCGPAData);
        toast.success("CGPA prediction calculated");
      }
    } catch (error) {
      toast.error("Failed to predict CGPA");
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Academic Predictions</h1>
          <p className="text-muted-foreground">
            Forecast your grades and plan your academic goals
          </p>
        </div>

        {/* Required Score Calculator */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Required Score Calculator</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetCGPA">Target CGPA</Label>
                <Input
                  id="targetCGPA"
                  type="number"
                  step="0.1"
                  min="0"
                  max="4"
                  value={targetCGPA}
                  onChange={(e) => setTargetCGPA(parseFloat(e.target.value))}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Between 0.0 and 4.0
                </p>
              </div>
              <div>
                <Label htmlFor="upcomingCredits">Upcoming Course Credits</Label>
                <Input
                  id="upcomingCredits"
                  type="number"
                  value={upcomingCredits}
                  onChange={(e) =>
                    setUpcomingCredits(parseInt(e.target.value))
                  }
                  className="mt-2"
                />
              </div>
            </div>

            <Button onClick={handleCalculateRequired} disabled={requiredScoreLoading}>
              {requiredScoreLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Calculate Required Score"
              )}
            </Button>

            {prediction && (
              <div className="bg-accent/10 rounded-lg p-6 border border-accent/20">
                <h3 className="font-semibold mb-4">Results</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Required Average Score
                    </p>
                    <p className="text-2xl font-bold text-accent">
                      {prediction.requiredScore?.toFixed(2) || "—"}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Feasibility
                    </p>
                    <p className="font-semibold">
                      {prediction.isFeasible ? (
                        <span className="text-green-600">Achievable</span>
                      ) : (
                        <span className="text-destructive">Challenging</span>
                      )}
                    </p>
                  </div>
                  {prediction.recommendation && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Recommendation
                      </p>
                      <p className="text-sm">{prediction.recommendation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* CGPA Predictor */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">CGPA Predictor</h2>
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Predict your cumulative GPA if you achieve a specific average in
              upcoming courses.
            </p>

            <Button onClick={handlePredictCGPA} disabled={predictedCGPALoading}>
              {predictedCGPALoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Predicting...
                </>
              ) : (
                "Predict CGPA"
              )}
            </Button>

            {prediction?.predicted !== undefined && (
              <div className="bg-accent/10 rounded-lg p-6 border border-accent/20">
                <h3 className="font-semibold mb-4">Prediction Results</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current CGPA
                    </p>
                    <p className="text-2xl font-bold">
                      {prediction.current?.toFixed(3) || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Predicted CGPA
                    </p>
                    <p className="text-2xl font-bold text-accent">
                      {prediction.predicted?.toFixed(3) || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Improvement
                    </p>
                    <p className="text-lg font-semibold">
                      {(
                        (prediction.predicted - prediction.current) * 100
                      ).toFixed(2)}
                      %
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Degree Classification Guide */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Degree Classification Guide</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-accent/10 rounded">
              <span>First Class Honours</span>
              <span className="font-semibold">3.70 - 4.00</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded">
              <span>Second Class Upper</span>
              <span className="font-semibold">3.30 - 3.69</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-500/10 rounded">
              <span>Second Class Lower</span>
              <span className="font-semibold">2.70 - 3.29</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded">
              <span>Third Class</span>
              <span className="font-semibold">2.00 - 2.69</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-destructive/10 rounded">
              <span>Pass</span>
              <span className="font-semibold">1.00 - 1.99</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
