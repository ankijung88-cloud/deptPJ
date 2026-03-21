import pool from '../config/db.js';

export const getAllFaqs = async (req, res) => {
  const user = req.user;
  try {
    let query = 'SELECT * FROM faqs';
    let params = [];

    if (user && user.role === 'AGENCY') {
      query += ' WHERE agency_id = ?';
      params.push(user.id);
    }

    query += ' ORDER BY display_order ASC, created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createFaq = async (req, res) => {
  const { question, answer, category, display_order } = req.body;
  const user = req.user;
  try {
    const agency_id = user?.id || null;
    const query = `
      INSERT INTO faqs (question, answer, category, display_order, agency_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      JSON.stringify(question),
      JSON.stringify(answer),
      category,
      display_order,
      agency_id
    ]);
    res.status(201).json({ id: result.insertId, message: 'FAQ created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFaq = async (req, res) => {
  const { id } = req.params;
  const { question, answer, category, display_order } = req.body;
  try {
    const [existing] = await pool.query('SELECT agency_id FROM faqs WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'FAQ not found' });

    if (req.user?.role === 'AGENCY' && existing[0].agency_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to update this FAQ' });
    }

    const query = `
      UPDATE faqs 
      SET question = ?, answer = ?, category = ?, display_order = ?
      WHERE id = ?
    `;
    await pool.query(query, [
      JSON.stringify(question),
      JSON.stringify(answer),
      category,
      display_order,
      id
    ]);
    res.json({ message: 'FAQ updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFaq = async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.query('SELECT agency_id FROM faqs WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'FAQ not found' });

    if (req.user?.role === 'AGENCY' && existing[0].agency_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this FAQ' });
    }

    await pool.query('DELETE FROM faqs WHERE id = ?', [id]);
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
