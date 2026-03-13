import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function restore() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
  };

  let connection;

  try {
    console.log('Starting Full Database Restoration...');
    console.log(`Connecting to ${dbConfig.host} as ${dbConfig.user}...`);
    
    // Connect without database first
    connection = await mysql.createConnection(dbConfig);

    // 0. Create Database
    const dbName = process.env.DB_NAME || 'dept_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await connection.query(`USE ${dbName}`);
    console.log(`Database "${dbName}" ensured.`);

    // 1. floor_categories
    await connection.query(`
      CREATE TABLE IF NOT EXISTS floor_categories (
        id VARCHAR(50) PRIMARY KEY,
        floor VARCHAR(10) NOT NULL,
        title JSON NOT NULL,
        description JSON NOT NULL,
        bg_image VARCHAR(255),
        content JSON,
        subitems JSON,
        color VARCHAR(20),
        video_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "floor_categories" restored.');

    // 2. nav_items
    await connection.query(`
      CREATE TABLE IF NOT EXISTS nav_items (
        id VARCHAR(50) PRIMARY KEY,
        href VARCHAR(255) NOT NULL,
        subitems JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "nav_items" restored.');

    // 3. notices
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title JSON NOT NULL,
        content JSON NOT NULL,
        category VARCHAR(50),
        date DATE,
        is_important BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "notices" restored.');

    // 4. faqs
    await connection.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question JSON NOT NULL,
        answer JSON NOT NULL,
        category VARCHAR(50),
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "faqs" restored.');

    // 5. products (categories usually referenced them, but let's ensure it exists)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        category VARCHAR(50),
        title JSON NOT NULL,
        description JSON NOT NULL,
        image_url VARCHAR(255),
        price VARCHAR(50),
        video_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "products" restored.');

    console.log('\nRestoration script completed successfully.');
    console.log('NOTE: You may need to re-populate the data via the Admin Page or a seed script.');
    
    if (connection) await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('Restoration failed:', err);
    if (connection) await connection.end();
    process.exit(1);
  }
}

restore();
