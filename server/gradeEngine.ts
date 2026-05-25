import { University } from "../drizzle/schema";

export interface GradingScale {
  minScore: number;
  maxScore: number;
  grade: string;
  gradePoint: number;
}

export interface ClassificationThresholds {
  firstClass: number;
  secondUpper: number;
  secondLower: number;
  third: number;
  pass: number;
}

/**
 * Calculate grade and grade point from total score
 */
export function calculateGrade(
  totalScore: number,
  gradingScale: GradingScale[]
): { grade: string; gradePoint: number } {
  const scale = gradingScale.sort((a, b) => b.minScore - a.minScore);
  
  for (const range of scale) {
    if (totalScore >= range.minScore && totalScore <= range.maxScore) {
      return {
        grade: range.grade,
        gradePoint: range.gradePoint,
      };
    }
  }

  // Default to F if no match
  return { grade: "F", gradePoint: 0.0 };
}

/**
 * Calculate total score from individual components
 * Supports different weighting schemes
 */
export function calculateTotalScore(
  quizScore?: number,
  assignmentScore?: number,
  midsemScore?: number,
  examScore?: number
): number {
  // Default weighting: Quiz 10%, Assignment 10%, Midsem 30%, Exam 50%
  let total = 0;
  let maxWeight = 0;

  if (quizScore !== undefined && quizScore !== null) {
    total += quizScore * 0.1;
    maxWeight += 0.1;
  }

  if (assignmentScore !== undefined && assignmentScore !== null) {
    total += assignmentScore * 0.1;
    maxWeight += 0.1;
  }

  if (midsemScore !== undefined && midsemScore !== null) {
    total += midsemScore * 0.3;
    maxWeight += 0.3;
  }

  if (examScore !== undefined && examScore !== null) {
    total += examScore * 0.5;
    maxWeight += 0.5;
  }

  // If not all components provided, scale up to 100
  if (maxWeight > 0 && maxWeight < 1) {
    total = total / maxWeight;
  }

  return Math.round(total * 100) / 100;
}

/**
 * Calculate GPA for a semester
 * GPA = Σ(Grade Point × Credit Hours) / Σ(Credit Hours)
 */
export function calculateSemesterGPA(
  courseResults: Array<{
    gradePoint: number;
    creditHours: number;
  }>
): number {
  if (courseResults.length === 0) return 0;

  let totalGradePoints = 0;
  let totalCreditHours = 0;

  for (const result of courseResults) {
    totalGradePoints += result.gradePoint * result.creditHours;
    totalCreditHours += result.creditHours;
  }

  if (totalCreditHours === 0) return 0;

  const gpa = totalGradePoints / totalCreditHours;
  return Math.round(gpa * 1000) / 1000;
}

/**
 * Calculate CGPA across all semesters
 */
export function calculateCGPA(
  semesters: Array<{
    gpa: number;
    totalCreditHours: number;
  }>
): number {
  if (semesters.length === 0) return 0;

  let totalGradePoints = 0;
  let totalCreditHours = 0;

  for (const semester of semesters) {
    totalGradePoints += semester.gpa * semester.totalCreditHours;
    totalCreditHours += semester.totalCreditHours;
  }

  if (totalCreditHours === 0) return 0;

  const cgpa = totalGradePoints / totalCreditHours;
  return Math.round(cgpa * 1000) / 1000;
}

/**
 * Determine degree classification based on CGPA
 */
export function getDegreeClassification(
  cgpa: number,
  thresholds: ClassificationThresholds
): string {
  if (cgpa >= thresholds.firstClass) return "First Class";
  if (cgpa >= thresholds.secondUpper) return "Second Class Upper";
  if (cgpa >= thresholds.secondLower) return "Second Class Lower";
  if (cgpa >= thresholds.third) return "Third Class";
  if (cgpa >= thresholds.pass) return "Pass";
  return "Fail";
}

/**
 * Predict required score to achieve target CGPA
 */
export function predictRequiredScore(
  currentCGPA: number,
  targetCGPA: number,
  currentTotalCreditHours: number,
  upcomingCourseCredits: number,
  gradingScale: GradingScale[]
): { requiredGPA: number; requiredScore: number; achievable: boolean } {
  // Calculate required GPA for upcoming semester
  const totalCreditsAfter = currentTotalCreditHours + upcomingCourseCredits;
  const requiredGPA =
    (targetCGPA * totalCreditsAfter - currentCGPA * currentTotalCreditHours) /
    upcomingCourseCredits;

  // Find minimum score needed to achieve required GPA
  const sortedScale = gradingScale.sort((a, b) => b.gradePoint - a.gradePoint);
  
  let requiredScore = 0;
  let achievable = false;

  for (const range of sortedScale) {
    if (range.gradePoint >= requiredGPA) {
      requiredScore = range.minScore;
      achievable = true;
      break;
    }
  }

  return {
    requiredGPA: Math.round(requiredGPA * 1000) / 1000,
    requiredScore,
    achievable,
  };
}

/**
 * Predict CGPA after completing upcoming semester
 */
export function predictCGPA(
  currentCGPA: number,
  currentTotalCreditHours: number,
  predictedSemesterGPA: number,
  upcomingCourseCredits: number
): number {
  const totalCreditsAfter = currentTotalCreditHours + upcomingCourseCredits;
  const predictedCGPA =
    (currentCGPA * currentTotalCreditHours +
      predictedSemesterGPA * upcomingCourseCredits) /
    totalCreditsAfter;

  return Math.round(predictedCGPA * 1000) / 1000;
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(
  courseResults: Array<{
    courseName: string;
    grade: string;
    gradePoint: number;
    creditHours: number;
  }>
) {
  const sortedByGrade = [...courseResults].sort(
    (a, b) => b.gradePoint - a.gradePoint
  );

  const topCourses = sortedByGrade.slice(0, 3);
  const bottomCourses = sortedByGrade.slice(-3).reverse();

  const averageGradePoint =
    courseResults.reduce((sum, c) => sum + c.gradePoint, 0) /
    courseResults.length;

  return {
    topCourses,
    bottomCourses,
    averageGradePoint: Math.round(averageGradePoint * 1000) / 1000,
    totalCourses: courseResults.length,
  };
}
