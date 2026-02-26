require('dotenv').config();
console.log("VITE_SUPABASE_URL:", process.env.VITE_SUPABASE_URL ? "Exists" : "MISSING");
console.log("VITE_SUPABASE_ANON_KEY:", process.env.VITE_SUPABASE_ANON_KEY ? "Exists" : "MISSING");

const { createClient } = require('@supabase/supabase-js');
console.log("Supabase client library loaded.");

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing credentials!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log("Supabase client initialized.");

async function test() {
    console.log("Sending query to brand_spotlights...");
    const { data, error } = await supabase.from('brand_spotlights').select('*').limit(1);
    console.log("Query returned.");
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Success! Data count in brand_spotlights:", data.length);
    }
    process.exit(0);
}

test().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
