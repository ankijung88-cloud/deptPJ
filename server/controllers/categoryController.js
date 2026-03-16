import pool from '../config/db.js';

export const getFloorCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM floor_categories ORDER BY id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNavItems = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM nav_items ORDER BY id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Floor Category CRUD
export const createFloorCategory = async (req, res) => {
  const { 
    id, floor, title, description, bg_image, bgImage, 
    content, subitems, color, video_url, videoUrl 
  } = req.body;

  const final_bg_image = bg_image || bgImage;
  const final_video_url = video_url || videoUrl;

  try {
    const query = `
      INSERT INTO floor_categories (id, floor, title, description, bg_image, content, subitems, color, video_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(query, [
      id, 
      floor, 
      JSON.stringify(title), 
      JSON.stringify(description), 
      final_bg_image, 
      JSON.stringify(content), 
      JSON.stringify(subitems), 
      color, 
      final_video_url
    ]);
    res.status(201).json({ id, message: 'Floor category created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFloorCategory = async (req, res) => {
  const { id } = req.params;
  const { 
    floor, title, description, bg_image, bgImage, 
    content, subitems, color, video_url, videoUrl 
  } = req.body;

  // Flexible mapping for camelCase or snake_case
  const final_bg_image = bg_image || bgImage;
  const final_video_url = video_url || videoUrl;

  try {
    const query = `
      UPDATE floor_categories 
      SET floor = ?, title = ?, description = ?, bg_image = ?, content = ?, subitems = ?, color = ?, video_url = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(query, [
      floor, 
      JSON.stringify(title), 
      JSON.stringify(description), 
      final_bg_image, 
      JSON.stringify(content), 
      JSON.stringify(subitems), 
      color, 
      final_video_url, 
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No category found with this ID to update. If this is a new floor, please use Create instead of Update.' });
    }

    res.json({ message: 'Floor category updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFloorCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM floor_categories WHERE id = ?', [id]);
    res.json({ message: 'Floor category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Nav Item CRUD
export const createNavItem = async (req, res) => {
  const { id, href, subitems } = req.body;
  try {
    const query = `INSERT INTO nav_items (id, href, subitems) VALUES (?, ?, ?)`;
    await pool.query(query, [id, href, JSON.stringify(subitems)]);
    res.status(201).json({ id, message: 'Nav item created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNavItem = async (req, res) => {
  const { id } = req.params;
  const { href, subitems } = req.body;
  try {
    const query = `UPDATE nav_items SET href = ?, subitems = ? WHERE id = ?`;
    await pool.query(query, [href, JSON.stringify(subitems), id]);
    res.json({ message: 'Nav item updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNavItem = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM nav_items WHERE id = ?', [id]);
    res.json({ message: 'Nav item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
