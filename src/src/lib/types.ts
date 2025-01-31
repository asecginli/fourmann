export type QuestionType = 'choices' | 'numeric' | 'decimal' | 'text' | 'markdown';

export interface Choice {
  value?: string;
  text?: string;
  other?: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required?: boolean;
  choices?: Choice[];
  allowMultiple?: boolean;
  maxValue?: number;
  minValue?: number;
  allowOther?: boolean;
  name?: string;
}

export interface Page {
  id: string;
  title: string;
  sections: Section[];
  submit?: boolean;
  submitRemarks?: string;
}

export interface Answer {
  questionId: string;
  value: string[];
  questionName: string;
  questionText: string;
}

export interface QuizConfig {
  source?: string;
  debug?: boolean;
  expiry_in_days?: number;
  submission_id?: string;
  on_submit?: (formData: QuizSubmission) => void;
  state?: Record<string, any>;
}

export interface QuizSubmission {
  answers: Answer[];
  state?: Record<string, any>;
  timestamp: string;
}

export interface QuizState {
  id: string;
  currentPageIndex: number;
  answers: Answer[];
  submittedAt?: string;
  expiresAt?: string;
}

export interface Section {
  content: (MarkdownContent | QuestionsContent)[];
}

export interface MarkdownContent {
  type: 'markdown';
  content: string | undefined;
  width: number;
}

export interface QuestionsContent {
  type: 'questions';
  questions: Question[];
  width: number;
}