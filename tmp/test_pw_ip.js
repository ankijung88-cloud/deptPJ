import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const passwords = ['Bingsoo2019!!', 'admin123!', 'Bingsoo2019!!!'];
const host = '43.200.230.44';
const user = 'admin';
const database = 'dept_db';

async function test() {
  const results = [];
  for (const pw of passwords) {
    console.log(`Testing IP ${host} with password: ${pw}`);
    try {
      const conn = await mysql.createConnection({
        host,
        user,
        password: pw,
        database,
        connectTimeout: 5000
      });
      console.log(`SUCCESS: ${pw}`);
      results.push({ password: pw, success: true });
      await conn.end();
      break;
    } catch (err) {
      console.error(`FAILED: ${pw} - ${err.message}`);
      results.push({ password: pw, success: false, error: err.message });
    }
  }
  fs.writeFileSync(path.join(__dirname, 'pw_test_ip_results.json'), JSON.stringify(results, null, 2));
}

test();
