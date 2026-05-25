import { describe, it, expect } from "vitest";
import {
  courseInputSchema,
  scoreInputSchema,
  predictionInputSchema,
  aiChatInputSchema,
} from "../shared/schemas";

describe("Validation Schemas", () => {
  describe("courseInputSchema", () => {
    it("should validate correct course input", () => {
      const input = {
        courseName: "Mathematics",
        courseCode: "MATH101",
        creditHours: 3,
        semester: "S2024",
      };

      const result = courseInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject course with empty name", () => {
      const input = {
        courseName: "",
        courseCode: "MATH101",
        creditHours: 3,
        semester: "S2024",
      };

      const result = courseInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject invalid credit hours", () => {
      const input = {
        courseName: "Mathematics",
        courseCode: "MATH101",
        creditHours: 10,
        semester: "S2024",
      };

      const result = courseInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject invalid semester format", () => {
      const input = {
        courseName: "Mathematics",
        courseCode: "MATH101",
        creditHours: 3,
        semester: "2024",
      };

      const result = courseInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("scoreInputSchema", () => {
    it("should validate correct score input", () => {
      const input = {
        courseId: 1,
        quiz: 85,
        assignment: 90,
        midsem: 88,
        exam: 92,
      };

      const result = scoreInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject negative score", () => {
      const input = {
        courseId: 1,
        quiz: -5,
      };

      const result = scoreInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject score exceeding 100", () => {
      const input = {
        courseId: 1,
        exam: 105,
      };

      const result = scoreInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should allow partial scores", () => {
      const input = {
        courseId: 1,
        quiz: 85,
      };

      const result = scoreInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("predictionInputSchema", () => {
    it("should validate correct prediction input", () => {
      const input = {
        targetCGPA: 3.7,
        upcomingCourseCredits: 12,
      };

      const result = predictionInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject CGPA exceeding 4.0", () => {
      const input = {
        targetCGPA: 4.5,
        upcomingCourseCredits: 12,
      };

      const result = predictionInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject negative course credits", () => {
      const input = {
        targetCGPA: 3.5,
        upcomingCourseCredits: -1,
      };

      const result = predictionInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("aiChatInputSchema", () => {
    it("should validate correct chat input", () => {
      const input = {
        message: "How can I improve my GPA?",
      };

      const result = aiChatInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject empty message", () => {
      const input = {
        message: "",
      };

      const result = aiChatInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject message exceeding 1000 characters", () => {
      const input = {
        message: "a".repeat(1001),
      };

      const result = aiChatInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
