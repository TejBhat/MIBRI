// TypeScript interfaces for the entire app

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  resume_text: string;
  extracted_skills?: string[];
  created_at: string;
  updated_at: string;
}

export interface InterviewQuestion {
  questionId: number;
  question: string;
  category: "technical" | "behavioral";
  difficulty: "easy" | "medium" | "hard";
}

export interface Interview {
  id: string;
  user_id: string;
  resume_id: string;
  duration_minutes: number;
  status: "in_progress" | "completed";
  questions: InterviewQuestion[];
  user_answers?: string[];
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface EvaluationScore {
  overall: number;
  technical: number;
  communication: number;
  confidence: number;
}

export interface ImprovedAnswer {
  questionId: number;
  originalAnswer: string;
  improvedAnswer: string;
}

export interface Evaluation {
  id: string;
  interview_id: string;
  scores: EvaluationScore;
  strengths: string[];
  weaknesses: string[];
  specificMistakes: string[];
  improvedAnswers: ImprovedAnswer[];
  improvementPlan: string[];
  summary: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResponse {
  user: User;
  resume: Resume;
}

export interface InterviewStartResponse {
  interview: Interview;
}

export interface EvaluationResponse {
  evaluation: Evaluation;
}

// Local app state
export interface AppState {
  user: User | null;
  resume: Resume | null;
  currentInterview: Interview | null;
  evaluations: Evaluation[];
  isLoading: boolean;
  error: string | null;
}