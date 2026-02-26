require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function test() {
    console.log("Fetching brand_spotlights...");
    const { data, error } = await supabase.from('brand_spotlights').select('*');
    console.log('Error:', error);
    console.log('Data count:', data?.length);
    if (data?.length > 0) console.log('First item:', data[0]);
    process.exit(0);
}
test();
