import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase: Initializing client with URL:', supabaseUrl ? supabaseUrl.substring(0, 15) + '...' : 'UNDEFINED');
console.log('Supabase: Anon Key:', supabaseAnonKey ? 'DEFINED (Length: ' + supabaseAnonKey.length + ')' : 'UNDEFINED');

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

console.log('Supabase: Client created object exists:', !!supabase);
