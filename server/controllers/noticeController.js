import pool from '../config/db.js';

export const getAllNotices = async (req, res) => {
  const user = req.user;
  try {
    let query = 'SELECT * FROM notices';
    let params = [];
    
    if (user && user.role === 'AGENCY') {
      query += ' WHERE agency_id = ?';
      params.push(user.id);
    }
    
    query += ' ORDER BY date DESC, created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createNotice = async (req, res) => {
  const { title, content, category, date, is_important } = req.body;
  const user = req.user;
  try {
    const agency_id = user?.id || null;
    const query = `
      INSERT INTO notices (title, content, category, date, is_important, agency_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      JSON.stringify(title),
      JSON.stringify(content),
      category,
      date,
      is_important,
      agency_id
    ]);
    res.status(201).json({ id: result.insertId, message: 'Notice created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNotice = async (req, res) => {
  const { id } = req.params;
  const { title, content, category, date, is_important } = req.body;
  try {
    const [existing] = await pool.query('SELECT agency_id FROM notices WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Notice not found' });
    
    if (req.user?.role === 'AGENCY' && existing[0].agency_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to update this notice' });
    }

    const query = `
      UPDATE notices 
      SET title = ?, content = ?, category = ?, date = ?, is_important = ?
      WHERE id = ?
    `;
    await pool.query(query, [
      JSON.stringify(title),
      JSON.stringify(content),
      category,
      date,
      is_important,
      id
    ]);
    res.json({ message: 'Notice updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotice = async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.query('SELECT agency_id FROM notices WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Notice not found' });

    if (req.user?.role === 'AGENCY' && existing[0].agency_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this notice' });
    }

    await pool.query('DELETE FROM notices WHERE id = ?', [id]);
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
