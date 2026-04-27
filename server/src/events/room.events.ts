import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { roomService } from '../services/room.service';
import { assignRoles, dealCards, setupSceneBoard, getPlayerView } from '../services/game.service';
import { Player } from '../models/types';
import { PLAYER_LIMITS } from '../models/constants';
import { createBotPlayers, processBotActions } from '../services/bot.service';

export function registerRoomEvents(io: Server, socket: Socket): void {
  const playerId = socket.data.playerId as string;
  const playerName = socket.handshake.auth.playerName as string;

  // --- Create Room ---
  socket.on('room:create', (options: { name: string; maxPlayers: number; mode: 'HUMAN_FORENSIC' | 'AI_FORENSIC'; isPrivate: boolean }) => {
    const player = createPlayer(playerId, socket.id, playerName);
    const room = roomService.createRoom(player, options);

    socket.join(room.id);
    socket.emit('room:joined', room.id);
    io.emit('rooms:list', roomService.getLobbyList());
  });

  // --- Join Room ---
  socket.on('room:join', ({ roomId }: { roomId: string }) => {
    const room = roomService.getRoom(roomId);
    if (!room) return socket.emit('error', { message: 'Phòng không tồn tại' });

    const player = createPlayer(playerId, socket.id, playerName);
    const success = roomService.addPlayer(roomId, player);
    if (!success) return socket.emit('error', { message: 'Không thể tham gia phòng' });

    socket.join(roomId);
    socket.emit('room:joined', roomId);
    io.to(roomId).emit('room:update', room);
    io.emit('rooms:list', roomService.getLobbyList());
  });

  // --- Leave Room ---
  socket.on('room:leave', () => {
    const room = roomService.findRoomByPlayerId(playerId);
    if (!room) return;

    socket.leave(room.id);
    roomService.removePlayer(room.id, playerId);

    const updatedRoom = roomService.getRoom(room.id);
    if (updatedRoom) {
      io.to(room.id).emit('room:update', updatedRoom);
    }
    io.emit('rooms:list', roomService.getLobbyList());
  });

  // --- Start Game ---
  socket.on('game:start', () => {
    const room = roomService.findRoomByPlayerId(playerId);
    if (!room) return;
    if (room.hostId !== playerId) return socket.emit('error', { message: 'Chỉ host mới có thể bắt đầu game' });
    if (room.players.length < PLAYER_LIMITS.MIN) return socket.emit('error', { message: `Cần tối thiểu ${PLAYER_LIMITS.MIN} người chơi` });
    if (room.state !== 'LOBBY') return socket.emit('error', { message: 'Game đã bắt đầu' });

    // Setup game
    assignRoles(room);
    dealCards(room);
    setupSceneBoard(room);
    room.state = 'NIGHT_EVIL_DISCUSS';

    // Send personalized game state to each player
    for (const p of room.players) {
      if (p.isBot) continue;
      const playerSocket = io.sockets.sockets.get(p.socketId);
      if (playerSocket) {
        playerSocket.emit('game:state', getPlayerView(room, p.id));
      }
    }

    io.emit('rooms:list', roomService.getLobbyList());

    // Trigger bot actions if any bots in room
    if (room.players.some(p => p.isBot)) {
      processBotActions(io, room);
    }
  });

  // --- Chat ---
  socket.on('chat:send', ({ message, channel }: { message: string; channel: 'PUBLIC' | 'EVIL_PRIVATE' }) => {
    const room = roomService.findRoomByPlayerId(playerId);
    if (!room) return;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return;

    // Forensic cannot chat
    if (player.role === 'FORENSIC') return;

    const chatMsg = {
      id: uuidv4(),
      senderId: playerId,
      senderName: player.name,
      content: message,
      timestamp: Date.now(),
      channel,
    };

    room.chatLog.push(chatMsg);

    if (channel === 'PUBLIC') {
      io.to(room.id).emit('chat:message', chatMsg);
    } else if (channel === 'EVIL_PRIVATE') {
      // Only send to murderer + accomplice
      for (const p of room.players) {
        if (p.role === 'MURDERER' || p.role === 'ACCOMPLICE') {
          io.sockets.sockets.get(p.socketId)?.emit('chat:message', chatMsg);
        }
      }
    }
  });

  // --- Create Demo Room (solo play with bots) ---
  socket.on('room:createDemo', () => {
    const player = createPlayer(playerId, socket.id, playerName);
    const room = roomService.createRoom(player, {
      name: `Demo - ${playerName}`,
      maxPlayers: 6,
      mode: 'HUMAN_FORENSIC',
      isPrivate: true,
    });

    // Add 5 bot players
    const bots = createBotPlayers(5);
    for (const bot of bots) {
      roomService.addPlayer(room.id, bot);
    }

    socket.join(room.id);
    socket.emit('room:joined', room.id);

    // Auto-start game after a short delay
    setTimeout(() => {
      if (room.state !== 'LOBBY') return;
      assignRoles(room);
      dealCards(room);
      setupSceneBoard(room);
      room.state = 'NIGHT_EVIL_DISCUSS';

      // Send state to real player
      socket.emit('game:state', getPlayerView(room, playerId));
      io.emit('rooms:list', roomService.getLobbyList());

      // Trigger bot actions
      processBotActions(io, room);
    }, 500);
  });

  // --- Get room list ---
  socket.on('rooms:refresh', () => {
    socket.emit('rooms:list', roomService.getLobbyList());
  });

  // --- Request current game state (when game component loads) ---
  socket.on('game:requestState', () => {
    const room = roomService.findRoomByPlayerId(playerId);
    if (!room || room.state === 'LOBBY') return;
    socket.emit('game:state', getPlayerView(room, playerId));
  });
}

function createPlayer(id: string, socketId: string, name: string): Player {
  return {
    id,
    socketId,
    name,
    hand: { means: [], clues: [], flippedClues: [] },
    badges: 1,
    extraBadges: 0,
    isConnected: true,
  };
}
