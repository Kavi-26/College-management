const db = require('../config/db');
const notificationController = require('./notificationController');

// Get All Events
exports.getAllEvents = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = 'SELECT * FROM events ORDER BY date ASC';
        const [events] = await db.query(query);

        if (userRole === 'student') {
            // Check registrations for this student
            const [registrations] = await db.query('SELECT event_id FROM event_registrations WHERE student_id = ?', [userId]);
            const registeredEventIds = new Set(registrations.map(r => r.event_id));

            const eventsWithStatus = events.map(event => ({
                ...event,
                is_registered: registeredEventIds.has(event.id)
            }));
            return res.json(eventsWithStatus);
        }

        // For admin/faculty, just return events (maybe add count of registrations later)
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create Event (Admin)
exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, location, organizer } = req.body;
        const created_by = req.user.id;

        const query = `
            INSERT INTO events (title, description, date, location, organizer, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [title, description, date, location, organizer, created_by]);

        // Notify ALL Students
        const io = req.app.get('io');
        // Fetch all student IDs
        const [students] = await db.query('SELECT id FROM students');

        students.forEach(student => {
            notificationController.createNotification(io, {
                userId: student.id,
                title: 'New Event: ' + title,
                message: `Check out the new event "${title}" on ${new Date(date).toLocaleDateString()} at ${location}.`,
                type: 'event',
                relatedId: result.insertId
            });
        });

        res.status(201).json({ message: 'Event created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Event (Admin)
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM events WHERE id = ?', [id]);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Register for Event (Student)
exports.registerForEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const student_id = req.user.id;

        // Check availability/deadline if needed (skipping for now)

        await db.query(`
            INSERT INTO event_registrations (event_id, student_id)
            VALUES (?, ?)
        `, [id, student_id]);

        res.json({ message: 'Registered successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Already registered' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Registered Students (Admin/Faculty) - Optional helper
exports.getEventRegistrations = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT s.id, s.name, s.reg_no, s.department, s.year, s.section, er.registered_at
            FROM event_registrations er
            JOIN students s ON er.student_id = s.id
            WHERE er.event_id = ?
            ORDER BY er.registered_at DESC
        `;
        const [rows] = await db.query(query, [id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
