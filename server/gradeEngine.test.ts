import { describe, it, expect } from "vitest";
import {
  calculateGrade,
  calculateTotalScore,
  calculateSemesterGPA,
  calculateCGPA,
  getDegreeClassification,
  predictRequiredScore,
  getPerformanceSummary,
} from "./gradeEngine";

describe("Grade Engine", () => {
  describe("calculateGrade", () => {
    const gradingScale: any[] = [
      { minScore: 90, maxScore: 100, grade: "A", gradePoint: 4.0 },
      { minScore: 80, maxScore: 89, grade: "B+", gradePoint: 3.5 },
      { minScore: 70, maxScore: 79, grade: "B", gradePoint: 3.0 },
      { minScore: 60, maxScore: 69, grade: "C+", gradePoint: 2.5 },
      { minScore: 50, maxScore: 59, grade: "C", gradePoint: 2.0 },
      { minScore: 0, maxScore: 49, grade: "F", gradePoint: 0.0 },
    ];

    it("should calculate correct letter grade for score 90+", () => {
      const result = calculateGrade(95, gradingScale);
      expect(result.grade).toBe("A");
      expect(result.gradePoint).toBe(4.0);
    });

    it("should calculate correct letter grade for score 85", () => {
      const result = calculateGrade(85, gradingScale);
      expect(result.grade).toBe("B+");
      expect(result.gradePoint).toBe(3.5);
    });

    it("should return F for failing score", () => {
      const result = calculateGrade(45, gradingScale);
      expect(result.grade).toBe("F");
      expect(result.gradePoint).toBe(0.0);
    });
  });

  describe("calculateTotalScore", () => {
    it("should calculate weighted total score correctly", () => {
      const result = calculateTotalScore(8, 14, 20, 45);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it("should handle partial scores", () => {
      const result = calculateTotalScore(undefined, undefined, 40, 45);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });

  describe("calculateSemesterGPA", () => {
    it("should calculate GPA correctly", () => {
      const courses = [
        { gradePoint: 4.0, creditHours: 3 },
        { gradePoint: 3.5, creditHours: 4 },
        { gradePoint: 3.0, creditHours: 3 },
      ];

      const gpa = calculateSemesterGPA(courses);
      expect(gpa).toBeGreaterThan(3.0);
      expect(gpa).toBeLessThan(4.0);
    });

    it("should handle single course", () => {
      const courses = [{ gradePoint: 3.5, creditHours: 3 }];
      const gpa = calculateSemesterGPA(courses);
      expect(gpa).toBe(3.5);
    });
  });

  describe("calculateCGPA", () => {
    it("should calculate CGPA correctly across semesters", () => {
      const semesters = [
        { gpa: 3.5, totalCreditHours: 12 },
        { gpa: 3.7, totalCreditHours: 12 },
        { gpa: 3.4, totalCreditHours: 12 },
      ];

      const cgpa = calculateCGPA(semesters);
      expect(cgpa).toBeGreaterThan(3.4);
      expect(cgpa).toBeLessThan(3.7);
    });
  });

  describe("getDegreeClassification", () => {
    const thresholds = {
      firstClass: 3.7,
      secondUpper: 3.3,
      secondLower: 2.7,
      third: 2.0,
      pass: 1.0,
    };

    it("should classify First Class", () => {
      const classification = getDegreeClassification(3.85, thresholds);
      expect(classification).toBe("First Class");
    });

    it("should classify Second Class Upper", () => {
      const classification = getDegreeClassification(3.5, thresholds);
      expect(classification).toBe("Second Class Upper");
    });

    it("should classify Second Class Lower", () => {
      const classification = getDegreeClassification(3.0, thresholds);
      expect(classification).toBe("Second Class Lower");
    });

    it("should classify Third Class", () => {
      const classification = getDegreeClassification(2.3, thresholds);
      expect(classification).toBe("Third Class");
    });

    it("should classify Pass", () => {
      const classification = getDegreeClassification(1.5, thresholds);
      expect(classification).toBe("Pass");
    });

    it("should classify Fail", () => {
      const classification = getDegreeClassification(0.5, thresholds);
      expect(classification).toBe("Fail");
    });
  });

  describe("predictRequiredScore", () => {
    it("should predict required score for target CGPA", () => {
      const gradingScale: any[] = [
        { minScore: 90, maxScore: 100, grade: "A", gradePoint: 4.0 },
        { minScore: 80, maxScore: 89, grade: "B+", gradePoint: 3.5 },
        { minScore: 70, maxScore: 79, grade: "B", gradePoint: 3.0 },
        { minScore: 60, maxScore: 69, grade: "C+", gradePoint: 2.5 },
        { minScore: 50, maxScore: 59, grade: "C", gradePoint: 2.0 },
        { minScore: 0, maxScore: 49, grade: "F", gradePoint: 0.0 },
      ];

      const result = predictRequiredScore(3.5, 3.7, 36, 12, gradingScale);

      expect(result).toHaveProperty("requiredScore");
      expect(result).toHaveProperty("requiredGPA");
      expect(result).toHaveProperty("achievable");
      expect(typeof result.requiredScore).toBe("number");
      expect(typeof result.achievable).toBe("boolean");
    });
  });

  describe("getPerformanceSummary", () => {
    it("should generate performance summary", () => {
      const courses = [
        { courseName: "Math", grade: "A", gradePoint: 4.0, creditHours: 3 },
        { courseName: "Physics", grade: "B", gradePoint: 3.0, creditHours: 4 },
        { courseName: "Chemistry", grade: "C", gradePoint: 2.0, creditHours: 3 },
      ];

      const summary = getPerformanceSummary(courses);

      expect(summary).toHaveProperty("averageGradePoint");
      expect(summary).toHaveProperty("topCourses");
      expect(summary).toHaveProperty("bottomCourses");
      expect(summary.topCourses.length).toBeGreaterThan(0);
    });
  });
});
