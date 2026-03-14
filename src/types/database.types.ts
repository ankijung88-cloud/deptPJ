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
            featured_items: {
                Row: {
                    id: string
                    created_at: string
                    title: Json
                    category: string
                    subcategory: string | null
                    description: Json
                    image_url: string
                    thumbnail_url: string | null
                    event_date: Json | null
                    location: Json | null
                    price: string | null
                    closed_days: Json | null
                    video_url: string | null
                }
            },
            floor_categories: {
                Row: {
                    id: string
                    floor: string
                    title: Json
                    description: Json
                    bg_image: string
                    content: Json | null
                    subitems: Json | null
                    color: string | null
                    video_url: string | null
                    created_at: string
                }
            },
            nav_items: {
                Row: {
                    id: string
                    href: string
                    subitems: Json | null
                    created_at: string
                }
            },
            notices: {
                Row: {
                    id: number
                    title: Json
                    content: Json
                    category: string
                    date: string
                    is_important: boolean
                    created_at: string
                }
            },
            faqs: {
                Row: {
                    id: number
                    question: Json
                    answer: Json
                    category: string | null
                    display_order: number
                    created_at: string
                }
            }
        }
    }
}
