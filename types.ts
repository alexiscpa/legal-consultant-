
export enum AppView {
  DASHBOARD = 'dashboard',
  SCENARIOS = 'scenarios',
  CONTRACT_REVIEW = 'contract-review',
  CONSULTATION = 'consultation',
  STORAGE = 'storage',
  USER_MANAGEMENT = 'user-management'
}

export type UserRole = 'admin' | 'user';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  created_at?: string;
  approved_at?: string;
  approved_by_name?: string;
  last_login?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
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