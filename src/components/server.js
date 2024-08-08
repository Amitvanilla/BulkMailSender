const multer = require('multer');
const express = require('express');
const app = express();
const socketIo = require('socket.io');
const sendBulkEmails = require('./sendBulkEmails');
const cors = require('cors');
const port = 3001;

// Set up server for socket.io
const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Endpoint for sending emails
app.post('/api/send-emails', upload.fields([{ name: 'excelFilePath' }, { name: 'attachment' }]), (req, res) => {
    sendBulkEmails(req, res, io);
});

// Socket connection handling
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

