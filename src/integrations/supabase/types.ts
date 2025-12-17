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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blog_views: {
        Row: {
          blog_id: string
          id: string
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          blog_id: string
          id?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          blog_id?: string
          id?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_views_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published: boolean | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          billing_cycle: string
          created_at: string
          currency: string
          id: string
          plan_type: string
          screenshot_url: string | null
          status: string
          user_id: string
          utr_number: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          billing_cycle: string
          created_at?: string
          currency?: string
          id?: string
          plan_type: string
          screenshot_url?: string | null
          status?: string
          user_id: string
          utr_number?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          billing_cycle?: string
          created_at?: string
          currency?: string
          id?: string
          plan_type?: string
          screenshot_url?: string | null
          status?: string
          user_id?: string
          utr_number?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          applicable_plans: string[] | null
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_amount: number | null
        }
        Insert: {
          applicable_plans?: string[] | null
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          discount_type?: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_amount?: number | null
        }
        Update: {
          applicable_plans?: string[] | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_amount?: number | null
        }
        Relationships: []
      }
      promotional_banners: {
        Row: {
          background_color: string | null
          created_at: string | null
          cta_link: string | null
          cta_text: string | null
          description: string | null
          discount_text: string | null
          display_order: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          promo_code: string | null
          starts_at: string | null
          text_color: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          discount_text?: string | null
          display_order?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          promo_code?: string | null
          starts_at?: string | null
          text_color?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          discount_text?: string | null
          display_order?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          promo_code?: string | null
          starts_at?: string | null
          text_color?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tools: {
        Row: {
          badge: string | null
          category: string
          created_at: string | null
          credits_cost: number | null
          description: string
          display_order: number | null
          icon: string | null
          id: string
          is_free_tool: boolean | null
          is_premium: boolean | null
          name: string
          route_path: string | null
          tool_type: string | null
        }
        Insert: {
          badge?: string | null
          category: string
          created_at?: string | null
          credits_cost?: number | null
          description: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_free_tool?: boolean | null
          is_premium?: boolean | null
          name: string
          route_path?: string | null
          tool_type?: string | null
        }
        Update: {
          badge?: string | null
          category?: string
          created_at?: string | null
          credits_cost?: number | null
          description?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_free_tool?: boolean | null
          is_premium?: boolean | null
          name?: string
          route_path?: string | null
          tool_type?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          credits_reset_at: string | null
          daily_credits: number
          email: string | null
          full_name: string | null
          id: string
          images_used: number
          max_daily_credits: number
          plan: Database["public"]["Enums"]["plan_type"]
          updated_at: string | null
          usage_reset_at: string | null
          user_id: string
          words_used: number
        }
        Insert: {
          created_at?: string | null
          credits_reset_at?: string | null
          daily_credits?: number
          email?: string | null
          full_name?: string | null
          id?: string
          images_used?: number
          max_daily_credits?: number
          plan?: Database["public"]["Enums"]["plan_type"]
          updated_at?: string | null
          usage_reset_at?: string | null
          user_id: string
          words_used?: number
        }
        Update: {
          created_at?: string | null
          credits_reset_at?: string | null
          daily_credits?: number
          email?: string | null
          full_name?: string | null
          id?: string
          images_used?: number
          max_daily_credits?: number
          plan?: Database["public"]["Enums"]["plan_type"]
          updated_at?: string | null
          usage_reset_at?: string | null
          user_id?: string
          words_used?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      can_access_tool: {
        Args: { _tool_id: string; _user_id: string }
        Returns: boolean
      }
      deduct_credits: {
        Args: { _amount: number; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_blog_views: { Args: { blog_id: string }; Returns: undefined }
      reset_monthly_usage: { Args: never; Returns: undefined }
      reset_user_credits: { Args: never; Returns: undefined }
      use_images: {
        Args: { _count: number; _user_id: string }
        Returns: boolean
      }
      use_words: {
        Args: { _user_id: string; _word_count: number }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
      plan_type: "free" | "pro" | "yearly" | "lifetime"
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
      app_role: ["user", "admin"],
      plan_type: ["free", "pro", "yearly", "lifetime"],
    },
  },
} as const
