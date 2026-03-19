import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const passwords = ['Bingsoo2019!!!', 'Bingsoo2019!!', 'admin123!'];
const host = '127.0.0.1';
const user = 'admin';
const database = 'dept_db';

async function testPasswords() {
  const results = [];
  for (const pw of passwords) {
    console.log(`Testing password: ${pw}`);
    try {
      const connection = await mysql.createConnection({
        host,
        user,
        password: pw,
        database
      });
      console.log(`Success with password: ${pw}`);
      results.push({ password: pw, success: true });
      await connection.end();
      break; // Found the right one
    } catch (err) {
      console.error(`Failed with password: ${pw} - ${err.message}`);
      results.push({ password: pw, success: false, error: err.message });
    }
  }
  fs.writeFileSync(path.join(__dirname, 'pw_test_results.json'), JSON.stringify(results, null, 2));
}

testPasswords();
