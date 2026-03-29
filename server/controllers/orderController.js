import pool from '../config/db.js';

export const createOrder = async (req, res) => {
  const { 
    userName, 
    userPhone, 
    userAddress, 
    productId, 
    productName, 
    price, 
    agencyId,
    paymentId 
  } = req.body;

  try {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    const query = `
      INSERT INTO orders (
        order_id, user_name, user_phone, user_address, 
        product_id, product_name, price, agency_id, payment_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAID')
    `;

    const params = [
      orderId, userName, userPhone, userAddress, 
      productId, productName, price, agencyId, paymentId
    ];

    await pool.query(query, params);
    res.status(201).json({ orderId, message: 'Order placed successfully' });
  } catch (error) {
    console.error('[createOrder] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  const user = req.user; // From authMiddleware

  try {
    let query = 'SELECT * FROM orders';
    let params = [];
    
    if (user && user.role === 'AGENCY') {
      query += ' WHERE agency_id = ?';
      params.push(user.id);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('[getAllOrders] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = req.user;

  try {
    // If agency, verify ownership
    if (user && user.role === 'AGENCY') {
      const [existing] = await pool.query('SELECT agency_id FROM orders WHERE id = ?', [id]);
      if (existing.length === 0 || existing[0].agency_id !== user.id) {
        return res.status(403).json({ message: 'Access denied: You do not own this order' });
      }
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('[updateOrderStatus] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    if (user && user.role === 'AGENCY') {
      const [existing] = await pool.query('SELECT agency_id FROM orders WHERE id = ?', [id]);
      if (existing.length === 0 || existing[0].agency_id !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    await pool.query('DELETE FROM orders WHERE id = ?', [id]);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('[deleteOrder] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};
