import pool from '../config/db.js';

export const getAllProducts = async (req, res) => {
  const { subcategory, agencyId } = req.query;
  const user = req.user; // From authMiddleware

  try {
    let query = 'SELECT * FROM featured_items';
    let params = [];
    let conditions = [];
    
    // Role-based filtering
    if (user && user.role === 'AGENCY') {
      conditions.push('agency_id = ?');
      params.push(user.id);
    } else if (agencyId) {
      conditions.push('agency_id = ?');
      params.push(agencyId);
    }

    if (subcategory) {
      conditions.push('subcategory = ?');
      params.push(subcategory);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
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
  const user = req.user;
  
  try {
    let query = 'SELECT * FROM featured_items WHERE (category LIKE ? OR subcategory LIKE ?)';
    let params = [`%${category}%`, `%${category}%`];

    if (user && user.role === 'AGENCY') {
      query += ' AND agency_id = ?';
      params.push(user.id);
    }

    if (parentId && parentId !== 'undefined' && parentId !== 'null') {
      query += ' AND (parent_id = ? AND id != ?)';
      params.push(parentId, parentId);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const [rows] = await pool.query('SELECT * FROM featured_items WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    
    if (user && user.role === 'AGENCY' && rows[0].agency_id !== user.id) {
      return res.status(403).json({ message: 'Access denied: You do not own this product' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchProducts = async (req, res) => {
  const { q } = req.query;
  const user = req.user;

  try {
    let query = 'SELECT * FROM featured_items WHERE (title LIKE ? OR description LIKE ?)';
    let params = [`%${q}%`, `%${q}%`];

    if (user && user.role === 'AGENCY') {
      query += ' AND agency_id = ?';
      params.push(user.id);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const id = req.body.id;
    const title = req.body.title;
    const category = req.body.category;
    const subcategory = req.body.subcategory;
    const description = req.body.description;
    const long_description = req.body.long_description;
    const image_url = req.body.image_url || req.body.imageUrl;
    const thumbnail_url = req.body.thumbnail_url || req.body.thumbnailUrl;
    const side_image_url = req.body.side_image_url || req.body.sideImageUrl;
    const back_image_url = req.body.back_image_url || req.body.backImageUrl;
    const event_date = req.body.event_date || req.body.date;
    const location = req.body.location;
    const price = req.body.price;
    const closed_days = req.body.closed_days || req.body.closedDays;
    const video_url = req.body.video_url || req.body.videoUrl;
    const page_type = req.body.page_type;
    const parent_id = req.body.parent_id || req.body.parentId;
    const theme_data = req.body.theme_data;
    const selected_templates = req.body.selected_templates || req.body.selectedTemplates;

    const toJson = (val) => {
      if (val === null || val === undefined) return null;
      if (typeof val === 'string') return val;
      return JSON.stringify(val);
    };

    let agency_id = req.user?.id || null;
    
    if (req.user?.role === 'ADMIN') {
      // Admins can specify an agency_id or it defaults to null (admin-owned)
      agency_id = req.body.agency_id || req.body.agencyId || null;
      if (agency_id === 'null' || agency_id === '') agency_id = null;
    } else if (req.user?.role === 'AGENCY') {
      // Agencies always own what they create
      agency_id = req.user.id;
    }

    const query = 'INSERT INTO featured_items (id, title, category, subcategory, description, long_description, image_url, thumbnail_url, side_image_url, back_image_url, event_date, `location`, price, closed_days, video_url, page_type, parent_id, theme_data, selected_templates, agency_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [
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
      toJson(closed_days),
      video_url || '',
      page_type || 'standard',
      parent_id || null,
      toJson(theme_data),
      toJson(selected_templates),
      agency_id
    ];
    await pool.query(query, params);
    res.status(201).json({ id, message: 'Product created successfully' });
  } catch (error) {
    console.error('[createProduct] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const id = req.params.id;
  try {
    const title = req.body.title;
    const category = req.body.category;
    const subcategory = req.body.subcategory;
    const description = req.body.description;
    const long_description = req.body.long_description;
    const image_url = req.body.image_url || req.body.imageUrl;
    const thumbnail_url = req.body.thumbnail_url || req.body.thumbnailUrl;
    const side_image_url = req.body.side_image_url || req.body.sideImageUrl;
    const back_image_url = req.body.back_image_url || req.body.backImageUrl;
    const event_date = req.body.event_date || req.body.date;
    const location = req.body.location;
    const price = req.body.price;
    const closed_days = req.body.closed_days || req.body.closedDays;
    const video_url = req.body.video_url || req.body.videoUrl;
    const page_type = req.body.page_type;
    const parent_id = req.body.parent_id || req.body.parentId;
    const theme_data = req.body.theme_data;
    const selected_templates = req.body.selected_templates || req.body.selectedTemplates;

    const toJson = (val) => {
      if (val === null || val === undefined) return null;
      if (typeof val === 'string') return val;
      return JSON.stringify(val);
    };

    // Ownership and Role-based agency_id handling
    let agency_id = req.user?.id || null;
    
    if (req.user?.role === 'AGENCY') {
      const [existing] = await pool.query('SELECT agency_id FROM featured_items WHERE id = ?', [id]);
      if (existing.length === 0 || existing[0].agency_id !== req.user.id) {
        return res.status(403).json({ message: 'You do not have permission to update this product' });
      }
      // Agencies cannot change the owner
      agency_id = req.user.id;
    } else if (req.user?.role === 'ADMIN') {
      // Admins can specify an agency_id or it defaults to null (admin-owned)
      agency_id = req.query.agencyId || req.body.agency_id || null;
      if (agency_id === 'null' || agency_id === '') agency_id = null;
    }

    const query = `
      UPDATE featured_items 
      SET title = ?, category = ?, subcategory = ?, description = ?, long_description = ?, image_url = ?, thumbnail_url = ?, side_image_url = ?, back_image_url = ?, event_date = ?, \`location\` = ?, price = ?, closed_days = ?, video_url = ?, page_type = ?, parent_id = ?, theme_data = ?, selected_templates = ?, agency_id = ?
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
      toJson(closed_days),
      video_url || '',
      page_type || 'standard',
      parent_id || null,
      toJson(theme_data),
      toJson(selected_templates),
      agency_id || null,
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
    // If agency, verify ownership
    if (req.user?.role === 'AGENCY') {
      const [existing] = await pool.query('SELECT agency_id FROM featured_items WHERE id = ?', [id]);
      if (existing.length === 0 || existing[0].agency_id !== req.user.id) {
        return res.status(403).json({ message: 'You do not have permission to delete this product' });
      }
    }

    await pool.query('DELETE FROM featured_items WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
