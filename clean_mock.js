const fs = require('fs');

const targetFile = 'src/data/mockData.ts';
let content = fs.readFileSync(targetFile, 'utf-8');

// Replace single-line definitions: , en: '...', ja: '...', zh: '...'
content = content.replace(/,\s*en:\s*['"].*?['"],\s*ja:\s*['"].*?['"],\s*zh:\s*['"].*?['"]/g, '');

// Replace multi-line definitions
// Note: [^]*? matches anything including newlines non-greedily
content = content.replace(/,\s*en:\s*['"][^]*?['"],\s*ja:\s*['"][^]*?['"],\s*zh:\s*['"][^]*?['"]/g, '');

fs.writeFileSync(targetFile, content);
console.log('Successfully pruned mockData.ts');
