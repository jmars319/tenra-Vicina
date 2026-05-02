import type { ContentStatus, SignalCategory, SignalStatus } from "@vicina/domain";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string;
          bio?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      signals: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          description: string;
          category: SignalCategory;
          approximate_location_label: string;
          latitude: number;
          longitude: number;
          starts_at: string;
          expires_at: string;
          visibility_radius_miles: 1 | 3 | 5 | 10;
          status: SignalStatus;
          content_status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          description: string;
          category: SignalCategory;
          approximate_location_label: string;
          latitude: number;
          longitude: number;
          starts_at?: string;
          expires_at: string;
          visibility_radius_miles?: 1 | 3 | 5 | 10;
          status?: SignalStatus;
          content_status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          category?: SignalCategory;
          approximate_location_label?: string;
          latitude?: number;
          longitude?: number;
          starts_at?: string;
          expires_at?: string;
          visibility_radius_miles?: 1 | 3 | 5 | 10;
          status?: SignalStatus;
          content_status?: ContentStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      signal_interests: {
        Row: {
          id: string;
          signal_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          signal_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      signal_comments: {
        Row: {
          id: string;
          signal_id: string;
          author_id: string;
          body: string;
          content_status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          signal_id: string;
          author_id: string;
          body: string;
          content_status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          content_status?: ContentStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_blocks: {
        Row: {
          blocker_id: string;
          blocked_user_id: string;
          created_at: string;
        };
        Insert: {
          blocker_id: string;
          blocked_user_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          signal_id: string | null;
          comment_id: string | null;
          reported_user_id: string | null;
          reason: string;
          details: string | null;
          status: "open" | "reviewed" | "closed";
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          signal_id?: string | null;
          comment_id?: string | null;
          reported_user_id?: string | null;
          reason: string;
          details?: string | null;
          status?: "open" | "reviewed" | "closed";
          created_at?: string;
        };
        Update: {
          status?: "open" | "reviewed" | "closed";
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      content_status: ContentStatus;
      report_status: "open" | "reviewed" | "closed";
      signal_category: SignalCategory;
      signal_status: SignalStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
