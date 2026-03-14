import pool from '../config/db.js';

export const login = async (req, res) => {
  const { username, password } = req.body;
  
  // Simple hardcoded admin credentials for now
  // In a real app, this should check a 'users' table with hashed passwords
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'admin1234';

  console.log(`Login attempt for user: ${username}`);
  
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Return a simple success response
    // In a full implementation, we would return a JWT token here
    res.json({ 
      success: true, 
      token: 'mock-admin-token-' + Date.now(),
      user: { username: ADMIN_USER, role: 'admin' }
    });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
};
