import pool from './config/db.js';

async function diagnose() {
    console.log('Querying DB for 6F subitems...');
    try {
        const [rows] = await pool.query('SELECT floor, subitems FROM floor_categories WHERE floor = "6F"');
        if (rows.length > 0) {
            console.log('--- DB Data for 6F ---');
            console.log('Floor:', rows[0].floor);
            // subitems might be string or object depending on driver/table type
            const subitems = typeof rows[0].subitems === 'string' ? JSON.parse(rows[0].subitems) : rows[0].subitems;
            console.log('Subitems:', JSON.stringify(subitems, null, 2));
            
            const heritage = subitems.find(s => s.id === 'heritage');
            if (heritage) {
                console.log('Heritage Background:', heritage.bgImage || 'NOT SET');
            } else {
                console.log('Heritage subitem not found in subitems list');
            }
        } else {
            console.log('Floor 6F not found in database');
        }
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('DB Error:', err);
        process.exit(1);
    }
}

diagnose();
