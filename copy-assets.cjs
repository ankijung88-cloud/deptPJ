const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/안기정/Downloads/Mi-main/Mi-main/public/assets';
const destDir = 'c:/dev/DEPT-Pj2-main/public/assets';

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

fs.readdirSync(srcDir).forEach(file => {
    if (file.endsWith('.png')) {
        fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
        console.log('Copied', file);
    }
});
console.log('Done copying assets.');
