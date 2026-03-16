import fs from 'fs';
fs.writeFileSync('test_io.log', 'Node IO Test OK\n');
console.log('Test OK');
process.exit(0);
