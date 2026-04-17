const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts, results = []) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getAllFiles(filePath, exts, results);
        } else if (exts.some(ext => filePath.endsWith(ext))) {
            results.push(filePath);
        }
    }
    return results;
}

const files = getAllFiles('src', ['.ts', '.tsx']);
let usedKeys = new Set();
const tRegex = /t\(['"]([^'"]+)['"]\)/g;

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = tRegex.exec(content)) !== null) {
        usedKeys.add(match[1]);
    }
}

// console.log("Used keys:", usedKeys);

// parse index.ts manually for ko object
const i18nContent = fs.readFileSync('src/i18n/index.ts', 'utf8');
const koStart = i18nContent.indexOf('ko: {');
const enStart = i18nContent.indexOf('en: {', koStart);
const koSection = i18nContent.substring(koStart, enStart);

// We need to build the object keys. Since it's a JS object string, let's just 
// extract lines and build path.
const lines = koSection.split('\n');
let pathStack = [];
let allDefinedKeys = new Set();

for (let line of lines) {
    if (line.includes('//') || line.includes('...')) continue;
    const matchOpen = line.match(/"([^"]+)":\s*\{/);
    if (matchOpen) {
        pathStack.push(matchOpen[1]);
        continue;
    }
    const matchClose = line.match(/^\s*\}/);
    if (matchClose) {
        pathStack.pop();
        continue;
    }
    const matchKeyValue = line.match(/"([^"]+)":\s*"/);
    if (matchKeyValue) {
        const fullKey = [...pathStack, matchKeyValue[1]].join('.');
        allDefinedKeys.add(fullKey);
    }
}

let unused = [];
for (let key of allDefinedKeys) {
    // some keys might be used dynamically like t(\subcategory_msg.\\)
    // If ANY usedKey starts with the path or if key starts with usedKey... 
    // Wait, dynamically used keys might not be literal in t('...')!
    let isUsed = false;
    for (const uk of usedKeys) {
        if (key === uk) {
            isUsed = true;
            break;
        }
    }
    if (!isUsed) {
        // Also check if any substring is dynamically used. For example, 'subcategory_msg'
        // If the code has \subcategory_msg.\\, it won't match literal.
        // We can check if "subcategory_msg" is SOMEWHERE in the files.
        unused.push(key);
    }
}

fs.writeFileSync('unused_keys.txt', unused.join('\n'));
