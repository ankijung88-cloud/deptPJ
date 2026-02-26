import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
    console.log("--- Supabase Data Health Check ---");
    try {
        const tables = ['brand_spotlights', 'artists', 'featured_items', 'calendar_events', 'live_shorts'];
        for (const table of tables) {
            const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: false });
            if (error) {
                console.error(`[${table}] Error:`, error.message);
            } else {
                console.log(`[${table}] Success: Found ${data ? data.length : 0} rows.`);
                if (data && data.length > 0) {
                    console.log(`  Sample ID: ${data[0].id}`);
                    if (table === 'live_shorts') {
                        console.log(`  Sample Video URL: ${data[0].video_url}`);
                    }
                }
            }
        }
    } catch (err) {
        console.error("Critical error during check:", err);
    }
}

checkData();
