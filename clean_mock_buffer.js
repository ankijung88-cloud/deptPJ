const fs = require('fs');
let content = fs.readFileSync('src/data/mockData.ts', 'utf-8');

// 1. Single-line objects: replace `, en: '...', ja: '...', zh: '...'`
content = content.replace(/,\s*(en|ja|zh)\??:\s*(['"`])(?:(?!\2).)*\2/g, '');

// 2. Multi-line properties: remove lines that purely define en/ja/zh
const lines = content.split('\n');
const newLines = lines.filter(line => {
    return !line.match(/^\s*(en|ja|zh)\??:\s*(['"`])(?:(?!\2).)*\2,?\r?$/);
});

fs.writeFileSync('src/data/mockData_clean.ts', newLines.join('\n'));
console.log('Clean file generated at src/data/mockData_clean.ts');
