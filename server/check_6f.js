import pool from './config/db.js';

async function check() {
    try {
        console.log('Fetching 6F data...');
        const [rows] = await pool.query('SELECT floor, subitems FROM floor_categories WHERE floor = "6F"');
        if (rows.length === 0) {
            console.log('No data found for floor 6F');
        } else {
            console.log('Floor:', rows[0].floor);
            console.log('Subitems Raw:', rows[0].subitems);
            try {
                const subs = typeof rows[0].subitems === 'string' ? JSON.parse(rows[0].subitems) : rows[0].subitems;
                console.log('Subitems Parsed:', JSON.stringify(subs, null, 2));
            } catch (e) {
                console.log('Failed to parse subitems JSON');
            }
        }
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

check();
