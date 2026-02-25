const fs = require('fs');
const targetFile = 'src/data/mockData.ts';
let content = fs.readFileSync(targetFile, 'utf-8');

// 1. Single-line replacements (e.g. { ko: '...', en: '...' })
// This removes `, en: "..."` etc.
content = content.replace(/,\s*(en|ja|zh)\??:\s*(['"`]).*?\2/g, '');

// 2. Multi-line replacements
// This removes whole lines like `  en: '...',`
content = content.replace(/^[ \t]*(en|ja|zh)\??:\s*(['"`]).*?\2,?\r?\n/gm, '');

fs.writeFileSync(targetFile, content);
console.log('Cleaned mockData.ts successfully');
