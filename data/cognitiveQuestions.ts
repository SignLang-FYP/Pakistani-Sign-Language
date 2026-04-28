export type CognitiveQuestion = {
  id: string;
  category:
    | "attention"
    | "memory"
    | "motor"
    | "learning"
    | "response"
    | "engagement";
  question: string;
  options: {
    label: string;
    score: number;
  }[];
};

const scale = [
  { label: "Very High", score: 5 },
  { label: "High", score: 4 },
  { label: "Moderate", score: 3 },
  { label: "Low", score: 2 },
  { label: "Very Low", score: 1 },
];

export const cognitiveQuestions: CognitiveQuestion[] = [
  // Attention
  {
    id: "q1",
    category: "attention",
    question: "How well did the student stay focused during tasks?",
    options: scale,
  },
  {
    id: "q2",
    category: "attention",
    question: "How often did the student get distracted?",
    options: scale,
  },
  {
    id: "q3",
    category: "attention",
    question: "How long could the student maintain attention?",
    options: scale,
  },

  // Memory
  {
    id: "q4",
    category: "memory",
    question: "How well did the student remember learned signs?",
    options: scale,
  },
  {
    id: "q5",
    category: "memory",
    question: "How accurately did the student recall signs after delay?",
    options: scale,
  },
  {
    id: "q6",
    category: "memory",
    question: "How easily did the student forget signs?",
    options: scale,
  },

  // Motor Skills
  {
    id: "q7",
    category: "motor",
    question: "How accurate were hand movements?",
    options: scale,
  },
  {
    id: "q8",
    category: "motor",
    question: "How well did the student coordinate hand gestures?",
    options: scale,
  },
  {
    id: "q9",
    category: "motor",
    question: "How consistent were repeated movements?",
    options: scale,
  },

  // Learning Speed
  {
    id: "q10",
    category: "learning",
    question: "How quickly did the student learn new signs?",
    options: scale,
  },
  {
    id: "q11",
    category: "learning",
    question: "How much repetition was needed to learn a sign?",
    options: scale,
  },
  {
    id: "q12",
    category: "learning",
    question: "How well did performance improve over time?",
    options: scale,
  },

  // Response
  {
    id: "q13",
    category: "response",
    question: "How quickly did the student respond to prompts?",
    options: scale,
  },
  {
    id: "q14",
    category: "response",
    question: "How often did the student hesitate before responding?",
    options: scale,
  },
  {
    id: "q15",
    category: "response",
    question: "How accurate were responses under time pressure?",
    options: scale,
  },

  // Engagement
  {
    id: "q16",
    category: "engagement",
    question: "How engaged was the student during sessions?",
    options: scale,
  },
  {
    id: "q17",
    category: "engagement",
    question: "How motivated was the student to continue learning?",
    options: scale,
  },
  {
    id: "q18",
    category: "engagement",
    question: "How often did the student interact actively?",
    options: scale,
  },

  // Mixed Behavior
  {
    id: "q19",
    category: "attention",
    question: "How well did the student follow instructions?",
    options: scale,
  },
  {
    id: "q20",
    category: "learning",
    question: "How independently did the student complete tasks?",
    options: scale,
  },
];