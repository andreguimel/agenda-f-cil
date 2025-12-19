export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          cancellation_token: string | null
          clinic_id: string
          created_at: string
          date: string
          google_event_id: string | null
          id: string
          notes: string | null
          patient_email: string
          patient_name: string
          patient_phone: string
          professional_id: string
          queue_position: number | null
          shift_name: string | null
          status: string
          time: string
          updated_at: string
        }
        Insert: {
          cancellation_token?: string | null
          clinic_id: string
          created_at?: string
          date: string
          google_event_id?: string | null
          id?: string
          notes?: string | null
          patient_email: string
          patient_name: string
          patient_phone: string
          professional_id: string
          queue_position?: number | null
          shift_name?: string | null
          status?: string
          time: string
          updated_at?: string
        }
        Update: {
          cancellation_token?: string | null
          clinic_id?: string
          created_at?: string
          date?: string
          google_event_id?: string | null
          id?: string
          notes?: string | null
          patient_email?: string
          patient_name?: string
          patient_phone?: string
          professional_id?: string
          queue_position?: number | null
          shift_name?: string | null
          status?: string
          time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_times: {
        Row: {
          created_at: string
          date: string
          end_time: string
          google_event_id: string | null
          id: string
          professional_id: string
          reason: string | null
          start_time: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time: string
          google_event_id?: string | null
          id?: string
          professional_id: string
          reason?: string | null
          start_time: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string
          google_event_id?: string | null
          id?: string
          professional_id?: string
          reason?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_times_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      cancellation_feedback: {
        Row: {
          clinic_id: string
          created_at: string
          feedback: string | null
          id: string
          reason: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          feedback?: string | null
          id?: string
          reason: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          feedback?: string | null
          id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "cancellation_feedback_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          closing_time: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          opening_time: string | null
          phone: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          closing_time?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          opening_time?: string | null
          phone?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          closing_time?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          opening_time?: string | null
          phone?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      google_calendar_tokens: {
        Row: {
          access_token: string
          calendar_id: string | null
          clinic_id: string
          created_at: string
          id: string
          refresh_token: string
          token_expiry: string
          updated_at: string
        }
        Insert: {
          access_token: string
          calendar_id?: string | null
          clinic_id: string
          created_at?: string
          id?: string
          refresh_token: string
          token_expiry: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          calendar_id?: string | null
          clinic_id?: string
          created_at?: string
          id?: string
          refresh_token?: string
          token_expiry?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_calendar_tokens_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_shifts: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          max_slots: number
          professional_id: string
          shift_name: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          max_slots?: number
          professional_id: string
          shift_name: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          max_slots?: number
          professional_id?: string
          shift_name?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_shifts_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          avatar_url: string | null
          clinic_id: string
          created_at: string
          duration: number
          google_calendar_id: string | null
          has_lunch_break: boolean | null
          id: string
          is_active: boolean
          lunch_end_time: string | null
          lunch_start_time: string | null
          max_advance_days: number | null
          name: string
          scheduling_mode: string
          show_queue_position: boolean
          specialty: string
          updated_at: string
          work_end_time: string | null
          work_start_time: string | null
        }
        Insert: {
          avatar_url?: string | null
          clinic_id: string
          created_at?: string
          duration?: number
          google_calendar_id?: string | null
          has_lunch_break?: boolean | null
          id?: string
          is_active?: boolean
          lunch_end_time?: string | null
          lunch_start_time?: string | null
          max_advance_days?: number | null
          name: string
          scheduling_mode?: string
          show_queue_position?: boolean
          specialty: string
          updated_at?: string
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Update: {
          avatar_url?: string | null
          clinic_id?: string
          created_at?: string
          duration?: number
          google_calendar_id?: string | null
          has_lunch_break?: boolean | null
          id?: string
          is_active?: boolean
          lunch_end_time?: string | null
          lunch_start_time?: string | null
          max_advance_days?: number | null
          name?: string
          scheduling_mode?: string
          show_queue_position?: boolean
          specialty?: string
          updated_at?: string
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          clinic_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          clinic_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          mercadopago_customer_id: string | null
          mercadopago_subscription_id: string | null
          price_amount: number
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          mercadopago_customer_id?: string | null
          mercadopago_subscription_id?: string | null
          price_amount?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          mercadopago_customer_id?: string | null
          mercadopago_subscription_id?: string | null
          price_amount?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      subscription_status:
        | "trial"
        | "active"
        | "cancelled"
        | "expired"
        | "pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      subscription_status: [
        "trial",
        "active",
        "cancelled",
        "expired",
        "pending",
      ],
    },
  },
} as const
