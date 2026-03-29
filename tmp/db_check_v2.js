import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function test() {
  // Manually parse .env since we are in a scratch script
  const envPath = 'c:\\dev\\DEPT-Pj2-main\\server\\.env';
  const env = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .reduce((acc, line) => {
      const [key, ...valParts] = line.split('=');
      if (key && valParts.length > 0) {
        acc[key.trim()] = valParts.join('=').trim();
      }
      return acc;
    }, {});

  console.log('Parsed Env:', { ...env, DB_PASS: '***' });

  const config = {
    host: env.DB_HOST || '127.0.0.1',
    user: env.DB_USER || 'admin',
    password: env.DB_PASS || 'Bingsoo2019!!!',
    database: env.DB_NAME || 'dept_db',
  };

  try {
    const conn = await mysql.createConnection(config);
    console.log('Connected to DB!');

    // Check Featured Items
    const [items] = await conn.query('SELECT id, category, subcategory, parent_id, agency_id FROM featured_items LIMIT 50');
    console.log('Featured Items Sample:');
    console.table(items);

    const [cinemaCount] = await conn.query('SELECT COUNT(*) as count FROM featured_items WHERE category LIKE \'%cinema%\'');
    console.log('Cinema Category Count:', cinemaCount[0].count);

    const [storeCount] = await conn.query('SELECT COUNT(*) as count FROM featured_items WHERE category LIKE \'%store%\'');
    console.log('Store Category Count:', storeCount[0].count);

    await conn.end();
  } catch (err) {
    console.error('Test Failed:', err.message);
  }
}

test();
