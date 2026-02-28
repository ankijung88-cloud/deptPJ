require('dotenv').config({ path: '.env.local' });
if (!process.env.VITE_SUPABASE_URL) require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log('Missing Supabase credentials in .env or .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
    console.log('Fetching buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        return;
    }
    console.log('Available buckets:', buckets.map(b => b.name));

    const bucketName = 'videos';
    const bucketExists = buckets.find(b => b.name === bucketName);

    if (bucketExists) {
        console.log(`\nChecking bucket: ${bucketName}...`);
        const { data, error } = await supabase.storage.from(bucketName).list('hero', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
        });
        if (error) {
            console.error('Error listing files in', bucketName, error);
        } else {
            console.log(`Files in ${bucketName}/hero:`, data?.map(f => f.name));
        }

        const { data: rootData, error: rootError } = await supabase.storage.from(bucketName).list('', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
        });
        if (rootError) {
            console.error('Error listing files in', bucketName, rootError);
        } else {
            console.log(`Files in ${bucketName} (root):`, rootData?.map(f => f.name));
        }
    } else {
        console.log(`Bucket '${bucketName}' not found. Checking root of all buckets...`);
        for (const b of buckets) {
            const { data, error } = await supabase.storage.from(b.name).list('', { limit: 10, offset: 0 });
            if (!error) console.log(`Files in ${b.name}:`, data?.map(f => f.name));
        }
    }
}
checkStorage();
