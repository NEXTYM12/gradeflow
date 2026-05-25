import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: userUni } = trpc.userUniversity.get.useQuery();
  const { data: gpaHistory } = trpc.gpa.getHistory.useQuery();
  const { data: degreeClass } = trpc.analytics.degreeClassification.useQuery();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [loading, user, setLocation]);

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
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">
            Track your academic progress and achieve your goals
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Current CGPA</p>
            <p className="text-3xl font-bold">
              {degreeClass?.cgpa ? (typeof degreeClass.cgpa === 'number' ? degreeClass.cgpa.toFixed(3) : parseFloat(degreeClass.cgpa as any).toFixed(3)) : "—"}
            </p>
            <p className="text-sm text-accent mt-2">
              {degreeClass?.classification || "Not calculated"}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Semesters</p>
            <p className="text-3xl font-bold">{gpaHistory?.length || 0}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {gpaHistory && gpaHistory.length > 0
                ? `Latest: ${gpaHistory[gpaHistory.length - 1].semester}`
                : "No semesters yet"}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Credits</p>
            <p className="text-3xl font-bold">
              {gpaHistory?.reduce((sum, h) => sum + h.totalCreditHours, 0) || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Credit hours</p>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="semesters">Semesters</TabsTrigger>
            <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">GPA Trend</h3>
              <p className="text-muted-foreground">
                Chart visualization coming soon
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="semesters" className="space-y-4">
            {gpaHistory && gpaHistory.length > 0 ? (
              gpaHistory.map((semester) => (
                <Card key={semester.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{semester.semester}</h4>
                      <p className="text-sm text-muted-foreground">
                        {semester.totalCreditHours} credit hours
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-accent">
                        {(typeof semester.gpa === 'number' ? semester.gpa : parseFloat(semester.gpa as any)).toFixed(3)}
                      </p>
                      <p className="text-sm text-muted-foreground">GPA</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">
                  No semesters recorded yet. Start by adding your courses.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="quick-actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-20" asChild>
                <a href="/courses">
                  <div className="text-left">
                    <p className="font-semibold">Add Courses</p>
                    <p className="text-sm text-muted-foreground">
                      Enter your semester courses
                    </p>
                  </div>
                </a>
              </Button>
              <Button variant="outline" className="h-20" asChild>
                <a href="/analytics">
                  <div className="text-left">
                    <p className="font-semibold">View Analytics</p>
                    <p className="text-sm text-muted-foreground">
                      See your performance insights
                    </p>
                  </div>
                </a>
              </Button>
              <Button variant="outline" className="h-20" asChild>
                <a href="/predictions">
                  <div className="text-left">
                    <p className="font-semibold">Predict Grades</p>
                    <p className="text-sm text-muted-foreground">
                      Plan your academic goals
                    </p>
                  </div>
                </a>
              </Button>
              <Button variant="outline" className="h-20" asChild>
                <a href="/ai-assistant">
                  <div className="text-left">
                    <p className="font-semibold">AI Assistant</p>
                    <p className="text-sm text-muted-foreground">
                      Get personalized advice
                    </p>
                  </div>
                </a>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
