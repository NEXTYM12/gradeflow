import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  universities,
  courses,
  results,
  gpaHistory,
  pdfReports,
  userUniversities,
  University,
  Course,
  Result,
  GPAHistory,
  PDFReport,
  UserUniversity
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// University queries
export async function getAllUniversities(): Promise<University[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(universities);
}

export async function getUniversityById(id: number): Promise<University | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(universities).where(eq(universities.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// User University Association queries
export async function getUserUniversity(userId: number): Promise<UserUniversity | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userUniversities).where(eq(userUniversities.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setUserUniversity(userId: number, universityId: number, studentId?: string, level?: string) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getUserUniversity(userId);
  if (existing) {
    await db.update(userUniversities)
      .set({ universityId, studentId, level, updatedAt: new Date() })
      .where(eq(userUniversities.userId, userId));
  } else {
    await db.insert(userUniversities).values({
      userId,
      universityId,
      studentId,
      level
    });
  }
}

// Course queries
export async function getCoursesByUniversity(universityId: number): Promise<Course[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).where(eq(courses.universityId, universityId));
}

export async function getCourseById(id: number): Promise<Course | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Result queries
export async function getResultsBySemester(userId: number, semester: string): Promise<Result[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(results).where(
    and(eq(results.userId, userId), eq(results.semester, semester))
  );
}

export async function getAllUserResults(userId: number): Promise<Result[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(results).where(eq(results.userId, userId));
}

export async function createResult(result: any) {
  const db = await getDb();
  if (!db) return;
  await db.insert(results).values(result);
}

export async function updateResult(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(results).set(data).where(eq(results.id, id));
}

export async function deleteResult(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(results).where(eq(results.id, id));
}

// GPA History queries
export async function getGPAHistoryBySemester(userId: number, semester: string): Promise<GPAHistory | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(gpaHistory).where(
    and(eq(gpaHistory.userId, userId), eq(gpaHistory.semester, semester))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllGPAHistory(userId: number): Promise<GPAHistory[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gpaHistory).where(eq(gpaHistory.userId, userId));
}

export async function upsertGPAHistory(data: any) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getGPAHistoryBySemester(data.userId, data.semester);
  if (existing) {
    await db.update(gpaHistory).set(data).where(
      and(eq(gpaHistory.userId, data.userId), eq(gpaHistory.semester, data.semester))
    );
  } else {
    await db.insert(gpaHistory).values(data);
  }
}

// PDF Report queries
export async function createPDFReport(data: any) {
  const db = await getDb();
  if (!db) return;
  await db.insert(pdfReports).values(data);
}

export async function getPDFReportsByUser(userId: number): Promise<PDFReport[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pdfReports).where(eq(pdfReports.userId, userId));
}

export async function getPDFReportById(id: number): Promise<PDFReport | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(pdfReports).where(eq(pdfReports.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}


// Semester queries
export async function getUserSemesters(userId: number): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];
  
  const userResults = await db.select().from(results).where(eq(results.userId, userId));
  const semesters = new Set(userResults.map(r => r.semester));
  return Array.from(semesters).sort();
}

export async function deleteSemesterResults(userId: number, semester: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(results).where(
    and(eq(results.userId, userId), eq(results.semester, semester))
  );
  
  // Also delete GPA history for this semester
  await db.delete(gpaHistory).where(
    and(eq(gpaHistory.userId, userId), eq(gpaHistory.semester, semester))
  );
}
