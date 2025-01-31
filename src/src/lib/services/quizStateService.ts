import type { QuizState, Answer, QuizConfig } from '../types';

export class QuizStateService {
  private static instance: QuizStateService;
  private readonly config: QuizConfig;
  private readonly stateId: string;

  private constructor(config: QuizConfig) {
    this.config = config;
    this.stateId = this.generateStateId();
  }

  static getInstance(config: QuizConfig): QuizStateService {
    if (!QuizStateService.instance) {
      QuizStateService.instance = new QuizStateService(config);
    }
    return QuizStateService.instance;
  }

  private generateStateId(): string {
    const filename = this.getFilenameFromUrl(this.config.source || '/questions.xml');
    const submissionId = this.config.submission_id || '';
    return btoa(`${filename}:${submissionId}`);
  }

  private getFilenameFromUrl(url: string): string {
    return url.split('/').pop() || url;
  }

  private getStorageKey(): string {
    return `quiz_state_${this.stateId}`;
  }

  private calculateExpiryDate(fromDate: Date = new Date()): string {
    const expiryDays = this.config.expiry_in_days ?? 90;
    const expiryDate = new Date(fromDate);
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    return expiryDate.toISOString();
  }

  getState(): QuizState | null {
    try {
      const storedState = localStorage.getItem(this.getStorageKey());
      if (!storedState) return null;

      const state = JSON.parse(storedState) as QuizState;
      
      // Check if state has expired
      if (state.expiresAt && new Date(state.expiresAt) < new Date()) {
        this.clearState();
        return null;
      }

      return state;
    } catch (error) {
      console.error('Error loading quiz state:', error);
      return null;
    }
  }

  saveState(currentPageIndex: number, answers: Answer[]): void {
    try {
      const existingState = this.getState();
      const state: QuizState = {
        id: this.stateId,
        currentPageIndex,
        answers,
        submittedAt: existingState?.submittedAt,
        expiresAt: existingState?.expiresAt // Keep existing expiresAt or undefined
      };

      localStorage.setItem(this.getStorageKey(), JSON.stringify(state));
    } catch (error) {
      console.error('Error saving quiz state:', error);
    }
  }

  markAsSubmitted(): void {
    try {
      const state = this.getState();
      if (!state) return;

      const submittedAt = new Date().toISOString();
      const expiresAt = this.calculateExpiryDate(new Date(submittedAt));

      const updatedState: QuizState = {
        ...state,
        submittedAt,
        expiresAt // Only set expiresAt when form is submitted
      };

      localStorage.setItem(this.getStorageKey(), JSON.stringify(updatedState));
    } catch (error) {
      console.error('Error marking quiz as submitted:', error);
    }
  }

  clearState(): void {
    localStorage.removeItem(this.getStorageKey());
  }

  isSubmitted(): boolean {
    const state = this.getState();
    return state?.submittedAt != null;
  }
}