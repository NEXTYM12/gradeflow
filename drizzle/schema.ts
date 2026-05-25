import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  json
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Universities table - stores Ghanaian university grading systems
 */
export const universities = mysqlTable("universities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  abbreviation: varchar("abbreviation", { length: 50 }).notNull().unique(),
  gradingScale: json("gradingScale").notNull(), // Array of {minScore, maxScore, grade, gradePoint}
  classificationThresholds: json("classificationThresholds").notNull(), // {firstClass, secondUpper, secondLower, third, pass}
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type University = typeof universities.$inferSelect;
export type InsertUniversity = typeof universities.$inferInsert;

/**
 * Courses table - stores courses for each university
 */
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  universityId: int("universityId").notNull(),
  courseCode: varchar("courseCode", { length: 50 }).notNull(),
  courseName: varchar("courseName", { length: 255 }).notNull(),
  creditHours: int("creditHours").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Results table - stores individual course scores and calculated grades
 */
export const results = mysqlTable("results", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  semester: varchar("semester", { length: 50 }).notNull(), // e.g., "2023-2024-1"
  quizScore: decimal("quizScore", { precision: 5, scale: 2 }),
  assignmentScore: decimal("assignmentScore", { precision: 5, scale: 2 }),
  midsemScore: decimal("midsemScore", { precision: 5, scale: 2 }),
  examScore: decimal("examScore", { precision: 5, scale: 2 }),
  totalScore: decimal("totalScore", { precision: 5, scale: 2 }).notNull(),
  grade: varchar("grade", { length: 2 }).notNull(), // A, B+, B, C+, C, D, F
  gradePoint: decimal("gradePoint", { precision: 3, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Result = typeof results.$inferSelect;
export type InsertResult = typeof results.$inferInsert;

/**
 * GPA History table - stores calculated GPA and CGPA for each semester
 */
export const gpaHistory = mysqlTable("gpaHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  semester: varchar("semester", { length: 50 }).notNull(),
  gpa: decimal("gpa", { precision: 4, scale: 3 }).notNull(),
  cgpa: decimal("cgpa", { precision: 4, scale: 3 }).notNull(),
  totalCreditHours: int("totalCreditHours").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GPAHistory = typeof gpaHistory.$inferSelect;
export type InsertGPAHistory = typeof gpaHistory.$inferInsert;

/**
 * PDF Reports table - stores generated academic reports
 */
export const pdfReports = mysqlTable("pdfReports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  reportType: mysqlEnum("reportType", ["semester", "cumulative", "prediction"]).notNull(),
  semester: varchar("semester", { length: 50 }),
  fileKey: varchar("fileKey", { length: 255 }).notNull(), // S3 storage key
  fileUrl: text("fileUrl").notNull(), // S3 file URL
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PDFReport = typeof pdfReports.$inferSelect;
export type InsertPDFReport = typeof pdfReports.$inferInsert;

/**
 * User University Association - tracks which university each user attends
 */
export const userUniversities = mysqlTable("userUniversities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  universityId: int("universityId").notNull(),
  studentId: varchar("studentId", { length: 100 }),
  level: varchar("level", { length: 50 }), // e.g., "100", "200", "300", "400"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserUniversity = typeof userUniversities.$inferSelect;
export type InsertUserUniversity = typeof userUniversities.$inferInsert;
