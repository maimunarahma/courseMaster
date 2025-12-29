export const quizPrompt = (topic : string, difficulty: string, count : number) => `
You are a professional course instructor.

Generate ${count} multiple choice questions.

Topic: ${topic}
Difficulty: ${difficulty}

Rules:
- 4 options (A,B,C,D)
- Only ONE correct answer
- Avoid ambiguity
- Output STRICT JSON only

JSON Format:
{
  "questions": [
    {
      "question": "",
      "options": {
        "A": "",
        "B": "",
        "C": "",
        "D": ""
      },
      "correctAnswer": "A"
    }
  ]
}
`;
export const assignmentPrompt = (topic : string) => `
You are an educational assignment designer.

Create 3 assignments for topic: ${topic}

Each assignment should include:
- Title
- Description
- Expected outcome
- Difficulty

Return STRICT JSON only.
`;

