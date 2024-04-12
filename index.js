import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Make sure this matches the client's origin
    methods: ["GET", "POST"]
  }
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('new user connected');
  
  // Handler for incoming messages
  socket.on('send message', (msg) => {
    console.log('message:', msg.text);
    // Emit to all clients including sender
    io.emit('display new message', msg);
  });

  // Handler for typing indicator
  socket.on('typing', ({ isTyping, sender }) => {
    // Emit to all clients except the sender
    socket.broadcast.emit('user typing', isTyping);
    console.log(`${sender} is typing: ${isTyping}`);
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
