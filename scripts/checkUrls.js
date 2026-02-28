const https = require('https');
const fs = require('fs');

const files = ['trand.mp4', 'popup_store.mp4', 'festival.mp4', 'experience.mp4', 'travel.mp4'];
const baseUrl = 'https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/';

let output = '';
let completed = 0;

files.forEach(file => {
    https.request(baseUrl + encodeURIComponent(file), { method: 'HEAD' }, (res) => {
        output += file + ' -> HTTP ' + res.statusCode + '\n';
        completed++;
        if (completed === files.length) {
            fs.writeFileSync('C:\\dev\\DEPT-Pj2-main\\status.txt', output);
            console.log('Done writing status.txt');
        }
    }).on('error', err => {
        output += file + ' -> ERROR ' + err.message + '\n';
        completed++;
        if (completed === files.length) {
            fs.writeFileSync('C:\\dev\\DEPT-Pj2-main\\status.txt', output);
        }
    }).end();
});
