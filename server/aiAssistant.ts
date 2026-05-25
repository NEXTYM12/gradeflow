import { invokeLLM } from "./_core/llm";
import * as db from "./db";

interface StudentContext {
  cgpa: number;
  classification: string;
  totalSemesters: number;
  averageGPA: number;
  bestSemester?: string;
  worstSemester?: string;
}

export async function getStudentContext(userId: number): Promise<StudentContext> {
  const gpaHistory = await db.getAllGPAHistory(userId);
  
  if (gpaHistory.length === 0) {
    return {
      cgpa: 0,
      classification: "Not calculated",
      totalSemesters: 0,
      averageGPA: 0,
    };
  }

  const gpas = gpaHistory.map((h) =>
    typeof h.gpa === "number" ? h.gpa : parseFloat(h.gpa as any)
  );
  const averageGPA = gpas.reduce((a, b) => a + b, 0) / gpas.length;
  const cgpa = gpas[gpas.length - 1]; // Last CGPA

  // Determine classification
  let classification = "Pass";
  if (cgpa >= 3.7) classification = "First Class Honours";
  else if (cgpa >= 3.3) classification = "Second Class Upper";
  else if (cgpa >= 2.7) classification = "Second Class Lower";
  else if (cgpa >= 2.0) classification = "Third Class";

  const bestSemester = gpaHistory.reduce((prev, current) =>
    (typeof current.gpa === "number" ? current.gpa : parseFloat(current.gpa as any)) >
    (typeof prev.gpa === "number" ? prev.gpa : parseFloat(prev.gpa as any))
      ? current
      : prev
  );

  const worstSemester = gpaHistory.reduce((prev, current) =>
    (typeof current.gpa === "number" ? current.gpa : parseFloat(current.gpa as any)) <
    (typeof prev.gpa === "number" ? prev.gpa : parseFloat(prev.gpa as any))
      ? current
      : prev
  );

  return {
    cgpa,
    classification,
    totalSemesters: gpaHistory.length,
    averageGPA,
    bestSemester: bestSemester.semester,
    worstSemester: worstSemester.semester,
  };
}

export async function generateAIResponse(
  userId: number,
  userMessage: string
): Promise<string> {
  try {
    const context = await getStudentContext(userId);

    const systemPrompt = `You are an AI academic advisor for a Ghanaian university student using GradeFlow.
You have access to the student's academic performance data:
- Current CGPA: ${context.cgpa.toFixed(3)}
- Degree Classification: ${context.classification}
- Total Semesters: ${context.totalSemesters}
- Average GPA: ${context.averageGPA.toFixed(3)}
- Best Semester: ${context.bestSemester}
- Worst Semester: ${context.worstSemester}

Provide personalized, actionable academic advice based on their specific performance. Be encouraging but realistic.
Keep responses concise (2-3 paragraphs max) and focused on the student's actual data.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from LLM");
    }

    return typeof content === "string" ? content : JSON.stringify(content);
  } catch (error) {
    console.error("Failed to generate AI response:", error);
    throw new Error("Failed to generate AI response");
  }
}
