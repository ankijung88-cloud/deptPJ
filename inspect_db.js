
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnwuzjpggkqxcgwbjzbo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxud3V6anBnZ2txeGNnd2JqemJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NjMyODEsImV4cCI6MjA4NjQzOTI4MX0.Zvj9V5grOGlSqy1mvvUF8TPlCSX0RysnOpXPR_dtk3A';

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
    data.forEach((p) => {
        console.log(`- ID: ${p.id}`);
        console.log(`  Title: ${JSON.stringify(p.title)}`);
        console.log(`  Category: ${p.category}`);
        console.log(`  Subcategory: ${p.subcategory}`);
        // Check if subcategory is null or if it has some value
        console.log('---');
    });
}

inspectProducts();
