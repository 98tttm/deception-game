import { Server, Socket } from 'socket.io';
import { roomService } from '../services/room.service';
import { getPlayerView } from '../services/game.service';
import { GameRoom } from '../models/types';
import { TIMERS } from '../models/constants';
import { processBotActions } from '../services/bot.service';

export function registerGameEvents(io: Server, socket: Socket): void {
  const playerId = socket.data.playerId as string;

  // --- Night phase: Evil selecting cards (real-time broadcast to partner) ---
  socket.on('night:selectingCard', ({ meansId, clueId }: { meansId: string | null; clueId: string | null }) => {
    const room = roomService.findRoomByPlayerId(playerId);
    if (!room || room.state !== 'NIGHT_EVIL_CHOOSE_CARDS') return;

    const player = room.players.find((p) => p.id === playerId);
    if (!player || (player.role !== 'MURDERER' && player.role !== 'ACCOMPLICE')) return;

    // Find partner and send selection to them only
    const partnerRole = player.role === 'MURDERER' ? 'ACCOMPLICE' : 'MURDERER';
    const partner = room.players.find((p) => p.role === partnerRole);
    if (!partner) return;

    const partnerSocket = io.sockets.sockets.get(partner.socketId);
    if (partnerSocket) {
      partnerSocket.emit('night:partnerSelecting', { meansId, clueId });
    }
  });

  // --- Night phase: Evil choose cards ---
  socket.on('night:chooseCards', ({ meansId, clueId }: { meansId: string; clueId: string }) => {
    const room = roomService.findRoomByPlayerId(playerId);
    if (!room) return;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return;
    if (player.role !== 'MURDERER' && player.role !== 'ACCOMPLICE') return;

    player.trueMeans = meansId;
    player.trueClue = clueId;

    // Check if both evil players have chosen
    const murderer = room.players.find((p) => p.role === 'MURDERER');
    const accomplice = room.players.find((p) => p.role === 'ACCOMPLICE');

    const murdererDone = murderer?.trueMeans && murderer?.trueClue;
    const accompliceDone = !accomplice || (accomplice.trueMeans && accomplice.trueClue);

    if (murdererDone && accompliceDone) {
      // Progress to next night phase
      if (accomplice) {
        room.state = 'NIGHT_WITNESS_REVEAL';
      } else {
        room.state = 'NIGHT_FORENSIC_REVEAL';
      }
      broadcastGameState(io, room);
    }
  });

  // --- Night phase: Witness acknowledges ---
  socket.on('night:witnessAck', () => {
    const room = roomService.findRoomByPlayerId(playerId);
    if (!room) return;

    const player = room.players.find((p) => p.id === playerId);
    if (player?.role !== 'WITNESS') return;

    room.state = 'NIGHT_FORENSIC_REVEAL';
    broadcastGameState(io, room);
  });

  // --- Night phase: Forensic acknowledges -> start investigation ---
  socket.on('night:forensicAck', () => {
    const room = roomService.findRoomByPlayerId(playerId);
    if (!room) return;

    const player = room.players.find((p) => p.id === playerId);
    if (player?.role !== 'FORENSIC') return;

    room.state = 'INVESTIGATION_ROUND_1';
    broadcastGameState(io, room);
  });

  // --- Forensic places marker ---
  socket.on('forensic:placeMarker', ({ tileId, optionIndex }: { tileId: string; optionIndex: number }) => {
    const room = roomService.findRoomByPlayerId(playerId);
    if (!room) return;

    const player = room.players.find((p) => p.id === playerId);
    if (player?.role !== 'FORENSIC') return;

    room.markers[tileId] = optionIndex;
    broadcastGameState(io, room);
  });

  // --- Forensic confirms markers (end marker phase) ---
  socket.on('forensic:confirmMarkers', () => {
    const room = roomService.findRoomByPlayerId(playerId);
    if (!room) return;

    const player = room.players.find((p) => p.id === playerId);
    if (player?.role !== 'FORENSIC') return;

    // Markers are already placed, just broadcast updated state
    broadcastGameState(io, room);
  });

  // --- Accusation ---
  socket.on('accusation:make', ({ targetId, meansCardId, clueCardId }: { targetId: string; meansCardId: string; clueCardId: string }) => {
    const room = roomService.findRoomByPlayerId(playerId);
    if (!room) return;

    const accuser = room.players.find((p) => p.id === playerId);
    if (!accuser || accuser.role === 'FORENSIC') return;
    if (accuser.badges + accuser.extraBadges <= 0) return socket.emit('error', { message: 'Bạn đã hết huy hiệu' });

    const target = room.players.find((p) => p.id === targetId);
    if (!target) return;

    // Use extra badge first, then normal badge
    if (accuser.extraBadges > 0) {
      accuser.extraBadges--;
    } else {
      accuser.badges--;
    }

    // Resolve accusation
    const prevState = room.state;
    room.state = 'ACCUSATION_RESOLVING';

    // CASE 1: Target is accomplice -> evil wins
    if (target.role === 'ACCOMPLICE') {
      room.accusations.push({
        accuserId: playerId, targetId, meansCardId, clueCardId,
        result: 'ACCOMPLICE_FRAMED', timestamp: Date.now(),
      });
      room.gameResult = { winner: 'EVIL', reason: 'ACCOMPLICE_FRAMED' };
      room.state = 'GAME_END';
      broadcastGameState(io, room);
      return;
    }

    // CASE 2: Target is murderer + correct cards
    const murderer = room.players.find((p) => p.role === 'MURDERER')!;
    if (target.role === 'MURDERER' && meansCardId === murderer.trueMeans && clueCardId === murderer.trueClue) {
      const hasWitness = room.players.some((p) => p.role === 'WITNESS');
      if (hasWitness) {
        room.accusations.push({
          accuserId: playerId, targetId, meansCardId, clueCardId,
          result: 'CORRECT', timestamp: Date.now(),
        });
        // Trigger witness hunt
        room.state = 'WITNESS_HUNT';
        room.witnessHunt = {
          triggeredBy: playerId,
          deadline: Date.now() + TIMERS.WITNESS_HUNT * 1000,
        };
        broadcastGameState(io, room);
        return;
      } else {
        room.accusations.push({
          accuserId: playerId, targetId, meansCardId, clueCardId,
          result: 'CORRECT', timestamp: Date.now(),
        });
        room.gameResult = { winner: 'GOOD', reason: 'CORRECT_ACCUSATION_NO_WITNESS' };
        room.state = 'GAME_END';
        broadcastGameState(io, room);
        return;
      }
    }

    // CASE 3: Wrong accusation
    room.accusations.push({
      accuserId: playerId, targetId, meansCardId, clueCardId,
      result: 'WRONG', timestamp: Date.now(),
    });

    // Check if all investigators out of badges
    const allOut = room.players
      .filter((p) => p.role !== 'FORENSIC')
      .every((p) => p.badges + p.extraBadges <= 0);

    if (allOut) {
      room.gameResult = { winner: 'EVIL', reason: 'ALL_BADGES_USED' };
      room.state = 'GAME_END';
    } else {
      room.state = prevState;
    }
    broadcastGameState(io, room);
  });

  // --- Witness Hunt: Murderer chooses target ---
  socket.on('witnessHunt:choose', ({ targetId }: { targetId: string }) => {
    const room = roomService.findRoomByPlayerId(playerId);
    if (!room || !room.witnessHunt) return;

    const player = room.players.find((p) => p.id === playerId);
    if (player?.role !== 'MURDERER') return;

    room.witnessHunt.targetChoice = targetId;

    const witness = room.players.find((p) => p.role === 'WITNESS');
    if (targetId === witness?.id) {
      room.witnessHunt.result = 'WITNESS_FOUND';
      room.gameResult = { winner: 'EVIL', reason: 'WITNESS_HUNTED' };
    } else {
      room.witnessHunt.result = 'WITNESS_SAFE';
      room.gameResult = { winner: 'GOOD', reason: 'WITNESS_SAFE' };
    }

    room.state = 'GAME_END';
    broadcastGameState(io, room);
  });

  // --- Advance to next round ---
  socket.on('game:nextRound', () => {
    const room = roomService.findRoomByPlayerId(playerId);
    if (!room) return;
    if (room.hostId !== playerId) return;

    if (room.currentRound >= 3) {
      room.gameResult = { winner: 'EVIL', reason: 'ROUNDS_EXHAUSTED' };
      room.state = 'GAME_END';
    } else {
      room.currentRound = (room.currentRound + 1) as 1 | 2 | 3;
      room.state = `INVESTIGATION_ROUND_${room.currentRound}` as any;

      // Draw new tile from deck for round 2/3
      if (room.tileDeck.length > 0) {
        const drawn = room.tileDeck.shift()!;
        // Check if it's an event card
        if ('type' in drawn) {
          room.state = 'EVENT_RESOLVING';
          room.eventsUsed.push(drawn.type);
        }
        // Otherwise it's a clue tile - forensic will handle replacement
      }
    }

    broadcastGameState(io, room);
  });
}

function broadcastGameState(io: Server, room: GameRoom): void {
  for (const p of room.players) {
    if (p.isBot) continue;
    const playerSocket = io.sockets.sockets.get(p.socketId);
    if (playerSocket) {
      playerSocket.emit('game:state', getPlayerView(room, p.id));
    }
  }

  // Trigger bot actions if any bots in room
  if (room.players.some(p => p.isBot)) {
    processBotActions(io, room);
  }
}
