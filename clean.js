const fs = require('fs');
const targetFile = 'src/data/mockData.ts';
let content = fs.readFileSync(targetFile, 'utf-8');

// 1. Single-line objects: replace `, en: '...', ja: '...', zh: '...'`
content = content.replace(/,\s*(en|ja|zh)\??:\s*(['"`]).*?\2/g, '');

// 2. Multi-line properties: remove lines that purely define en/ja/zh
const lines = content.split('\n');
const newLines = lines.filter(line => {
    return !line.match(/^\s*(en|ja|zh)\??:\s*(['"`]).*?\2,?\s*\r?$/);
});

fs.writeFileSync(targetFile, newLines.join('\n'));
console.log('Successfully pruned mockData.ts using Node.js');
