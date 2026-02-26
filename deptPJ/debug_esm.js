import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log("Checking Supabase connection with:");
console.log("URL:", supabaseUrl);
console.log("Key length:", supabaseAnonKey.length);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    try {
        console.log("Querying brand_spotlights...");
        const { data, error } = await supabase.from('brand_spotlights').select('*');
        if (error) {
            console.error("Supabase error:", error);
        } else {
            console.log("Success! Found rows:", data.length);
            if (data.length > 0) {
                console.log("Sample:", JSON.stringify(data[0], null, 2));
            }
        }

        console.log("Querying artists...");
        const { data: artists, error: artistError } = await supabase.from('artists').select('*');
        if (artistError) console.error("Artist error:", artistError);
        else console.log("Artists count:", artists.length);

    } catch (err) {
        console.error("Thrown error:", err);
    }
    process.exit(0);
}

check();
