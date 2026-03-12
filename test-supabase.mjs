
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Manually parse .env
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase env vars in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    
    const tables = ['floor_categories', 'nav_items', 'featured_items', 'story_cards'];
    
    for (const table of tables) {
        console.log(`Checking table: ${table}`);
        try {
            const { data, error, status, statusText } = await supabase.from(table).select('*').limit(1);
            
            if (error) {
                console.error(`Error in table ${table}:`, error.message, 'Status:', status, statusText);
            } else {
                console.log(`Success in table ${table}:`, data.length > 0 ? 'Data found' : `No data (Status: ${status} ${statusText})`);
            }
        } catch (e) {
            console.error(`Exception in table ${table}:`, e.message);
        }
    }
}

testConnection();
