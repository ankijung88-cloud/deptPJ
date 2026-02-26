const fs = require('fs');
let data = fs.readFileSync('mockData.ts', 'utf8');
data = data.replace(/[ \t]*thumbnailUrl:\s*'[^']+',?\r?\n/g, '');
fs.writeFileSync('mockData.ts', data);
