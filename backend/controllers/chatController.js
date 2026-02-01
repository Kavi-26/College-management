const db = require('../config/db');

// Get Chat History for a Room
exports.getHistory = async (req, res) => {
    try {
        const { room } = req.params;
        const query = 'SELECT * FROM messages WHERE room = ? ORDER BY created_at ASC LIMIT 100';
        const [rows] = await db.query(query, [room]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Save Message (Called internally by Socket.io handler)
exports.saveMessage = async (messageData) => {
    try {
        const { sender_id, sender_name, sender_role, text, room } = messageData;
        const query = `
            INSERT INTO messages (sender_id, sender_name, sender_role, text, room)
            VALUES (?, ?, ?, ?, ?)
        `;
        await db.query(query, [sender_id, sender_name, sender_role, text, room]);
        return true;
    } catch (error) {
        console.error('Error saving message:', error);
        return false;
    }
};
