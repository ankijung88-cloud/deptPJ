import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:3000';

async function verify() {
    console.log('--- Site Functionality Verification ---');
    
    // 1. Check Server Status
    try {
        const resp = await fetch(`${BASE_URL}/api/products`);
        if (resp.ok) {
            console.log('[OK] Server is reachable (API products).');
        } else {
            console.error('[ER] Server API check failed with status:', resp.status);
        }
    } catch (err) {
        console.error('[ER] Server is not reachable. Is it running?', err.message);
        return;
    }

    // 2. Test File Upload (SSD)
    try {
        console.log('Testing file upload to SSD...');
        const form = new FormData();
        // Create a dummy image buffer
        const buffer = Buffer.from('test image content');
        form.append('file', buffer, { filename: 'test_ssd_verify.png', contentType: 'image/png' });

        const uploadResp = await fetch(`${BASE_URL}/api/upload`, {
            method: 'POST',
            body: form,
            headers: {
                'Authorization': 'Bearer mock-admin-token-verify'
            }
        });

        const uploadData = await uploadResp.json();
        if (uploadResp.ok && uploadData.url) {
            console.log('[OK] File upload successful:', uploadData.url);
            
            // 3. Test File Retrieval (Static Serving)
            const fileUrl = `${BASE_URL}${uploadData.url}`;
            console.log(`Verifying file retrieval from ${fileUrl}...`);
            const getResp = await fetch(fileUrl);
            if (getResp.ok) {
                console.log('[OK] File retrieval successful (SSD static serving).');
            } else {
                console.error('[ER] File retrieval failed status:', getResp.status);
            }
        } else {
            console.error('[ER] File upload failed:', uploadData.message || 'Unknown error');
        }
    } catch (err) {
        console.error('[ER] Upload/Retrieval test error:', err.message);
    }

    console.log('--- Verification Complete ---');
}

verify();
