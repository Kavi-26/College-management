const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.send('Server is updated'));

// Serve Uploads statically
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/timetable', require('./routes/timetableRoutes'));
app.use('/api/reference', require('./routes/referenceRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.get('/', (req, res) => {
    res.send('Smart College Companion API is running');
});

// Database Connection Check
const db = require('./config/db');

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const http = require('http');
const { Server } = require('socket.io');
const chatController = require('./controllers/chatController');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Vite frontend port
        methods: ["GET", "POST"]
    }
});

// Set io to app so controllers can access it
app.set('io', io);

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user-specific room
    socket.on('join_user_room', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined notification room`);
    });

    socket.on('join_room', (data) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });

    socket.on('send_message', async (data) => {
        // data: { room, author, message, time }
        // Save to DB
        await chatController.saveMessage(data);

        // Broadcast to room
        socket.to(data.room).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
