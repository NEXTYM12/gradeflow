import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Analytics() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [semester, setSemester] = useState("2024-2025-1");

  const { data: gpaHistory } = trpc.gpa.getHistory.useQuery();
  const { data: performanceSummary } = trpc.analytics.performanceSummary.useQuery(semester);
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

  const chartData = gpaHistory?.map((h) => ({
    semester: h.semester,
    gpa: typeof h.gpa === 'number' ? h.gpa : parseFloat(h.gpa as any),
    cgpa: typeof h.cgpa === 'number' ? h.cgpa : parseFloat(h.cgpa as any),
  })) || [];

  const topCourses = performanceSummary?.topCourses || [];
  const bottomCourses = performanceSummary?.bottomCourses || [];

  const courseData = topCourses.map((course: any) => ({
    name: course.courseName.substring(0, 15),
    grade: typeof course.gradePoint === 'number' ? course.gradePoint : parseFloat(course.gradePoint as any),
  }));

  const colors = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Analytics & Insights</h1>
          <p className="text-muted-foreground">
            Visualize your academic performance and progress
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Current CGPA</p>
            <p className="text-3xl font-bold text-accent">
              {degreeClass?.cgpa ? (typeof degreeClass.cgpa === 'number' ? degreeClass.cgpa.toFixed(3) : parseFloat(degreeClass.cgpa as any).toFixed(3)) : "—"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {degreeClass?.classification}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Average Grade Point</p>
            <p className="text-3xl font-bold">
              {performanceSummary?.averageGradePoint?.toFixed(2) || "—"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {performanceSummary?.totalCourses || 0} courses
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Semesters</p>
            <p className="text-3xl font-bold">{gpaHistory?.length || 0}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Total academic history
            </p>
          </Card>
        </div>

        {/* GPA Trend */}
        {chartData.length > 0 && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">GPA Trend Over Semesters</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis domain={[0, 4]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="gpa"
                  stroke="#8b5cf6"
                  name="Semester GPA"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="cgpa"
                  stroke="#ec4899"
                  name="Cumulative GPA"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Course Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courseData.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Top Courses</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 4]} />
                  <Tooltip />
                  <Bar dataKey="grade" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {performanceSummary && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Performance Summary</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Best Course
                  </p>
                  <p className="font-semibold">
                    {topCourses[0]?.courseName || "—"}
                  </p>
                  <p className="text-sm text-accent">
                    Grade Point:{" "}
                    {typeof topCourses[0]?.gradePoint === 'number'
                      ? topCourses[0].gradePoint.toFixed(2)
                      : parseFloat(topCourses[0]?.gradePoint as any).toFixed(2)}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Needs Improvement
                  </p>
                  <p className="font-semibold">
                    {bottomCourses[0]?.courseName || "—"}
                  </p>
                  <p className="text-sm text-destructive">
                    Grade Point:{" "}
                    {typeof bottomCourses[0]?.gradePoint === 'number'
                      ? bottomCourses[0].gradePoint.toFixed(2)
                      : parseFloat(bottomCourses[0]?.gradePoint as any).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
