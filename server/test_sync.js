import { syncAll } from './utils/syncService.js';

console.log('--- MANUAL SYNC TEST START ---');
syncAll()
    .then(() => {
        console.log('--- MANUAL SYNC TEST SUCCESS ---');
        process.exit(0);
    })
    .catch((err) => {
        console.error('--- MANUAL SYNC TEST FAILED ---');
        console.error(err);
        process.exit(1);
    });
