require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function test() {
    console.log("Fetching live_shorts...");
    const { data, error } = await supabase.from('live_shorts').select('*');
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Data count:', data?.length);
        if (data?.length > 0) {
            data.forEach((item, index) => {
                console.log(`[${index}] id: ${item.id}, video: ${item.video_url}, thumb: ${item.thumbnail_url}`);
            });
        }
    }
    process.exit(0);
}
test();
