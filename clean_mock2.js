const fs = require('fs');
const targetFile = 'src/data/mockData.ts';
let content = fs.readFileSync(targetFile, 'utf-8');

// 1. Remove single-line translations:  , en: '...', ja: '...', zh: '...'
content = content.replace(/,\s*(en|ja|zh):\s*(['"`]).*?\2/g, '');

// 2. Remove multi-line translation lines (lines that literally start with spaces and en/ja/zh: '...')
const lines = content.split('\n');
const newLines = lines.filter(line => {
    // Check if line is just a language key
    return !line.match(/^\s*(en|ja|zh):\s*(['"`]).*?\2,?$/);
});

fs.writeFileSync(targetFile, newLines.join('\n'));
console.log('Successfully pruned multi-line and single-line translations.');
