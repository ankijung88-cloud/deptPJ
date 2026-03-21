import pool from '../config/db.js';

export const login = async (req, res) => {
  const { username, password } = req.body;
  
  console.log(`Login attempt for user: ${username}`);
  
  try {
    const [rows] = await pool.query(
      'SELECT id, username, password, role, agency_name FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length > 0) {
      const user = rows[0];
      // In a full implementation, we would return a JWT token here
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
