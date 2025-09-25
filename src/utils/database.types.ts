export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "13.0.4";
    };
    public: {
        Tables: {
            accounts: {
                Row: {
                    access_token: string | null;
                    access_token_expires_at: string | null;
                    account_id: string;
                    created_at: string;
                    id: string;
                    id_token: string | null;
                    password: string | null;
                    provider_id: string;
                    refresh_token: string | null;
                    refresh_token_expires_at: string | null;
                    scope: string | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    access_token?: string | null;
                    access_token_expires_at?: string | null;
                    account_id: string;
                    created_at?: string;
                    id: string;
                    id_token?: string | null;
                    password?: string | null;
                    provider_id: string;
                    refresh_token?: string | null;
                    refresh_token_expires_at?: string | null;
                    scope?: string | null;
                    updated_at: string;
                    user_id: string;
                };
                Update: {
                    access_token?: string | null;
                    access_token_expires_at?: string | null;
                    account_id?: string;
                    created_at?: string;
                    id?: string;
                    id_token?: string | null;
                    password?: string | null;
                    provider_id?: string;
                    refresh_token?: string | null;
                    refresh_token_expires_at?: string | null;
                    scope?: string | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "accounts_user_id_users_id_fk";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            actions: {
                Row: {
                    created_at: string;
                    custom_id: string;
                    name: string | null;
                    params: Json;
                    template: string;
                    uid: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    custom_id: string;
                    name?: string | null;
                    params: Json;
                    template: string;
                    uid: string;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    custom_id?: string;
                    name?: string | null;
                    params?: Json;
                    template?: string;
                    uid?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "actions_template_fkey";
                        columns: ["template"];
                        isOneToOne: false;
                        referencedRelation: "templates";
                        referencedColumns: ["template_id"];
                    },
                ];
            };
            actions_v2: {
                Row: {
                    created_at: string;
                    id: string;
                    name: string | null;
                    params: Json | null;
                    template_id: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    id: string;
                    name?: string | null;
                    params?: Json | null;
                    template_id: string;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    name?: string | null;
                    params?: Json | null;
                    template_id?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            sessions: {
                Row: {
                    created_at: string;
                    expires_at: string;
                    id: string;
                    ip_address: string | null;
                    token: string;
                    updated_at: string;
                    user_agent: string | null;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    expires_at: string;
                    id: string;
                    ip_address?: string | null;
                    token: string;
                    updated_at: string;
                    user_agent?: string | null;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    expires_at?: string;
                    id?: string;
                    ip_address?: string | null;
                    token?: string;
                    updated_at?: string;
                    user_agent?: string | null;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "sessions_user_id_users_id_fk";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            templates: {
                Row: {
                    components: Json | null;
                    created_at: string;
                    name: string | null;
                    template_id: string;
                    uid: string;
                    updated_at: string;
                };
                Insert: {
                    components?: Json | null;
                    created_at?: string;
                    name?: string | null;
                    template_id: string;
                    uid: string;
                    updated_at?: string;
                };
                Update: {
                    components?: Json | null;
                    created_at?: string;
                    name?: string | null;
                    template_id?: string;
                    uid?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            templates_v2: {
                Row: {
                    components: Json;
                    created_at: string;
                    id: string;
                    name: string | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    components?: Json;
                    created_at?: string;
                    id: string;
                    name?: string | null;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    components?: Json;
                    created_at?: string;
                    id?: string;
                    name?: string | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "templates_v2_user_id_users_id_fk";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            users: {
                Row: {
                    created_at: string;
                    email: string;
                    email_verified: boolean;
                    id: string;
                    image: string | null;
                    name: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    email: string;
                    email_verified?: boolean;
                    id: string;
                    image?: string | null;
                    name: string;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    email?: string;
                    email_verified?: boolean;
                    id?: string;
                    image?: string | null;
                    name?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            verifications: {
                Row: {
                    created_at: string;
                    expires_at: string;
                    id: string;
                    identifier: string;
                    updated_at: string;
                    value: string;
                };
                Insert: {
                    created_at?: string;
                    expires_at: string;
                    id: string;
                    identifier: string;
                    updated_at?: string;
                    value: string;
                };
                Update: {
                    created_at?: string;
                    expires_at?: string;
                    id?: string;
                    identifier?: string;
                    updated_at?: string;
                    value?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
            DefaultSchema["Views"])
      ? (DefaultSchema["Tables"] &
            DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        | keyof DefaultSchema["Enums"]
        | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
      ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema["CompositeTypes"]
        | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
      ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    public: {
        Enums: {},
    },
} as const;
