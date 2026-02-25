const fs = require('fs');
const targetFile = 'src/data/mockData.ts';
let content = fs.readFileSync(targetFile, 'utf-8');
const lines = content.split('\n');
const outLines = [];

for (let line of lines) {
    let t = line.trim();
    if (t.startsWith("en:") || t.startsWith("en?") || t.startsWith("ja:") || t.startsWith("ja?") || t.startsWith("zh:") || t.startsWith("zh?")) {
        continue;
    }

    let newLine = line.replace(/,\s*(en|ja|zh)\??:\s*['"`].*?['"`]/g, '');
    outLines.push(newLine);
}

fs.writeFileSync(targetFile, outLines.join('\n'));
console.log('Successfully pruned translations (V4).');
