const fs = require('fs');
const { execSync } = require('child_process');

const content = fs.readFileSync('src/i18n/index.ts', 'utf-8');
const lines = content.split('\n');
let keys = [];
let inKo = false;

for (let line of lines) {
    if (line.includes('ko: {')) {
        inKo = true;
        continue;
    }
    if (inKo && line.includes('en: {')) {
        break;
    }
    if (inKo) {
        const matchStr = line.match(/"([^"]+)":\s*"/);
        if (matchStr) {
            keys.push(matchStr[1]);
        }
    }
}

let unused = [];
for (let key of keys) {
    try {
        const out = execSync("git grep -F '" + key + "' src/", {encoding: 'utf8'});
    } catch(e) {
        if (e.status === 1) {
            unused.push(key);
        }
    }
}
console.log('Unused keys:');
console.log(unused.join(', '));
