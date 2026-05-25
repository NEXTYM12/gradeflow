import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const universities = [
  {
    name: 'Kwame Nkrumah University of Science and Technology',
    abbreviation: 'KNUST',
    gradingScale: [
      { minScore: 80, maxScore: 100, grade: 'A', gradePoint: 4.0 },
      { minScore: 75, maxScore: 79, grade: 'A-', gradePoint: 3.7 },
      { minScore: 70, maxScore: 74, grade: 'B+', gradePoint: 3.3 },
      { minScore: 65, maxScore: 69, grade: 'B', gradePoint: 3.0 },
      { minScore: 60, maxScore: 64, grade: 'B-', gradePoint: 2.7 },
      { minScore: 55, maxScore: 59, grade: 'C+', gradePoint: 2.3 },
      { minScore: 50, maxScore: 54, grade: 'C', gradePoint: 2.0 },
      { minScore: 45, maxScore: 49, grade: 'C-', gradePoint: 1.7 },
      { minScore: 40, maxScore: 44, grade: 'D+', gradePoint: 1.3 },
      { minScore: 35, maxScore: 39, grade: 'D', gradePoint: 1.0 },
      { minScore: 0, maxScore: 34, grade: 'F', gradePoint: 0.0 }
    ],
    classificationThresholds: {
      firstClass: 3.6,
      secondUpper: 3.0,
      secondLower: 2.0,
      third: 1.0,
      pass: 1.0
    }
  },
  {
    name: 'University of Ghana',
    abbreviation: 'UG',
    gradingScale: [
      { minScore: 85, maxScore: 100, grade: 'A', gradePoint: 4.0 },
      { minScore: 80, maxScore: 84, grade: 'A-', gradePoint: 3.7 },
      { minScore: 75, maxScore: 79, grade: 'B+', gradePoint: 3.3 },
      { minScore: 70, maxScore: 74, grade: 'B', gradePoint: 3.0 },
      { minScore: 65, maxScore: 69, grade: 'B-', gradePoint: 2.7 },
      { minScore: 60, maxScore: 64, grade: 'C+', gradePoint: 2.3 },
      { minScore: 55, maxScore: 59, grade: 'C', gradePoint: 2.0 },
      { minScore: 50, maxScore: 54, grade: 'C-', gradePoint: 1.7 },
      { minScore: 45, maxScore: 49, grade: 'D+', gradePoint: 1.3 },
      { minScore: 40, maxScore: 44, grade: 'D', gradePoint: 1.0 },
      { minScore: 0, maxScore: 39, grade: 'F', gradePoint: 0.0 }
    ],
    classificationThresholds: {
      firstClass: 3.6,
      secondUpper: 3.0,
      secondLower: 2.0,
      third: 1.0,
      pass: 1.0
    }
  },
  {
    name: 'University of Cape Coast',
    abbreviation: 'UCC',
    gradingScale: [
      { minScore: 80, maxScore: 100, grade: 'A', gradePoint: 4.0 },
      { minScore: 75, maxScore: 79, grade: 'A-', gradePoint: 3.7 },
      { minScore: 70, maxScore: 74, grade: 'B+', gradePoint: 3.3 },
      { minScore: 65, maxScore: 69, grade: 'B', gradePoint: 3.0 },
      { minScore: 60, maxScore: 64, grade: 'B-', gradePoint: 2.7 },
      { minScore: 55, maxScore: 59, grade: 'C+', gradePoint: 2.3 },
      { minScore: 50, maxScore: 54, grade: 'C', gradePoint: 2.0 },
      { minScore: 45, maxScore: 49, grade: 'C-', gradePoint: 1.7 },
      { minScore: 40, maxScore: 44, grade: 'D+', gradePoint: 1.3 },
      { minScore: 35, maxScore: 39, grade: 'D', gradePoint: 1.0 },
      { minScore: 0, maxScore: 34, grade: 'F', gradePoint: 0.0 }
    ],
    classificationThresholds: {
      firstClass: 3.6,
      secondUpper: 3.0,
      secondLower: 2.0,
      third: 1.0,
      pass: 1.0
    }
  },
  {
    name: 'University of Professional Studies, Accra',
    abbreviation: 'UPSA',
    gradingScale: [
      { minScore: 80, maxScore: 100, grade: 'A', gradePoint: 4.0 },
      { minScore: 75, maxScore: 79, grade: 'A-', gradePoint: 3.7 },
      { minScore: 70, maxScore: 74, grade: 'B+', gradePoint: 3.3 },
      { minScore: 65, maxScore: 69, grade: 'B', gradePoint: 3.0 },
      { minScore: 60, maxScore: 64, grade: 'B-', gradePoint: 2.7 },
      { minScore: 55, maxScore: 59, grade: 'C+', gradePoint: 2.3 },
      { minScore: 50, maxScore: 54, grade: 'C', gradePoint: 2.0 },
      { minScore: 45, maxScore: 49, grade: 'C-', gradePoint: 1.7 },
      { minScore: 40, maxScore: 44, grade: 'D+', gradePoint: 1.3 },
      { minScore: 35, maxScore: 39, grade: 'D', gradePoint: 1.0 },
      { minScore: 0, maxScore: 34, grade: 'F', gradePoint: 0.0 }
    ],
    classificationThresholds: {
      firstClass: 3.6,
      secondUpper: 3.0,
      secondLower: 2.0,
      third: 1.0,
      pass: 1.0
    }
  },
  {
    name: 'University of Energy and Natural Resources',
    abbreviation: 'UENR',
    gradingScale: [
      { minScore: 80, maxScore: 100, grade: 'A', gradePoint: 4.0 },
      { minScore: 75, maxScore: 79, grade: 'A-', gradePoint: 3.7 },
      { minScore: 70, maxScore: 74, grade: 'B+', gradePoint: 3.3 },
      { minScore: 65, maxScore: 69, grade: 'B', gradePoint: 3.0 },
      { minScore: 60, maxScore: 64, grade: 'B-', gradePoint: 2.7 },
      { minScore: 55, maxScore: 59, grade: 'C+', gradePoint: 2.3 },
      { minScore: 50, maxScore: 54, grade: 'C', gradePoint: 2.0 },
      { minScore: 45, maxScore: 49, grade: 'C-', gradePoint: 1.7 },
      { minScore: 40, maxScore: 44, grade: 'D+', gradePoint: 1.3 },
      { minScore: 35, maxScore: 39, grade: 'D', gradePoint: 1.0 },
      { minScore: 0, maxScore: 34, grade: 'F', gradePoint: 0.0 }
    ],
    classificationThresholds: {
      firstClass: 3.6,
      secondUpper: 3.0,
      secondLower: 2.0,
      third: 1.0,
      pass: 1.0
    }
  }
];

for (const uni of universities) {
  await connection.execute(
    'INSERT INTO universities (name, abbreviation, gradingScale, classificationThresholds) VALUES (?, ?, ?, ?)',
    [uni.name, uni.abbreviation, JSON.stringify(uni.gradingScale), JSON.stringify(uni.classificationThresholds)]
  );
  console.log(`✓ Inserted ${uni.abbreviation}`);
}

await connection.end();
console.log('✓ Universities seeded successfully');
