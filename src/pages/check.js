const fs = require('fs');
const content = fs.readFileSync('c:/dev/DEPT-Pj2-main/src/pages/AboutPage.tsx', 'utf8');
const matches = [...content.matchAll(/id="(\d{2})"[^>]*title="([^"]+)"/g)];
matches.forEach(m => console.log(`${m[1]} - ${m[2]}`));
