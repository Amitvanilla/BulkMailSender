const multer = require('multer');
const express = require('express');
const app = express();
const socketIo = require('socket.io');
const sendBulkEmails = require('./sendBulkEmails');
const cors = require("cors");
const port = 3001;
const portSocket = 3002;
const server = app.listen(portSocket, () => {
    console.log(`SocketServer is running on http://localhost:${portSocket}`);
});
const io = socketIo(server);

app.use(cors());
app.options("*", cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    req.io = io;
    next();
});

// Parse JSON data in requests
app.use(express.json());

// Configure file upload middleware
const storageExc = multer.memoryStorage();
const uploadExc = multer({ storage: storageExc });

// Handle file upload and email sending
app.post('/api/send-emails', uploadExc.single('excelFilePath'), sendBulkEmails);

// Listen on both Express and Socket.IO ports


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
