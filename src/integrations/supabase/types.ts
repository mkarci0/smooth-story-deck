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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      projects: {
        Row: {
          accent: string
          category: string
          cover_url: string | null
          created_at: string
          design_system: Json
          final_solution: Json
          gallery: string[]
          gallery_meta: Json
          id: string
          outcome: Json
          overview: string
          position: number
          problem: string
          published: boolean
          research: Json
          role: string
          section_order: string[]
          sections: Json
          slug: string
          solution: string
          tagline: string
          team: string
          timeline: string
          title: string
          tools: string[]
          unified_sections: Json
          updated_at: string
          year: string
        }
        Insert: {
          accent?: string
          category?: string
          cover_url?: string | null
          created_at?: string
          design_system?: Json
          final_solution?: Json
          gallery?: string[]
          gallery_meta?: Json
          id?: string
          outcome?: Json
          overview?: string
          position?: number
          problem?: string
          published?: boolean
          research?: Json
          role?: string
          section_order?: string[]
          sections?: Json
          slug: string
          solution?: string
          tagline?: string
          team?: string
          timeline?: string
          title: string
          tools?: string[]
          unified_sections?: Json
          updated_at?: string
          year?: string
        }
        Update: {
          accent?: string
          category?: string
          cover_url?: string | null
          created_at?: string
          design_system?: Json
          final_solution?: Json
          gallery?: string[]
          gallery_meta?: Json
          id?: string
          outcome?: Json
          overview?: string
          position?: number
          problem?: string
          published?: boolean
          research?: Json
          role?: string
          section_order?: string[]
          sections?: Json
          slug?: string
          solution?: string
          tagline?: string
          team?: string
          timeline?: string
          title?: string
          tools?: string[]
          unified_sections?: Json
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          company: string
          created_at: string
          id: string
          name: string
          position: number
          published: boolean
          quote: string
          role: string
          updated_at: string
        }
        Insert: {
          company?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          published?: boolean
          quote?: string
          role?: string
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          published?: boolean
          quote?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_body: string
          about_image_url: string | null
          about_intro: string
          about_title: string
          booking_banner_cta_email: string
          booking_banner_cta_label: string
          booking_banner_enabled: boolean
          booking_banner_text: string
          created_at: string
          experience_items: Json
          experience_title: string
          footer_copyright: string
          footer_credit: string
          footer_email: string
          footer_tagline: string
          hero_eyebrow: string
          hero_subtitle: string
          hero_title: string
          id: string
          linkedin_url: string | null
          logo_variant: string
          maintenance_enabled: boolean
          maintenance_message: string
          recommendations_title: string
          resume_url: string | null
          singleton: boolean
          updated_at: string
          what_i_do_items: Json
          what_i_do_title: string
        }
        Insert: {
          about_body?: string
          about_image_url?: string | null
          about_intro?: string
          about_title?: string
          booking_banner_cta_email?: string
          booking_banner_cta_label?: string
          booking_banner_enabled?: boolean
          booking_banner_text?: string
          created_at?: string
          experience_items?: Json
          experience_title?: string
          footer_copyright?: string
          footer_credit?: string
          footer_email?: string
          footer_tagline?: string
          hero_eyebrow?: string
          hero_subtitle?: string
          hero_title?: string
          id?: string
          linkedin_url?: string | null
          logo_variant?: string
          maintenance_enabled?: boolean
          maintenance_message?: string
          recommendations_title?: string
          resume_url?: string | null
          singleton?: boolean
          updated_at?: string
          what_i_do_items?: Json
          what_i_do_title?: string
        }
        Update: {
          about_body?: string
          about_image_url?: string | null
          about_intro?: string
          about_title?: string
          booking_banner_cta_email?: string
          booking_banner_cta_label?: string
          booking_banner_enabled?: boolean
          booking_banner_text?: string
          created_at?: string
          experience_items?: Json
          experience_title?: string
          footer_copyright?: string
          footer_credit?: string
          footer_email?: string
          footer_tagline?: string
          hero_eyebrow?: string
          hero_subtitle?: string
          hero_title?: string
          id?: string
          linkedin_url?: string | null
          logo_variant?: string
          maintenance_enabled?: boolean
          maintenance_message?: string
          recommendations_title?: string
          resume_url?: string | null
          singleton?: boolean
          updated_at?: string
          what_i_do_items?: Json
          what_i_do_title?: string
        }
        Relationships: []
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
    },
  },
} as const
