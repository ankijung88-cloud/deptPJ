import pool from '../config/db.js';

export const getAllProducts = async (req, res) => {
  const { subcategory } = req.query;
  try {
    let query = 'SELECT * FROM featured_items';
    let params = [];
    
    if (subcategory) {
      query += ' WHERE subcategory = ?';
      params.push(subcategory);
    }
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  const { parentId } = req.query;
  console.log(`[getProductsByCategory] Fetching category: ${category}, parentId: ${parentId}`);
  try {
    let query = 'SELECT * FROM featured_items WHERE (category LIKE ? OR subcategory LIKE ?)';
    let params = [`%${category}%`, `%${category}%`];

    if (parentId && parentId !== 'undefined' && parentId !== 'null') {
      query += ' AND (parent_id = ? OR id = ?)';
      params.push(parentId, parentId);
    }

    console.log(`[getProductsByCategory] Final Query: ${query} with params: ${JSON.stringify(params)}`);

    const [rows] = await pool.query(query, params);
    console.log(`[getProductsByCategory] Returned ${rows.length} rows`);
    res.json(rows);
  } catch (error) {
    console.error('[getProductsByCategory] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM featured_items WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchProducts = async (req, res) => {
  const { q } = req.query;
  try {
    const query = `
      SELECT * FROM featured_items 
      WHERE title LIKE ? OR description LIKE ?
    `;
    const [rows] = await pool.query(query, [`%${q}%`, `%${q}%`]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { id, title, category, subcategory, description, long_description, image_url, thumbnail_url, side_image_url, back_image_url, event_date, location, price, closed_days, video_url, page_type, parent_id, theme_data, selected_templates } = req.body;

    const toJson = (val) => {
      if (val === null || val === undefined) return null;
      if (typeof val === 'string') return val;
      return JSON.stringify(val);
    };

    const query = `
      INSERT INTO featured_items 
      (id, title, category, subcategory, description, long_description, image_url, thumbnail_url, side_image_url, back_image_url, event_date, \`location\`, price, closed_days, video_url, page_type, parent_id, theme_data, selected_templates) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(query, [
      id,
      toJson(title),
      category,
      subcategory,
      toJson(description),
      toJson(long_description),
      image_url || '',
      thumbnail_url || '',
      side_image_url || '',
      back_image_url || '',
      toJson(event_date),
      toJson(location),
      price || '',
      toJson(closed_days) || '[]',
      video_url || '',
      page_type || null,
      parent_id || null,
      toJson(theme_data),
      toJson(selected_templates)
    ]);
    res.status(201).json({ id, message: 'Product created successfully' });
  } catch (error) {
    console.error('[createProduct] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const { title, category, subcategory, description, long_description, image_url, thumbnail_url, side_image_url, back_image_url, event_date, location, price, closed_days, video_url, page_type, parent_id, theme_data, selected_templates } = req.body;

    const toJson = (val) => {
      if (val === null || val === undefined) return null;
      if (typeof val === 'string') return val;
      return JSON.stringify(val);
    };

    const query = `
      UPDATE featured_items 
      SET title = ?, category = ?, subcategory = ?, description = ?, long_description = ?, image_url = ?, thumbnail_url = ?, side_image_url = ?, back_image_url = ?, event_date = ?, \`location\` = ?, price = ?, closed_days = ?, video_url = ?, page_type = ?, parent_id = ?, theme_data = ?, selected_templates = ?
      WHERE id = ?
    `;
    const params = [
      toJson(title),
      category,
      subcategory,
      toJson(description),
      toJson(long_description),
      image_url || '',
      thumbnail_url || '',
      side_image_url || '',
      back_image_url || '',
      toJson(event_date),
      toJson(location),
      price || '',
      toJson(closed_days) || '[]',
      video_url || '',
      page_type || null,
      parent_id || null,
      toJson(theme_data),
      toJson(selected_templates),
      id
    ];
    const [result] = await pool.query(query, params);
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('[updateProduct] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM featured_items WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
