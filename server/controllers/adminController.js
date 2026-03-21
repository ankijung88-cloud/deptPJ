import pool from '../config/db.js';

export const getAgencies = async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, role, agency_name, created_at FROM users WHERE role = ?',
      ['AGENCY']
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAgency = async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }

  const { username, password, agencyName } = req.body;

  try {
    await pool.query(
      'INSERT INTO users (username, password, role, agency_name) VALUES (?, ?, ?, ?)',
      [username, password, 'AGENCY', agencyName]
    );
    res.status(201).json({ message: 'Agency created successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Username already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateAgency = async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }

  const { id } = req.params;
  const { username, password, agencyName } = req.body;

  try {
    let query = 'UPDATE users SET username = ?, agency_name = ?';
    let params = [username, agencyName];

    if (password) {
      query += ', password = ?';
      params.push(password);
    }

    query += ' WHERE id = ? AND role = ?';
    params.push(id, 'AGENCY');

    await pool.query(query, params);
    res.json({ message: 'Agency updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAgency = async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }

  const { id } = req.params;

  try {
    // Delete agency products first or nullify them? 
    // Requirement says "Admin can delete everything". 
    // I'll delete products too for consistency if the agency is gone.
    await pool.query('DELETE FROM featured_items WHERE agency_id = ?', [id]);
    await pool.query('DELETE FROM users WHERE id = ? AND role = ?', [id, 'AGENCY']);
    res.json({ message: 'Agency and its products deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
