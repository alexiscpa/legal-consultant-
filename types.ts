
export enum AppView {
  DASHBOARD = 'dashboard',
  SCENARIOS = 'scenarios',
  CONTRACT_REVIEW = 'contract-review',
  CONSULTATION = 'consultation',
  STORAGE = 'storage'
}

export interface LegalScenario {
  id: string;
  title: string;
  category: string;
  description: string;
  timestamp: number;
  advice: string;
}

export interface ReviewResult {
  summary: string;
  risks: string[];
  compliance: string[];
  recommendations: string[];
}

export interface StoredContract {
  id: string;
  title: string;
  content: string;
  result: ReviewResult;
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  sources?: GroundingSource[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AdviceResponse {
  text: string;
  sources: GroundingSource[];
}