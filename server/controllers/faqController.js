import pool from '../config/db.js';

export const getAllFaqs = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM faqs ORDER BY display_order ASC, created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createFaq = async (req, res) => {
  const { question, answer, category, display_order } = req.body;
  try {
    const query = `
      INSERT INTO faqs (question, answer, category, display_order)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      JSON.stringify(question),
      JSON.stringify(answer),
      category,
      display_order
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
    await pool.query('DELETE FROM faqs WHERE id = ?', [id]);
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
