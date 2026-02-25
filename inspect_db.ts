
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env or .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(50);

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(`Found ${data.length} products:`);
    data.forEach((p: any) => {
        console.log(`- ID: ${p.id}`);
        console.log(`  Title: ${JSON.stringify(p.title)}`);
        console.log(`  Category: ${p.category}`);
        console.log(`  Subcategory: ${p.subcategory}`);
        console.log(`  Created At: ${p.created_at}`);
        console.log('---');
    });
}

inspectProducts();
