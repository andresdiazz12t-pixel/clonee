export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string
          email: string
          phone: string
          role: 'admin' | 'user'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name: string
          email: string
          phone: string
          role?: 'admin' | 'user'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string
          email?: string
          phone?: string
          role?: 'admin' | 'user'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      spaces: {
        Row: {
          id: string
          name: string
          type: string
          capacity: number
          description: string
          operating_hours_start: string
          operating_hours_end: string
          rules: string[]
          is_active: boolean
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          capacity: number
          description: string
          operating_hours_start: string
          operating_hours_end: string
          rules?: string[]
          is_active?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          capacity?: number
          description?: string
          operating_hours_start?: string
          operating_hours_end?: string
          rules?: string[]
          is_active?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          space_id: string
          user_id: string
          date: string
          start_time: string
          end_time: string
          event: string
          status: 'confirmed' | 'upcoming' | 'in-progress' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          space_id: string
          user_id: string
          date: string
          start_time: string
          end_time: string
          event: string
          status?: 'confirmed' | 'upcoming' | 'in-progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          space_id?: string
          user_id?: string
          date?: string
          start_time?: string
          end_time?: string
          event?: string
          status?: 'confirmed' | 'upcoming' | 'in-progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          max_advance_days: number
          max_concurrent_reservations: number
          internal_message: string
        }
        Insert: {
          id?: string
          max_advance_days?: number
          max_concurrent_reservations?: number
          internal_message?: string
        }
        Update: {
          id?: string
          max_advance_days?: number
          max_concurrent_reservations?: number
          internal_message?: string
        }
      }
    }
  }
}
