export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Legacy type exports for backward compatibility
export type AspectType = 'health' | 'nutrition' | 'finance' | 'career' | 'relationships' | 'family' | 'learning' | 'entertainment' | 'travel' | 'lifestyle'
export type AIProvider = 'openai' | 'anthropic'
export type AITone = 'casual' | 'professional' | 'friendly' | 'motivational'
