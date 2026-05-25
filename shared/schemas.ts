import { z } from "zod";

/**
 * Course input validation schema
 * Ensures all course data meets requirements before database insertion
 */
export const courseInputSchema = z.object({
  courseName: z
    .string()
    .min(2, "Course name must be at least 2 characters")
    .max(100, "Course name must not exceed 100 characters")
    .trim(),
  courseCode: z
    .string()
    .min(2, "Course code must be at least 2 characters")
    .max(20, "Course code must not exceed 20 characters")
    .trim(),
  creditHours: z
    .number()
    .min(0.5, "Credit hours must be at least 0.5")
    .max(6, "Credit hours must not exceed 6"),
  semester: z
    .string()
    .regex(/^[A-Z]\d{4}$/, "Semester must be in format like S2024 (Season + Year)")
    .trim(),
});

export type CourseInput = z.infer<typeof courseInputSchema>;

/**
 * Score/Result input validation schema
 * Validates individual assessment scores
 */
export const scoreInputSchema = z.object({
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

export type ScoreInput = z.infer<typeof scoreInputSchema>;

/**
 * Semester management schema
 * Validates semester creation and updates
 */
export const semesterSchema = z.object({
  semester: z
    .string()
    .regex(/^[A-Z]\d{4}$/, "Semester must be in format like S2024")
    .trim(),
  universityId: z.number().positive("Invalid university ID"),
});

export type SemesterInput = z.infer<typeof semesterSchema>;

/**
 * Prediction input validation
 * Validates prediction engine parameters
 */
export const predictionInputSchema = z.object({
  targetCGPA: z
    .number()
    .min(0, "Target CGPA cannot be negative")
    .max(4.0, "Target CGPA cannot exceed 4.0"),
  upcomingCourseCredits: z
    .number()
    .min(1, "Upcoming course credits must be at least 1")
    .max(24, "Upcoming course credits cannot exceed 24"),
});

export type PredictionInput = z.infer<typeof predictionInputSchema>;

/**
 * AI chat input validation
 */
export const aiChatInputSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message cannot exceed 1000 characters")
    .trim(),
});

export type AIChatInput = z.infer<typeof aiChatInputSchema>;
