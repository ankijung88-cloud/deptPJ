import pool from '../config/db.js';

export const getAgencies = async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, password, role, agency_name, birth_date, phone_mobile, phone_company, address, address_detail, status, created_at FROM users WHERE role = ?',
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

  const { 
    username, password, agencyName, birthDate, phoneMobile, phoneCompany, address, addressDetail 
  } = req.body;

  try {
    await pool.query(
      'INSERT INTO users (username, password, role, agency_name, birth_date, phone_mobile, phone_company, address, address_detail, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [username, password, 'AGENCY', agencyName, birthDate, phoneMobile, phoneCompany, address, addressDetail, 'APPROVED']
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
  const { 
    username, password, agencyName, birthDate, phoneMobile, phoneCompany, address, addressDetail 
  } = req.body;

  try {
    let query = 'UPDATE users SET username = ?, agency_name = ?, birth_date = ?, phone_mobile = ?, phone_company = ?, address = ?, address_detail = ?';
    let params = [username, agencyName, birthDate, phoneMobile, phoneCompany, address, addressDetail];

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
    // Delete agency products first
    await pool.query('DELETE FROM featured_items WHERE agency_id = ?', [id]);
    await pool.query('DELETE FROM users WHERE id = ? AND role = ?', [id, 'AGENCY']);
    res.json({ message: 'Agency and its products deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAgencyStatus = async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    await pool.query(
      'UPDATE users SET status = ? WHERE id = ? AND role = ?',
      [status, id, 'AGENCY']
    );
    res.json({ message: `Agency status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
