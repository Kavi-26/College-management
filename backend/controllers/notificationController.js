const db = require('../config/db');

// Helper to create and emit notification
// This is used internally by other controllers
exports.createNotification = async (io, { userId, title, message, type, relatedId }) => {
    try {
        const query = `
            INSERT INTO notifications (user_id, title, message, type, related_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [userId, title, message, type, relatedId]);

        // Emit via Socket.io if user is connected
        // We emit to a room named 'user_ID'
        if (io) {
            io.to(`user_${userId}`).emit('notification', {
                id: result.insertId,
                title,
                message,
                type,
                created_at: new Date()
            });
        }

        return true;
    } catch (error) {
        console.error('Error creating notification:', error);
        return false;
    }
};

// Get User Notifications
exports.getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`;
        const [rows] = await db.query(query, [userId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark as Read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params; // Notification ID
        const userId = req.user.id;

        await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
        res.json({ message: 'Marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
