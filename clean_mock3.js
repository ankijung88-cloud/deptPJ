const fs = require('fs');
const targetFile = 'src/data/mockData.ts';
let content = fs.readFileSync(targetFile, 'utf-8');
const lines = content.split('\n');
const outLines = [];

for (let line of lines) {
    // 1. Skip lines that are entirely just "en: '...'," or similar
    // We allow optional trailing commas and whitespace
    if (line.match(/^\s*(en|ja|zh)\??:\s*(['"`]).*?\2,?\s*\r?$/)) {
        continue;
    }

    // 2. For single-line objects like { ko: '...', en: '...', ja: '...' }
    // We remove the ", en: '...'" parts globally
    let newLine = line.replace(/,\s*(en|ja|zh)\??:\s*(['"`]).*?\2/g, '');
    outLines.push(newLine);
}

fs.writeFileSync(targetFile, outLines.join('\n'));
console.log('Successfully pruned translations (V3).');
