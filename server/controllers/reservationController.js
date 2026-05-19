import pool from '../config/db.js';

export const createReservation = async (req, res) => {
    try {
        const { user_id, user_name, user_phone, product_id, product_name, agency_id, program_id, program_title, reservation_date, reservation_time, guests } = req.body;
        
        const [result] = await pool.query(
            `INSERT INTO reservations 
            (user_id, user_name, user_phone, product_id, product_name, agency_id, program_id, program_title, reservation_date, reservation_time, guests, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
            [user_id || 'anonymous', user_name || 'Guest', user_phone || '', product_id, product_name || '', agency_id || null, program_id, program_title, reservation_date, reservation_time, guests]
        );
        
        res.status(201).json({ success: true, id: result.insertId, message: 'Reservation created successfully' });
    } catch (error) {
        console.error('Create reservation error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getReservations = async (req, res) => {
    try {
        const agency_id = req.user?.id;
        const role = req.user?.role;
        
        let query = 'SELECT * FROM reservations ORDER BY created_at DESC';
        let params = [];
        
        if (role === 'AGENCY' && agency_id) {
            query = 'SELECT * FROM reservations WHERE agency_id = ? ORDER BY created_at DESC';
            params = [agency_id];
        }
        
        const [rows] = await pool.query(query, params);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Get reservations error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateReservationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const [result] = await pool.query(
            'UPDATE reservations SET status = ? WHERE id = ?',
            [status, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }
        
        res.status(200).json({ success: true, message: 'Reservation updated successfully' });
    } catch (error) {
        console.error('Update reservation status error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query(
            'DELETE FROM reservations WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }
        
        res.status(200).json({ success: true, message: 'Reservation deleted successfully' });
    } catch (error) {
        console.error('Delete reservation error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
