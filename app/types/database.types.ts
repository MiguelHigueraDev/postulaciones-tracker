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
      companies: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          name_normalized: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          name_normalized: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          name_normalized?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          application_month: string
          comment: string | null
          company_id: string
          created_at: string
          id: string
          industry: string
          last_stage: string | null
          position: string
          response_time: string
          result: string
          stages_reached: number
        }
        Insert: {
          application_month: string
          comment?: string | null
          company_id: string
          created_at?: string
          id?: string
          industry: string
          last_stage?: string | null
          position: string
          response_time: string
          result: string
          stages_reached?: number
        }
        Update: {
          application_month?: string
          comment?: string | null
          company_id?: string
          created_at?: string
          id?: string
          industry?: string
          last_stage?: string | null
          position?: string
          response_time?: string
          result?: string
          stages_reached?: number
        }
        Relationships: [
          {
            foreignKeyName: "submissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      workplace_profiles: {
        Row: {
          id: string
          submission_id: string
          salary: number | null
          good_things: string | null
          bad_things: string | null
          benefits: string | null
          modality: string | null
          rating_work_environment: number | null
          rating_work_life_balance: number | null
          rating_career_opportunities: number | null
          rating_compensation_benefits: number | null
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          salary?: number | null
          good_things?: string | null
          bad_things?: string | null
          benefits?: string | null
          modality?: string | null
          rating_work_environment?: number | null
          rating_work_life_balance?: number | null
          rating_career_opportunities?: number | null
          rating_compensation_benefits?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          salary?: number | null
          good_things?: string | null
          bad_things?: string | null
          benefits?: string | null
          modality?: string | null
          rating_work_environment?: number | null
          rating_work_life_balance?: number | null
          rating_career_opportunities?: number | null
          rating_compensation_benefits?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workplace_profiles_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_companies_overview: {
        Args: {
          p_limit?: number
        }
        Returns: {
          id: string
          name: string
          name_normalized: string
          logo_url: string | null
          review_count: number
          avg_rating: number | string | null
          accept_rate: number | string | null
          ghost_rate: number | string | null
        }[]
      }
      get_company_stats: {
        Args: {
          p_name_normalized: string
        }
        Returns: {
          company: {
            id: string
            name: string
            name_normalized: string
            logo_url: string | null
          }
          stats: {
            total: number
            results: { key: string; count: number }[]
            response_times: { key: string; count: number }[]
            stages: {
              average: number | string
              min: number
              max: number
            }
            last_stages: { key: string; count: number }[]
            industries: { key: string; count: number }[]
            positions: { key: string; count: number }[]
            workplace: {
              count: number
              salary_avg: number | null
              salary_min: number | null
              salary_max: number | null
              salary_median: number | null
              salary_count: number
              avg_work_environment: number | string | null
              avg_work_life_balance: number | string | null
              avg_career_opportunities: number | string | null
              avg_compensation_benefits: number | string | null
              ratings_count: number
              modalities: { key: string; count: number }[]
            } | null
          }
        } | null
      }
      get_global_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total: number
          results: { key: string; count: number }[]
          response_times: { key: string; count: number }[]
          stages: {
            average: number | string
            min: number
            max: number
          }
          last_stages: { key: string; count: number }[]
          industries: { key: string; count: number }[]
          positions: { key: string; count: number }[]
          workplace: {
            count: number
            salary_avg: number | null
            salary_min: number | null
            salary_max: number | null
            salary_median: number | null
            salary_count: number
            avg_work_environment: number | string | null
            avg_work_life_balance: number | string | null
            avg_career_opportunities: number | string | null
            avg_compensation_benefits: number | string | null
            ratings_count: number
            modalities: { key: string; count: number }[]
          } | null
        }
      }
      get_position_stats: {
        Args: {
          p_slug: string
        }
        Returns: {
          position: {
            slug: string
            label: string
          }
          stats: {
            total: number
            results: { key: string; count: number }[]
            response_times: { key: string; count: number }[]
            stages: {
              average: number | string
              min: number
              max: number
            }
            last_stages: { key: string; count: number }[]
            industries: { key: string; count: number }[]
            companies: { key: string; slug: string; count: number }[]
            workplace: {
              count: number
              salary_avg: number | null
              salary_min: number | null
              salary_max: number | null
              salary_median: number | null
              salary_p25: number | null
              salary_p75: number | null
              salary_count: number
              avg_work_environment: number | string | null
              avg_work_life_balance: number | string | null
              avg_career_opportunities: number | string | null
              avg_compensation_benefits: number | string | null
              ratings_count: number
              modalities: { key: string; count: number }[]
            } | null
            top_companies_by_rating: {
              name: string
              slug: string
              overall: number | string | null
              ratings_count: number
            }[]
          }
        } | null
      }
      get_positions_index: {
        Args: Record<PropertyKey, never>
        Returns: { slug: string; label: string; count: number }[]
      }
      get_workplace_stats: {
        Args: {
          p_name_normalized?: string | null
          p_position?: string | null
        }
        Returns: {
          positions: { key: string; count: number }[]
          workplace: {
            count: number
            salary_avg: number | null
            salary_min: number | null
            salary_max: number | null
            salary_median: number | null
            salary_count: number
            avg_work_environment: number | string | null
            avg_work_life_balance: number | string | null
            avg_career_opportunities: number | string | null
            avg_compensation_benefits: number | string | null
            ratings_count: number
            modalities: { key: string; count: number }[]
          } | null
        } | null
      }
      submit_feedback: {
        Args: {
          p_application_month: string
          p_comment?: string
          p_company_name: string
          p_industry: string
          p_last_stage?: string
          p_position: string
          p_response_time: string
          p_result: string
          p_stages_reached: number
          p_salary?: number
          p_good_things?: string
          p_bad_things?: string
          p_benefits?: string
          p_modality?: string
          p_rating_work_environment?: number
          p_rating_work_life_balance?: number
          p_rating_career_opportunities?: number
          p_rating_compensation_benefits?: number
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
