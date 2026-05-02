import pool from '../config/db.js';

export const getAllFeatures = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM landing_features ORDER BY display_order ASC, id ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error in getAllFeatures:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const createFeature = async (req, res) => {
    try {
        const { 
            feature_id, number, subtitle, title, kor_title, 
            description, detail_info, benefits, media_url, 
            media_type, gradient, display_order 
        } = req.body;
        
        const [result] = await pool.query(
            `INSERT INTO landing_features (
                feature_id, number, subtitle, title, kor_title, 
                description, detail_info, benefits, media_url, 
                media_type, gradient, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                feature_id, number, JSON.stringify(subtitle), title, JSON.stringify(kor_title),
                JSON.stringify(description), JSON.stringify(detail_info), JSON.stringify(benefits),
                media_url, media_type, gradient, display_order || 0
            ]
        );
        
        res.status(201).json({ id: result.insertId, message: 'Feature created successfully' });
    } catch (error) {
        console.error('Error in createFeature:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const updateFeature = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            feature_id, number, subtitle, title, kor_title, 
            description, detail_info, benefits, media_url, 
            media_type, gradient, display_order 
        } = req.body;
        
        await pool.query(
            `UPDATE landing_features SET 
                feature_id = ?, number = ?, subtitle = ?, title = ?, kor_title = ?, 
                description = ?, detail_info = ?, benefits = ?, media_url = ?, 
                media_type = ?, gradient = ?, display_order = ?
            WHERE id = ?`,
            [
                feature_id, number, JSON.stringify(subtitle), title, JSON.stringify(kor_title),
                JSON.stringify(description), JSON.stringify(detail_info), JSON.stringify(benefits),
                media_url, media_type, gradient, display_order || 0,
                id
            ]
        );
        
        res.json({ message: 'Feature updated successfully' });
    } catch (error) {
        console.error('Error in updateFeature:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const deleteFeature = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM landing_features WHERE id = ?', [id]);
        res.json({ message: 'Feature deleted successfully' });
    } catch (error) {
        console.error('Error in deleteFeature:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
