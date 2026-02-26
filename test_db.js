require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
    console.log("Testing connection to Supabase...");
    try {
        const { data, error } = await supabase.from('brand_spotlights').select('*');
        if (error) {
            console.error("Supabase Error:", error);
        } else {
            console.log(`Successfully fetched ${data ? data.length : 0} records from brand_spotlights.`);
            if (data && data.length > 0) {
                console.log("First record:", data[0]);
            } else {
                console.log("Warning: Table brand_spotlights is EMPTY or RLS is blocking access.");
            }
        }
    } catch (e) {
        console.error("Exception occurred:", e);
    }
}

testDatabase();
