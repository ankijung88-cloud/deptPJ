import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Syncs the database data to physical source files (floors.ts and categories.json)
 * and performs a git commit.
 */
export const syncAll = async () => {
    try {
        console.log('[SyncService] Starting global synchronization...');

        // 1. Fetch data from DB
        const [floors] = await pool.query('SELECT * FROM floor_categories ORDER BY CAST(floor AS UNSIGNED) DESC');
        const [navItems] = await pool.query('SELECT * FROM nav_items');

        // --- PART A: Update src/constants/floors.ts ---
        let floorsContent = 'export const FLOORS = [\n';
        floors.forEach(row => {
            const title = typeof row.title === 'string' ? JSON.parse(row.title) : row.title;
            const subitems = typeof row.subitems === 'string' ? JSON.parse(row.subitems) : row.subitems;
            const koTitle = title?.ko || (typeof title === 'string' ? title : '');
            const level = parseInt(row.floor) || 0;

            floorsContent += '    {\n';
            floorsContent += `        level: ${level},\n`;
            floorsContent += `        title: '${koTitle}',\n`;
            floorsContent += `        label: '${row.floor}',\n`;
            floorsContent += `        color: '${row.color || '#FFFFFF'}',\n`;
            floorsContent += `        videoUrl: '${row.video_url || ''}',\n`;
            floorsContent += '        subcategories: [\n';
            
            if (Array.isArray(subitems)) {
                subitems.forEach(sub => {
                    const subLabel = sub.label?.ko || (typeof sub.label === 'string' ? sub.label : '');
                    floorsContent += `            { id: '${sub.id}', label: '${subLabel}' },\n`;
                });
            }
            floorsContent += '        ]\n';
            floorsContent += '    },\n';
        });
        floorsContent += '];\n';

        const floorsPath = path.resolve(__dirname, '../../src/constants/floors.ts');
        fs.writeFileSync(floorsPath, floorsContent, 'utf8');

        // --- PART B: Update src/i18n/categories.json ---
        const i18nData = {
            ko: { nav: {}, subcategory: {} },
            en: { nav: {}, subcategory: {} }
        };

        // Populate from nav_items
        navItems.forEach(item => {
            // Logic to map nav items if needed. For now, we focus on floor labels in nav
        });

        // Populate categories and nav labels from floors
        floors.forEach(row => {
            const title = typeof row.title === 'string' ? JSON.parse(row.title) : row.title;
            const subitems = typeof row.subitems === 'string' ? JSON.parse(row.subitems) : row.subitems;
            
            // Map floor labels to nav (e.g. floor-2: "2F | 뷰티 앤 케어")
            const floorKey = row.id; // e.g. "floor-2"
            i18nData.ko.nav[floorKey] = `${row.floor} | ${title?.ko || ''}`;
            i18nData.en.nav[floorKey] = `${row.floor} | ${title?.en || ''}`;

            // Map subcategories
            if (Array.isArray(subitems)) {
                subitems.forEach(sub => {
                    i18nData.ko.subcategory[sub.id] = sub.label?.ko || '';
                    i18nData.en.subcategory[sub.id] = sub.label?.en || '';
                });
            }
        });

        const i18nPath = path.resolve(__dirname, '../../src/i18n/categories.json');
        fs.writeFileSync(i18nPath, JSON.stringify(i18nData, null, 2), 'utf8');

        console.log('[SyncService] Successfully updated source files.');

        // 3. Git Commit & Push
        const commitMsg = `Auto-sync: categories updated from admin at ${new Date().toLocaleString()}`;
        const gitCmd = `git add src/constants/floors.ts src/i18n/categories.json && git commit -m "${commitMsg}" && git push origin main`;
        
        exec(gitCmd, { cwd: path.resolve(__dirname, '../../') }, (error, stdout, stderr) => {
            if (error) {
                console.error(`[SyncService] Git error (might be nothing to commit or push error): ${error.message}`);
                return;
            }
            console.log(`[SyncService] Git sync success: ${stdout}`);
        });

    } catch (error) {
        console.error('[SyncService] Sync failed:', error);
        throw error;
    }
};
