const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_TEXT_LENGTH = 12000;

interface FlashcardData {
  term: string;
  definition: string;
}

interface MCQData {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}

interface OpenQuestionData {
  question: string;
  modelAnswer: string;
}

export interface QuizContent {
  flashcards: FlashcardData[];
  mcqs: MCQData[];
  openQuestions: OpenQuestionData[];
}

export async function generateQuizContent(text: string): Promise<QuizContent> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const truncatedText = text.slice(0, MAX_TEXT_LENGTH);

  const prompt = `You are a quiz generator. Based on the following lesson content, generate a quiz in JSON format with exactly this structure:

{
  "flashcards": [
    { "term": "...", "definition": "..." }
  ],
  "mcqs": [
    { "question": "...", "optionA": "...", "optionB": "...", "optionC": "...", "optionD": "...", "correctOption": "A" }
  ],
  "openQuestions": [
    { "question": "...", "modelAnswer": "..." }
  ]
}

Requirements:
- Generate exactly 10 flashcards (key term and its definition/explanation)
- Generate exactly 10 multiple choice questions (4 options each, correctOption must be "A", "B", "C", or "D")
- Generate exactly 5 open-ended questions with detailed model answers
- All content must be based on the provided lesson material
- Questions should test understanding, not just memorization
- Return ONLY valid JSON, no other text

Lesson content:
${truncatedText}`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const parsed = JSON.parse(content) as QuizContent;

  return parsed;
}
