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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      businesses: {
        Row: {
          area: string | null
          category: Database["public"]["Enums"]["business_category"]
          collection: boolean
          created_at: string
          delivery: boolean
          description: string | null
          hours: string | null
          id: string
          name: string
          owner_id: string | null
          owner_name: string | null
          phone: string | null
          rating: number
          verified: boolean
          whatsapp: string | null
        }
        Insert: {
          area?: string | null
          category?: Database["public"]["Enums"]["business_category"]
          collection?: boolean
          created_at?: string
          delivery?: boolean
          description?: string | null
          hours?: string | null
          id?: string
          name: string
          owner_id?: string | null
          owner_name?: string | null
          phone?: string | null
          rating?: number
          verified?: boolean
          whatsapp?: string | null
        }
        Update: {
          area?: string | null
          category?: Database["public"]["Enums"]["business_category"]
          collection?: boolean
          created_at?: string
          delivery?: boolean
          description?: string | null
          hours?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          owner_name?: string | null
          phone?: string | null
          rating?: number
          verified?: boolean
          whatsapp?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          followed_business_id: string
          follower_business_id: string
        }
        Insert: {
          created_at?: string
          followed_business_id: string
          follower_business_id: string
        }
        Update: {
          created_at?: string
          followed_business_id?: string
          follower_business_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_followed_business_id_fkey"
            columns: ["followed_business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_business_id_fkey"
            columns: ["follower_business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          budget: number | null
          business_id: string
          created_at: string
          description: string | null
          event_date: string | null
          id: string
          location: string | null
          open: boolean
          title: string
          type: Database["public"]["Enums"]["opportunity_type"]
        }
        Insert: {
          budget?: number | null
          business_id: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          open?: boolean
          title: string
          type?: Database["public"]["Enums"]["opportunity_type"]
        }
        Update: {
          budget?: number | null
          business_id?: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          open?: boolean
          title?: string
          type?: Database["public"]["Enums"]["opportunity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_applications: {
        Row: {
          applicant_business_id: string
          created_at: string
          id: string
          message: string | null
          opportunity_id: string
          status: Database["public"]["Enums"]["request_status"]
        }
        Insert: {
          applicant_business_id: string
          created_at?: string
          id?: string
          message?: string | null
          opportunity_id: string
          status?: Database["public"]["Enums"]["request_status"]
        }
        Update: {
          applicant_business_id?: string
          created_at?: string
          id?: string
          message?: string | null
          opportunity_id?: string
          status?: Database["public"]["Enums"]["request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_applications_applicant_business_id_fkey"
            columns: ["applicant_business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_listings: {
        Row: {
          available: boolean
          business_id: string
          created_at: string
          description: string | null
          id: string
          min_order: number
          price: number
          title: string
          unit: string
        }
        Insert: {
          available?: boolean
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          min_order?: number
          price: number
          title: string
          unit: string
        }
        Update: {
          available?: boolean
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          min_order?: number
          price?: number
          title?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "supply_listings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_requests: {
        Row: {
          buyer_business_id: string
          created_at: string
          id: string
          listing_id: string
          message: string | null
          quantity: number
          status: Database["public"]["Enums"]["request_status"]
        }
        Insert: {
          buyer_business_id: string
          created_at?: string
          id?: string
          listing_id: string
          message?: string | null
          quantity?: number
          status?: Database["public"]["Enums"]["request_status"]
        }
        Update: {
          buyer_business_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          message?: string | null
          quantity?: number
          status?: Database["public"]["Enums"]["request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "supply_requests_buyer_business_id_fkey"
            columns: ["buyer_business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "supply_listings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      business_category:
        | "fast_food"
        | "fruit_veg"
        | "grocery"
        | "bakery"
        | "home_food"
        | "catering"
        | "delivery"
        | "other"
      opportunity_type:
        | "catering"
        | "event_supply"
        | "bulk_produce"
        | "delivery"
        | "supplier"
        | "workers"
        | "collaboration"
      request_status: "pending" | "accepted" | "declined"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      business_category: [
        "fast_food",
        "fruit_veg",
        "grocery",
        "bakery",
        "home_food",
        "catering",
        "delivery",
        "other",
      ],
      opportunity_type: [
        "catering",
        "event_supply",
        "bulk_produce",
        "delivery",
        "supplier",
        "workers",
        "collaboration",
      ],
      request_status: ["pending", "accepted", "declined"],
    },
  },
} as const
