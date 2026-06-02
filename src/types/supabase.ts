export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          password: string;
          role: 'student' | 'clerk' | 'admin' | 'dsw';
          name: string;
          contact_number: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          password: string;
          role: 'student' | 'clerk' | 'admin' | 'dsw';
          name: string;
          contact_number: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          password?: string;
          role?: 'student' | 'clerk' | 'admin' | 'dsw';
          name?: string;
          contact_number?: string;
          created_at?: string;
        };
      };
      grievances: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: 'academic' | 'infrastructure' | 'administrative' | 'financial' | 'other';
          status: 'pending' | 'under-review' | 'in-progress' | 'resolved' | 'rejected';
          created_at: string;
          updated_at: string;
          assigned_to?: string;
          documents?: string[];
          feedback?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          category: 'academic' | 'infrastructure' | 'administrative' | 'financial' | 'other';
          status?: 'pending' | 'under-review' | 'in-progress' | 'resolved' | 'rejected';
          created_at?: string;
          updated_at?: string;
          assigned_to?: string;
          documents?: string[];
          feedback?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          category?: 'academic' | 'infrastructure' | 'administrative' | 'financial' | 'other';
          status?: 'pending' | 'under-review' | 'in-progress' | 'resolved' | 'rejected';
          created_at?: string;
          updated_at?: string;
          assigned_to?: string;
          documents?: string[];
          feedback?: string;
        };
      };
      responses: {
        Row: {
          id: string;
          grievance_id: string;
          admin_id: string;
          response_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          grievance_id: string;
          admin_id: string;
          response_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          grievance_id?: string;
          admin_id?: string;
          response_text?: string;
          created_at?: string;
        };
      };
      statistics: {
        Row: {
          id: string;
          resolution_rate: number;
          avg_response_time: number;
          grievances_resolved: number;
          user_satisfaction: number;
          last_updated: string;
        };
        Insert: {
          id?: string;
          resolution_rate: number;
          avg_response_time: number;
          grievances_resolved: number;
          user_satisfaction: number;
          last_updated?: string;
        };
        Update: {
          id?: string;
          resolution_rate?: number;
          avg_response_time?: number;
          grievances_resolved?: number;
          user_satisfaction?: number;
          last_updated?: string;
        };
      };
    };
  };
} 