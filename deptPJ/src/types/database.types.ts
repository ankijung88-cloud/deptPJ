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
            products: {
                Row: {
                    id: string
                    created_at: string
                    title: Json
                    description: Json
                    category: string
                    image_url: string
                    date: Json
                    location: Json
                    price: Json
                    closed_days: Json
                    video_url?: string
                    user_id?: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: Json
                    description: Json
                    category: string
                    image_url: string
                    date: Json
                    location: Json
                    price: Json
                    closed_days?: Json
                    video_url?: string
                    user_id?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: Json
                    description?: Json
                    category?: string
                    image_url?: string
                    date?: Json
                    location?: Json
                    price?: Json
                    closed_days?: Json
                    user_id?: string
                }
            },
            bookings: {
                Row: {
                    id: string
                    created_at: string
                    product_id: string
                    user_email: string | null
                    payment_method: string
                    status: string
                    total_price: Json
                    settlement_status?: string
                    commission_amount?: number
                    settled_amount?: number
                    settled_at?: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    product_id: string
                    user_email?: string | null
                    payment_method: string
                    status?: string
                    total_price: Json
                    settlement_status?: string
                    commission_amount?: number
                    settled_amount?: number
                    settled_at?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    product_id?: string
                    user_email?: string | null
                    payment_method?: string
                    status?: string
                    total_price?: Json
                    settlement_status?: string
                    commission_amount?: number
                    settled_amount?: number
                    settled_at?: string
                }
            },
            profiles: {
                Row: {
                    id: string
                    updated_at: string | null
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    email: string | null
                    role: string | null
                }
                Insert: {
                    id: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    email?: string | null
                    role?: string | null
                }
                Update: {
                    id?: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    email?: string | null
                    role?: string | null
                }
            }
        }
    }
}
