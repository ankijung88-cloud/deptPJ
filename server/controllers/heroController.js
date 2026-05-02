import pool from '../config/db.js';

export const getHeroImages = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM hero_images WHERE is_active = TRUE ORDER BY display_order ASC, created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('[HeroController] Error fetching hero images:', error);
        res.status(500).json({ message: 'Failed to fetch hero images' });
    }
};

export const addHeroImage = async (req, res) => {
    const { image_url, display_order } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO hero_images (image_url, display_order) VALUES (?, ?)',
            [image_url, display_order || 0]
        );
        res.status(201).json({ id: result.insertId, image_url, display_order });
    } catch (error) {
        console.error('[HeroController] Error adding hero image:', error);
        res.status(500).json({ message: 'Failed to add hero image' });
    }
};

export const updateHeroImageOrder = async (req, res) => {
    const { id } = req.params;
    const { display_order, is_active } = req.body;
    try {
        await pool.query(
            'UPDATE hero_images SET display_order = ?, is_active = ? WHERE id = ?',
            [display_order, is_active !== undefined ? is_active : true, id]
        );
        res.json({ message: 'Hero image updated successfully' });
    } catch (error) {
        console.error('[HeroController] Error updating hero image:', error);
        res.status(500).json({ message: 'Failed to update hero image' });
    }
};

export const deleteHeroImage = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM hero_images WHERE id = ?', [id]);
        res.json({ message: 'Hero image deleted successfully' });
    } catch (error) {
        console.error('[HeroController] Error deleting hero image:', error);
        res.status(500).json({ message: 'Failed to delete hero image' });
    }
};
