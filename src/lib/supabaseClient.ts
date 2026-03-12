import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase: CRITICAL ERROR - URL or Anon Key is missing! Check your .env file and restart Vite.');
}

export const supabase = createClient<any>(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);

export const SUPABASE_MEDIA_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/dept-media`;

