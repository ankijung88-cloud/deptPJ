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

export const findId = async (req, res) => {
  const { agencyName, phoneMobile } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT username FROM users WHERE agency_name = ? AND phone_mobile = ?',
      [agencyName, phoneMobile]
    );
    if (rows.length > 0) {
      // Return partially masked username for security
      const fullUsername = rows[0].username;
      const parts = fullUsername.split('@');
      let masked = fullUsername;
      if (parts.length === 2) {
        const name = parts[0];
        const domain = parts[1];
        masked = `${name.substring(0, Math.ceil(name.length / 2))}${'*'.repeat(Math.floor(name.length / 2))}@${domain}`;
      }
      res.json({ success: true, username: masked });
    } else {
      res.status(404).json({ message: 'No matching account found with provided information.' });
    }
  } catch (error) {
    console.error('[Auth] FindID error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const resetPassword = async (req, res) => {
  const { username, agencyName, phoneMobile, newPassword } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE username = ? AND agency_name = ? AND phone_mobile = ?',
      [username, agencyName, phoneMobile]
    );
    if (rows.length > 0) {
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, rows[0].id]);
      res.json({ success: true, message: 'Password has been reset successfully.' });
    } else {
      res.status(404).json({ message: 'Account verification failed. Please check your information.' });
    }
  } catch (error) {
    console.error('[Auth] ResetPassword error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
