import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { registerRoomEvents } from './events/room.events';
import { registerGameEvents } from './events/game.events';
import { roomService } from './services/room.service';

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
  'http://localhost:4200',
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
];

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  const playerName = socket.handshake.auth.playerName as string;
  if (!playerName) {
    socket.disconnect();
    return;
  }

  // Assign persistent player ID
  const playerId = uuidv4();
  socket.data.playerId = playerId;

  console.log(`[+] ${playerName} connected (${playerId})`);

  // Register event handlers
  registerRoomEvents(io, socket);
  registerGameEvents(io, socket);

  // Send room list on connect
  socket.emit('rooms:list', roomService.getLobbyList());

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`[-] ${playerName} disconnected (${playerId})`);
    const room = roomService.setPlayerConnection(socket.id, false);
    if (room) {
      io.to(room.id).emit('room:update', room);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
