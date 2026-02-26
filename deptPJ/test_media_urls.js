import axios from 'axios';

const urls = [
    'https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/k-culture.mp4',
    'https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/modern_tradition.mp4',
    'https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/media_gallery.mp4',
    'https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/hanbok_runway.mp4'
];

async function testUrls() {
    console.log("--- Testing Supabase Storage URLs ---");
    for (const url of urls) {
        try {
            const response = await axios.head(url);
            console.log(`[PASS] ${url} - Status: ${response.status}`);
        } catch (error) {
            console.error(`[FAIL] ${url} - Status: ${error.response?.status || 'ERROR'}`);
        }
    }
}

testUrls();
