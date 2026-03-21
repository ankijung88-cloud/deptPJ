export const authenticateAdmin = (req, res, next) => {
  // In this project, admin login returns a 'mock-admin-token-...' 
  // which is stored in localStorage and sent in the Authorization header.
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log('[AuthMiddleware] Access denied: No Authorization header');
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Expecting "Bearer mock-[role]-token-[timestamp]-[id]"
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  if (token && (token.startsWith('mock-admin-token-') || token.startsWith('mock-agency-token-'))) {
    // Basic decode of mock token to get role and id
    const parts = token.split('-');
    const role = parts[1].toUpperCase();
    const userId = parts[parts.length - 1];
    
    req.user = {
      id: parseInt(userId),
      role: role
    };
    
    next();
  } else {
    console.log('[AuthMiddleware] Access denied: Invalid token');
    res.status(403).json({ message: 'Access denied: Valid token required' });
  }
};
