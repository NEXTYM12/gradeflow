import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { z } from "zod";

// Validation schema
const scoreInputSchema = z.object({
  courseId: z.number().positive("Invalid course ID"),
  quiz: z
    .number()
    .min(0, "Quiz score cannot be negative")
    .max(100, "Quiz score cannot exceed 100")
    .optional(),
  assignment: z
    .number()
    .min(0, "Assignment score cannot be negative")
    .max(100, "Assignment score cannot exceed 100")
    .optional(),
  midsem: z
    .number()
    .min(0, "Midsem score cannot be negative")
    .max(100, "Midsem score cannot exceed 100")
    .optional(),
  exam: z
    .number()
    .min(0, "Exam score cannot be negative")
    .max(100, "Exam score cannot exceed 100")
    .optional(),
});

export default function Courses() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [semester, setSemester] = useState("S2024");
  const [courses, setCourses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    courseId: 0,
    quizScore: "",
    assignmentScore: "",
    midsemScore: "",
    examScore: "",
  });

  const { data: results } = trpc.result.getBySemester.useQuery(semester);
  const { data: semesters } = trpc.gpa.listSemesters.useQuery();
  const createResultMutation = trpc.result.create.useMutation();
  const deleteResultMutation = trpc.result.delete.useMutation();
  const deleteSemesterMutation = trpc.gpa.deleteSemester.useMutation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [loading, user, setLocation]);

  useEffect(() => {
    if (results) {
      setCourses(results);
    }
  }, [results]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.courseId) {
      errors.courseId = "Please select a course";
    }

    const scores = {
      quiz: formData.quizScore ? parseFloat(formData.quizScore) : undefined,
      assignment: formData.assignmentScore
        ? parseFloat(formData.assignmentScore)
        : undefined,
      midsem: formData.midsemScore ? parseFloat(formData.midsemScore) : undefined,
      exam: formData.examScore ? parseFloat(formData.examScore) : undefined,
    };

    // Validate score ranges
    if (scores.quiz !== undefined && (scores.quiz < 0 || scores.quiz > 100)) {
      errors.quizScore = "Quiz score must be between 0 and 100";
    }
    if (
      scores.assignment !== undefined &&
      (scores.assignment < 0 || scores.assignment > 100)
    ) {
      errors.assignmentScore = "Assignment score must be between 0 and 100";
    }
    if (
      scores.midsem !== undefined &&
      (scores.midsem < 0 || scores.midsem > 100)
    ) {
      errors.midsemScore = "Midsem score must be between 0 and 100";
    }
    if (scores.exam !== undefined && (scores.exam < 0 || scores.exam > 100)) {
      errors.examScore = "Exam score must be between 0 and 100";
    }

    // At least one score required
    if (
      !scores.quiz &&
      !scores.assignment &&
      !scores.midsem &&
      !scores.exam
    ) {
      errors.scores = "Please enter at least one score";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const scores = {
        quiz: formData.quizScore ? parseFloat(formData.quizScore) : undefined,
        assignment: formData.assignmentScore
          ? parseFloat(formData.assignmentScore)
          : undefined,
        midsem: formData.midsemScore ? parseFloat(formData.midsemScore) : undefined,
        exam: formData.examScore ? parseFloat(formData.examScore) : undefined,
      };

      await createResultMutation.mutateAsync({
        courseId: formData.courseId,
        semester,
        quiz: scores.quiz,
        assignment: scores.assignment,
        midsem: scores.midsem,
        exam: scores.exam,
      });

      toast.success("Course result added successfully");
      setFormData({
        courseId: 0,
        quizScore: "",
        assignmentScore: "",
        midsemScore: "",
        examScore: "",
      });
      setFormErrors({});
      setShowForm(false);
    } catch (error) {
      toast.error("Failed to add course result");
      console.error(error);
    }
  };

  const handleDeleteCourse = async (resultId: number) => {
    try {
      await deleteResultMutation.mutateAsync(resultId);
      toast.success("Course result deleted");
    } catch (error) {
      toast.error("Failed to delete course result");
    }
  };

  const handleDeleteSemester = async () => {
    if (!window.confirm(`Delete all results for ${semester}? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteSemesterMutation.mutateAsync(semester);
      toast.success("Semester deleted");
      setSemester("S2024");
    } catch (error) {
      toast.error("Failed to delete semester");
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
          <h1 className="text-4xl font-bold mb-2">Course Management</h1>
          <p className="text-muted-foreground">
            Add and manage your course results by semester
          </p>
        </div>

        <Tabs defaultValue="add" className="space-y-4">
          <TabsList>
            <TabsTrigger value="add">Add Course Result</TabsTrigger>
            <TabsTrigger value="view">View Results</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4">
            <Card className="p-6">
              <form onSubmit={handleAddCourse} className="space-y-6">
                {formErrors.scores && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formErrors.scores}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Input
                      id="semester"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      placeholder="e.g., S2024"
                      pattern="^[A-Z]\d{4}$"
                      title="Format: S2024 (Season + Year)"
                    />
                    {formErrors.semester && (
                      <p className="text-sm text-destructive mt-1">
                        {formErrors.semester}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="courseId">Course ID</Label>
                    <Input
                      id="courseId"
                      type="number"
                      value={formData.courseId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          courseId: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Enter course ID"
                    />
                    {formErrors.courseId && (
                      <p className="text-sm text-destructive mt-1">
                        {formErrors.courseId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quiz">Quiz Score (0-100)</Label>
                    <Input
                      id="quiz"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={formData.quizScore}
                      onChange={(e) =>
                        setFormData({ ...formData, quizScore: e.target.value })
                      }
                      placeholder="Optional"
                    />
                    {formErrors.quizScore && (
                      <p className="text-sm text-destructive mt-1">
                        {formErrors.quizScore}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="assignment">Assignment Score (0-100)</Label>
                    <Input
                      id="assignment"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={formData.assignmentScore}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assignmentScore: e.target.value,
                        })
                      }
                      placeholder="Optional"
                    />
                    {formErrors.assignmentScore && (
                      <p className="text-sm text-destructive mt-1">
                        {formErrors.assignmentScore}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="midsem">Midsem Score (0-100)</Label>
                    <Input
                      id="midsem"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={formData.midsemScore}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          midsemScore: e.target.value,
                        })
                      }
                      placeholder="Optional"
                    />
                    {formErrors.midsemScore && (
                      <p className="text-sm text-destructive mt-1">
                        {formErrors.midsemScore}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="exam">Exam Score (0-100)</Label>
                    <Input
                      id="exam"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={formData.examScore}
                      onChange={(e) =>
                        setFormData({ ...formData, examScore: e.target.value })
                      }
                      placeholder="Optional"
                    />
                    {formErrors.examScore && (
                      <p className="text-sm text-destructive mt-1">
                        {formErrors.examScore}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createResultMutation.isPending}
                  >
                    {createResultMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Course Result
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setFormErrors({});
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="view" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  Results for {semester}
                </h2>
                {courses.length > 0 && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeleteSemester}
                    disabled={deleteSemesterMutation.isPending}
                  >
                    {deleteSemesterMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Delete Semester</>
                    )}
                  </Button>
                )}
              </div>
              {semesters && semesters.length > 0 && (
                <div className="mb-4">
                  <Label>Select Semester</Label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    {semesters.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {courses.length > 0 ? (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                    >
                      <div>
                        <p className="font-semibold">
                          {course.courseName || "Unknown Course"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Grade: {course.grade} | Points: {course.gradePoint}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCourse(course.id)}
                        disabled={deleteResultMutation.isPending}
                      >
                        {deleteResultMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No results added for this semester yet
                </p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
