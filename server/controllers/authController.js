import pool from '../config/db.js';

export const register = async (req, res) => {
  const { 
    username, 
    password, 
    agencyName, 
    birthDate, 
    phoneMobile, 
    phoneCompany, 
    address, 
    addressDetail 
  } = req.body;
  
  if (!username || !password || !agencyName) {
    return res.status(400).json({ message: 'All required fields must be filled' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    await pool.query(
      'INSERT INTO users (username, password, role, agency_name, birth_date, phone_mobile, phone_company, address, address_detail, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [username, password, 'AGENCY', agencyName, birthDate, phoneMobile, phoneCompany, address, addressDetail, 'PENDING']
    );

    res.status(201).json({ success: true, message: 'Registration successful. Waiting for admin approval.' });
  } catch (error) {
    console.error('[Auth] Register error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const [rows] = await pool.query(
      'SELECT id, username, password, role, agency_name, status FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length > 0) {
      const user = rows[0];

      if (user.role === 'AGENCY' && user.status !== 'APPROVED') {
        const statusMsg = user.status === 'PENDING' 
          ? 'Your account is pending approval.' 
          : 'Your account has been rejected.';
        return res.status(403).json({ message: statusMsg, status: user.status });
      }

      res.json({ 
        success: true, 
        token: `mock-${user.role.toLowerCase()}-token-${Date.now()}-${user.id}`,
        user: { 
          id: user.id,
          username: user.username, 
          role: user.role.toLowerCase(),
          agencyName: user.agency_name
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
