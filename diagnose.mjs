
import https from 'https';

const supabaseUrl = 'https://tjucpoqxzsolmmceguez.supabase.co';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqdWNwb3F4enNvbG1tY2VndWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTQ5NDIsImV4cCI6MjA4NzYzMDk0Mn0.W_LJphCaQb4zjMSP8K9QmLTPMA-gawnaNUrf5m5O49U';

async function checkUrl(url, headers = {}) {
    return new Promise((resolve) => {
        const req = https.request(url, { method: 'HEAD', headers }, (res) => {
            resolve({ url, status: res.statusCode, statusText: res.statusMessage });
        });
        req.on('error', (e) => resolve({ url, error: e.message }));
        req.end();
    });
}

async function checkSupabase() {
    const url = `${supabaseUrl}/rest/v1/floor_categories?limit=1`;
    return new Promise((resolve) => {
        const req = https.request(url, {
            method: 'GET',
            headers: {
                'apikey': apikey,
                'Authorization': `Bearer ${apikey}`
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({ 
                    url, 
                    status: res.statusCode, 
                    statusText: res.statusMessage, 
                    headers: res.headers,
                    data: data.substring(0, 100) 
                });
            });
        });
        req.on('error', (e) => resolve({ url, error: e.message }));
        req.end();
    });
}

async function run() {
    console.log('--- Checking Supabase API ---');
    const sbResult = await checkSupabase();
    console.log(JSON.stringify(sbResult, null, 2));

    console.log('\n--- Checking Unsplash URLs ---');
    const unsplashUrls = [
        'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=2560&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1543431690-3b6be2c3cb19?q=80&w=2560&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517260739337-6799d239ce83?q=80&w=2560&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2560&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=2560&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1596120364993-90dcc247f07e?q=80&w=2560&auto=format&fit=crop'
    ];

    for (const url of unsplashUrls) {
        const res = await checkUrl(url);
        console.log(`${res.status === 200 ? '[OK]' : '[FAIL]'} ${res.status || res.error} - ${url.substring(0, 60)}...`);
    }
}

run();
