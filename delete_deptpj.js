const fs = require('fs');
const path = require('path');

function deleteRecursive(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file) => {
            const curPath = path.join(dirPath, file);
            try {
                if (fs.lstatSync(curPath).isDirectory()) {
                    deleteRecursive(curPath);
                } else {
                    console.log(`Deleting file: ${curPath}`);
                    fs.unlinkSync(curPath);
                }
            } catch (err) {
                console.error(`Error deleting ${curPath}: ${err.message}`);
            }
        });
        try {
            console.log(`Deleting directory: ${dirPath}`);
            fs.rmdirSync(dirPath);
        } catch (err) {
            console.error(`Error deleting directory ${dirPath}: ${err.message}`);
        }
    }
}

const target = path.join(process.cwd(), 'deptPJ');
deleteRecursive(target);
