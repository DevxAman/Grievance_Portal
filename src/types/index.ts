export interface User {
  id: string; // UUID
  user_id: string;
  email: string;
  password?: string;
  role: 'student' | 'clerk' | 'dsw' | 'admin';
  name?: string;
  contact_number?: string;
  created_at?: string;
  crn?: number; // College Roll Number (int8)
  year?: number; // Academic year (1-4)
  branch?: string;
  day_scholar?: boolean;
}

export interface Response {
  id: string;
  grievanceId: string;
  adminId: string;
  responseText: string;
  createdAt: string;
}

export interface Grievance {
  id: string; // UUID
  user_id: string; // UUID
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  documents?: string;
  feedback?: string;
  responses?: Response[];
}

export interface Statistic {
  id: string;
  resolution_rate: number;
  avg_response_time: number;
  grievances_resolved: number;
  user_satisfaction: number;
  last_updated: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}