export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      patients: {
        Row: {
          apellido1: string;
          apellido2: string | null;
          comuna: string | null;
          created_at: string;
          created_by: string | null;
          diagnostico: string;
          grupo_diagnostico: string | null;
          direccion: string | null;
          email: string | null;
          antecedentes_morbidos: string | null;
          motivo_egreso: string | null;
          fecha_egreso: string | null;
          fecha_fallecimiento: string | null;
          fecha_ingreso_hospital: string;
          fecha_ingreso_uci: string | null;
          fecha_nacimiento: string | null;
          genero: string | null;
          ges: boolean | null;
          id: string;
          id_rut: string;
          n_ficha: number;
          nacionalidad: string | null;
          nombre_social: string | null;
          nombres: string;
          prevision: string | null;
          provincia: string | null;
          pueblo_originario: string | null;
          region: string | null;
          sexo: string | null;
          status: string;
          tipo_ges: string | null;
          updated_at: string;
        };
        Insert: {
          apellido1: string;
          apellido2?: string | null;
          comuna?: string | null;
          created_at?: string;
          created_by?: string | null;
          diagnostico: string;
          grupo_diagnostico?: string | null;
          direccion?: string | null;
          email?: string | null;
          antecedentes_morbidos?: string | null;
          motivo_egreso?: string | null;
          fecha_egreso?: string | null;
          fecha_fallecimiento?: string | null;
          fecha_ingreso_hospital: string;
          fecha_ingreso_uci?: string | null;
          fecha_nacimiento?: string | null;
          genero?: string | null;
          ges?: boolean | null;
          id?: string;
          id_rut: string;
          n_ficha: number;
          nacionalidad?: string | null;
          nombre_social?: string | null;
          nombres: string;
          prevision?: string | null;
          provincia?: string | null;
          pueblo_originario?: string | null;
          region?: string | null;
          sexo?: string | null;
          status?: string;
          tipo_ges?: string | null;
          updated_at?: string;
        };
        Update: {
          apellido1?: string;
          apellido2?: string | null;
          diagnostico?: string;
          grupo_diagnostico?: string | null;
          fecha_egreso?: string | null;
          antecedentes_morbidos?: string | null;
          motivo_egreso?: string | null;
          fecha_ingreso_hospital?: string;
          fecha_ingreso_uci?: string | null;
          id?: string;
          id_rut?: string;
          n_ficha?: number;
          nombres?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      clinical_records: {
        Row: {
          created_at: string;
          created_by: string | null;
          driving_pressure: number | null;
          eb: number | null;
          epap: number | null;
          fio2: number;
          flujo: number | null;
          hco3: number | null;
          id: string;
          iox: number | null;
          lactato: number | null;
          paco2: number | null;
          pafi: number | null;
          pao2: number | null;
          patient_id: string;
          pcr: number | null;
          peep: number | null;
          pmva: number | null;
          procalcitonina: number | null;
          ps: number | null;
          recorded_at: string;
          support: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          driving_pressure?: number | null;
          eb?: number | null;
          epap?: number | null;
          fio2: number;
          flujo?: number | null;
          hco3?: number | null;
          id?: string;
          iox?: number | null;
          lactato?: number | null;
          paco2?: number | null;
          pafi?: number | null;
          pao2?: number | null;
          patient_id: string;
          pcr?: number | null;
          peep?: number | null;
          pmva?: number | null;
          procalcitonina?: number | null;
          ps?: number | null;
          recorded_at: string;
          support: string;
          updated_at?: string;
        };
        Update: {
          driving_pressure?: number | null;
          eb?: number | null;
          epap?: number | null;
          fio2?: number;
          flujo?: number | null;
          hco3?: number | null;
          iox?: number | null;
          lactato?: number | null;
          paco2?: number | null;
          pafi?: number | null;
          pao2?: number | null;
          pcr?: number | null;
          peep?: number | null;
          pmva?: number | null;
          procalcitonina?: number | null;
          ps?: number | null;
          recorded_at?: string;
          support?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clinical_records_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_records_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      apache_scores: {
        Row: {
          age_points: number;
          aps_points: number;
          chronic_points: number;
          created_at: string;
          created_by: string | null;
          gcs_points: number;
          id: string;
          mortality_pct: number;
          patient_id: string;
          payload: Json;
          score: number;
          scored_at: string;
          updated_at: string;
        };
        Insert: {
          age_points?: number;
          aps_points?: number;
          chronic_points?: number;
          created_at?: string;
          created_by?: string | null;
          gcs_points?: number;
          id?: string;
          mortality_pct: number;
          patient_id: string;
          payload?: Json;
          score: number;
          scored_at: string;
          updated_at?: string;
        };
        Update: {
          age_points?: number;
          aps_points?: number;
          chronic_points?: number;
          gcs_points?: number;
          mortality_pct?: number;
          payload?: Json;
          score?: number;
          scored_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "apache_scores_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      vmi_episodes: {
        Row: {
          created_at: string;
          created_by: string | null;
          fecha_extubacion: string | null;
          fecha_iot: string;
          id: string;
          intubacion_dificil: boolean;
          lugar_iot: string | null;
          motivo_otro: string | null;
          motivo_vmi: string;
          observaciones: string | null;
          patient_id: string;
          reintubacion: boolean;
          updated_at: string;
          via_aerea: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          fecha_extubacion?: string | null;
          fecha_iot: string;
          id?: string;
          intubacion_dificil?: boolean;
          lugar_iot?: string | null;
          motivo_otro?: string | null;
          motivo_vmi: string;
          observaciones?: string | null;
          patient_id: string;
          reintubacion?: boolean;
          updated_at?: string;
          via_aerea: string;
        };
        Update: {
          fecha_extubacion?: string | null;
          fecha_iot?: string;
          intubacion_dificil?: boolean;
          lugar_iot?: string | null;
          motivo_otro?: string | null;
          motivo_vmi?: string;
          observaciones?: string | null;
          reintubacion?: boolean;
          updated_at?: string;
          via_aerea?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vmi_episodes_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          is_active: boolean;
          role: string;
          updated_at: string;
          username: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name: string;
          id: string;
          is_active?: boolean;
          role?: string;
          updated_at?: string;
          username: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          role?: string;
          updated_at?: string;
          username?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      delete_patient: { Args: { p_id: string }; Returns: undefined };
      email_for_username: { Args: { p_username: string }; Returns: string };
      upsert_patient: {
        Args: { p_id: string | null; p_payload: Json };
        Returns: Database["public"]["Tables"]["patients"]["Row"];
      };
      upsert_apache_score: {
        Args: { p_id: string | null; p_payload: Json };
        Returns: Database["public"]["Tables"]["apache_scores"]["Row"];
      };
      delete_apache_score: { Args: { p_id: string }; Returns: undefined };
      upsert_clinical_record: {
        Args: { p_id: string | null; p_payload: Json };
        Returns: Database["public"]["Tables"]["clinical_records"]["Row"];
      };
      delete_clinical_record: { Args: { p_id: string }; Returns: undefined };
      upsert_vmi_episode: {
        Args: { p_id: string | null; p_payload: Json };
        Returns: Database["public"]["Tables"]["vmi_episodes"]["Row"];
      };
      delete_vmi_episode: { Args: { p_id: string }; Returns: undefined };
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

export type Profile = Tables<"profiles">;
export type Patient = Tables<"patients">;
export type ApacheScore = Tables<"apache_scores">;
export type ClinicalRecord = Tables<"clinical_records">;
export type VmiEpisode = Tables<"vmi_episodes">;
export type PatientStatus = "hospitalized" | "not_hospitalized" | "deceased";
export type StaffRole = "admin" | "investigator" | "coordinator" | "staff";
