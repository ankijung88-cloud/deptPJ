import pool from '../config/db.js';

export const getAllNotices = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notices ORDER BY date DESC, created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createNotice = async (req, res) => {
  const { title, content, category, date, is_important } = req.body;
  try {
    const query = `
      INSERT INTO notices (title, content, category, date, is_important)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      JSON.stringify(title),
      JSON.stringify(content),
      category,
      date,
      is_important
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
    await pool.query('DELETE FROM notices WHERE id = ?', [id]);
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
