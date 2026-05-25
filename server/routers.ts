import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import {
  calculateGrade,
  calculateTotalScore,
  calculateSemesterGPA,
  calculateCGPA,
  getDegreeClassification,
  predictRequiredScore,
  predictCGPA,
  getPerformanceSummary,
} from "./gradeEngine";
import { generateAIResponse } from "./aiAssistant";
import {
  generateAcademicReportPDF,
  generateTranscriptPDF,
  generatePerformanceReportPDF,
} from "./pdfReports";
import {
  courseInputSchema,
  scoreInputSchema,
  predictionInputSchema,
  aiChatInputSchema,
} from "../shared/schemas";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // University management
  university: router({
    list: publicProcedure.query(async () => {
      return await db.getAllUniversities();
    }),

    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      return await db.getUniversityById(input);
    }),
  }),

  // User university association
  userUniversity: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserUniversity(ctx.user.id);
    }),

    set: protectedProcedure
      .input(
        z.object({
          universityId: z.number(),
          studentId: z.string().optional(),
          level: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.setUserUniversity(
          ctx.user.id,
          input.universityId,
          input.studentId,
          input.level
        );
        return { success: true };
      }),
  }),

  // Course management
  course: router({
    listByUniversity: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await db.getCoursesByUniversity(input);
      }),
  }),

  // Results and grades
  result: router({
    create: protectedProcedure
      .input(scoreInputSchema.extend({ semester: z.string().regex(/^[A-Z]\d{4}$/, "Invalid semester format") }))
      .mutation(async ({ ctx, input }) => {
        const course = await db.getCourseById(input.courseId);
        if (!course) throw new Error("Course not found");

        const totalScore = calculateTotalScore(
          input.quiz,
          input.assignment,
          input.midsem,
          input.exam
        );

        const university = await db.getUniversityById(course.universityId);
        if (!university) throw new Error("University not found");

        const gradingScale = university.gradingScale as any;
        const { grade, gradePoint } = calculateGrade(totalScore, gradingScale);

        await db.createResult({
          userId: ctx.user.id,
          courseId: input.courseId,
          semester: input.semester,
          quizScore: input.quiz,
          assignmentScore: input.assignment,
          midsemScore: input.midsem,
          examScore: input.exam,
          totalScore,
          grade,
          gradePoint,
        });

        return { success: true, totalScore, grade, gradePoint };
      }),

    getBySemester: protectedProcedure
      .input(z.string())
      .query(async ({ ctx, input }) => {
        const results = await db.getResultsBySemester(ctx.user.id, input);
        const enriched = await Promise.all(
          results.map(async (r) => {
            const course = await db.getCourseById(r.courseId);
            return { ...r, course };
          })
        );
        return enriched;
      }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
      const results = await db.getAllUserResults(ctx.user.id);
      const enriched = await Promise.all(
        results.map(async (r) => {
          const course = await db.getCourseById(r.courseId);
          return { ...r, course };
        })
      );
      return enriched;
    }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          quizScore: z.number().optional(),
          assignmentScore: z.number().optional(),
          midsemScore: z.number().optional(),
          examScore: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const result = await db.getResultsBySemester(ctx.user.id, "");
        const existing = result.find((r) => r.id === input.id);
        if (!existing) throw new Error("Result not found");

        const totalScore = calculateTotalScore(
          input.quizScore ?? (existing.quizScore ? Number(existing.quizScore) : undefined),
          input.assignmentScore ?? (existing.assignmentScore ? Number(existing.assignmentScore) : undefined),
          input.midsemScore ?? (existing.midsemScore ? Number(existing.midsemScore) : undefined),
          input.examScore ?? (existing.examScore ? Number(existing.examScore) : undefined)
        );

        const course = await db.getCourseById(existing.courseId);
        if (!course) throw new Error("Course not found");

        const university = await db.getUniversityById(course.universityId);
        if (!university) throw new Error("University not found");

        const gradingScale = university.gradingScale as any;
        const { grade, gradePoint } = calculateGrade(totalScore, gradingScale);

        await db.updateResult(input.id, {
          quizScore: input.quizScore,
          assignmentScore: input.assignmentScore,
          midsemScore: input.midsemScore,
          examScore: input.examScore,
          totalScore,
          grade,
          gradePoint,
        });

        return { success: true, totalScore, grade, gradePoint };
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        await db.deleteResult(input);
        return { success: true };
      }),
  }),

  // GPA calculations
  gpa: router({
    calculateSemester: protectedProcedure
      .input(z.string())
      .query(async ({ ctx, input }) => {
        const results = await db.getResultsBySemester(ctx.user.id, input);
        const enriched = await Promise.all(
          results.map(async (r) => {
            const course = await db.getCourseById(r.courseId);
            return {
              gradePoint: Number(r.gradePoint),
              creditHours: course?.creditHours || 0,
            };
          })
        );

        const gpa = calculateSemesterGPA(enriched);
        const totalCreditHours = enriched.reduce(
          (sum, r) => sum + r.creditHours,
          0
        );

        await db.upsertGPAHistory({
          userId: ctx.user.id,
          semester: input,
          gpa,
          cgpa: gpa,
          totalCreditHours,
        });

        return { gpa, totalCreditHours };
      }),

    calculateCGPA: protectedProcedure.query(async ({ ctx }) => {
      const gpaHistory = await db.getAllGPAHistory(ctx.user.id);
      const cgpa = calculateCGPA(
        gpaHistory.map((h) => ({
          gpa: Number(h.gpa),
          totalCreditHours: h.totalCreditHours,
        }))
      );

      for (const history of gpaHistory) {
        await db.upsertGPAHistory({
          ...history,
          cgpa,
        });
      }

      return { cgpa, semesters: gpaHistory.length };
    }),

    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAllGPAHistory(ctx.user.id);
    }),

    listSemesters: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserSemesters(ctx.user.id);
    }),

    deleteSemester: protectedProcedure
      .input(z.string())
      .mutation(async ({ ctx, input }) => {
        await db.deleteSemesterResults(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // Prediction engine
  prediction: router({
    requiredScore: protectedProcedure
      .input(predictionInputSchema)
      .query(async ({ ctx, input }) => {
        const gpaHistory = await db.getAllGPAHistory(ctx.user.id);
        const currentCGPA =
          gpaHistory.length > 0
            ? calculateCGPA(
                gpaHistory.map((h) => ({
                  gpa: Number(h.gpa),
                  totalCreditHours: h.totalCreditHours,
                }))
              )
            : 0;

        const totalCreditHours = gpaHistory.reduce(
          (sum, h) => sum + h.totalCreditHours,
          0
        );

        const userUni = await db.getUserUniversity(ctx.user.id);
        if (!userUni) throw new Error("User university not set");

        const university = await db.getUniversityById(userUni.universityId);
        if (!university) throw new Error("University not found");

        const gradingScale = university.gradingScale as any;
        const result = predictRequiredScore(
          currentCGPA,
          input.targetCGPA,
          totalCreditHours,
          input.upcomingCourseCredits,
          gradingScale
        );

        return result;
      }),

    predictedCGPA: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input }) => {
        const gpaHistory = await db.getAllGPAHistory(ctx.user.id);
        const currentCGPA =
          gpaHistory.length > 0
            ? calculateCGPA(
                gpaHistory.map((h) => ({
                  gpa: Number(h.gpa),
                  totalCreditHours: h.totalCreditHours,
                }))
              )
            : 0;

        const totalCreditHours = gpaHistory.reduce(
          (sum, h) => sum + h.totalCreditHours,
          0
        );

        const predicted = predictCGPA(
          currentCGPA,
          totalCreditHours,
          input,
          12
        );

        return { predicted, current: currentCGPA };
      }),
  }),

  // Analytics
  analytics: router({
    performanceSummary: protectedProcedure
      .input(z.string())
      .query(async ({ ctx, input }) => {
        const results = await db.getResultsBySemester(ctx.user.id, input);
        const enriched = await Promise.all(
          results.map(async (r) => {
            const course = await db.getCourseById(r.courseId);
            return {
              courseName: course?.courseName || "Unknown",
              grade: r.grade,
              gradePoint: Number(r.gradePoint),
              creditHours: course?.creditHours || 0,
            };
          })
        );

        return getPerformanceSummary(enriched);
      }),

    degreeClassification: protectedProcedure.query(async ({ ctx }) => {
      const gpaHistory = await db.getAllGPAHistory(ctx.user.id);
      const cgpa =
        gpaHistory.length > 0
          ? calculateCGPA(
              gpaHistory.map((h) => ({
                gpa: Number(h.gpa),
                totalCreditHours: h.totalCreditHours,
              }))
            )
          : 0;

      const userUni = await db.getUserUniversity(ctx.user.id);
      if (!userUni) throw new Error("User university not set");

      const university = await db.getUniversityById(userUni.universityId);
      if (!university) throw new Error("University not found");

      const thresholds = university.classificationThresholds as any;
      const classification = getDegreeClassification(cgpa, thresholds);

      return { classification, cgpa };
    }),
  }),

  // AI Assistant
  ai: router({
    chat: protectedProcedure
      .input(aiChatInputSchema)
      .mutation(async ({ ctx, input }) => {
        const response = await generateAIResponse(ctx.user.id, input.message);
        return { response };
      }),
  }),

  // Reports
  reports: router({
    generateAcademic: protectedProcedure.mutation(async ({ ctx }) => {
      const url = await generateAcademicReportPDF(
        ctx.user.id,
        ctx.user.name || "Student",
        ctx.user.email || "unknown@example.com"
      );
      return { url, type: "academic" };
    }),

    generateTranscript: protectedProcedure.mutation(async ({ ctx }) => {
      const url = await generateTranscriptPDF(
        ctx.user.id,
        ctx.user.name || "Student"
      );
      return { url, type: "transcript" };
    }),

    generatePerformance: protectedProcedure.mutation(async ({ ctx }) => {
      const url = await generatePerformanceReportPDF(
        ctx.user.id,
        ctx.user.name || "Student"
      );
      return { url, type: "performance" };
    }),
  }),
});

export type AppRouter = typeof appRouter;
