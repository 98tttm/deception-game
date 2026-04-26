import { Server } from 'socket.io';
import { GameRoom, Player } from '../models/types';
import { getPlayerView } from './game.service';

const BOT_NAMES = ['Bot Lan', 'Bot Đức', 'Bot Thảo', 'Bot Bảo', 'Bot Mai'];

export function createBotPlayers(count: number): Player[] {
  const bots: Player[] = [];
  for (let i = 0; i < count; i++) {
    bots.push({
      id: `bot-${i + 1}`,
      socketId: `bot-socket-${i + 1}`,
      name: BOT_NAMES[i] || `Bot ${i + 1}`,
      isBot: true,
      hand: { means: [], clues: [], flippedClues: [] },
      badges: 1,
      extraBadges: 0,
      isConnected: true,
    });
  }
  return bots;
}

/**
 * After a state change, check if any bot needs to act and do so after a short delay.
 */
export function processBotActions(io: Server, room: GameRoom): void {
  const state = room.state;

  if (state === 'NIGHT_EVIL_DISCUSS') {
    // Auto-advance after 2s (bots don't need discussion time)
    // The real player might be evil too, so only advance if both evil are bots
    // Actually, this phase has no explicit trigger - it advances via timer or UI
    // For demo, auto-advance to NIGHT_EVIL_CHOOSE_CARDS after a short delay
    setTimeout(() => {
      if (room.state !== 'NIGHT_EVIL_DISCUSS') return;
      room.state = 'NIGHT_EVIL_CHOOSE_CARDS';
      broadcastToAll(io, room);
      processBotActions(io, room);
    }, 2000);
    return;
  }

  if (state === 'NIGHT_EVIL_CHOOSE_CARDS') {
    // Bot evil players auto-choose cards
    const murderer = room.players.find(p => p.role === 'MURDERER');
    const accomplice = room.players.find(p => p.role === 'ACCOMPLICE');

    let needsBroadcast = false;

    if (murderer?.isBot && !murderer.trueMeans) {
      setTimeout(() => {
        murderer.trueMeans = murderer.hand.means[0]?.id;
        murderer.trueClue = murderer.hand.clues[0]?.id;
        checkEvilDone(io, room);
      }, 1500);
    }

    if (accomplice?.isBot && !accomplice.trueMeans) {
      setTimeout(() => {
        accomplice.trueMeans = accomplice.hand.means[1]?.id || accomplice.hand.means[0]?.id;
        accomplice.trueClue = accomplice.hand.clues[1]?.id || accomplice.hand.clues[0]?.id;
        checkEvilDone(io, room);
      }, 2500);
    }
    return;
  }

  if (state === 'NIGHT_WITNESS_REVEAL') {
    const witness = room.players.find(p => p.role === 'WITNESS');
    if (witness?.isBot) {
      setTimeout(() => {
        if (room.state !== 'NIGHT_WITNESS_REVEAL') return;
        room.state = 'NIGHT_FORENSIC_REVEAL';
        broadcastToAll(io, room);
        processBotActions(io, room);
      }, 1500);
    }
    return;
  }

  if (state === 'NIGHT_FORENSIC_REVEAL') {
    const forensic = room.players.find(p => p.role === 'FORENSIC');
    if (forensic?.isBot) {
      setTimeout(() => {
        if (room.state !== 'NIGHT_FORENSIC_REVEAL') return;
        room.state = 'INVESTIGATION_ROUND_1';
        broadcastToAll(io, room);
        processBotActions(io, room);
      }, 1500);
    }
    return;
  }

  if (state === 'WITNESS_HUNT') {
    const murderer = room.players.find(p => p.role === 'MURDERER');
    if (murderer?.isBot && room.witnessHunt) {
      setTimeout(() => {
        if (room.state !== 'WITNESS_HUNT') return;
        // Bot murderer randomly picks a non-murderer player (might miss witness)
        const candidates = room.players.filter(p => p.role !== 'MURDERER');
        const target = candidates[Math.floor(Math.random() * candidates.length)];
        room.witnessHunt!.targetChoice = target.id;

        const witness = room.players.find(p => p.role === 'WITNESS');
        if (target.id === witness?.id) {
          room.witnessHunt!.result = 'WITNESS_FOUND';
          room.gameResult = { winner: 'EVIL', reason: 'WITNESS_HUNTED' };
        } else {
          room.witnessHunt!.result = 'WITNESS_SAFE';
          room.gameResult = { winner: 'GOOD', reason: 'WITNESS_SAFE' };
        }
        room.state = 'GAME_END';
        broadcastToAll(io, room);
      }, 2000);
    }
    return;
  }

  // Investigation phases - bot forensic auto-places markers
  if (state.startsWith('INVESTIGATION_ROUND')) {
    const forensic = room.players.find(p => p.role === 'FORENSIC');
    if (forensic?.isBot && room.sceneBoard) {
      setTimeout(() => {
        if (!room.state.startsWith('INVESTIGATION_ROUND')) return;
        // Auto-place markers on tiles that don't have markers yet
        const allTiles = [
          room.sceneBoard.location,
          room.sceneBoard.cause,
          ...room.sceneBoard.clues,
        ].filter(Boolean);

        for (const tile of allTiles) {
          if (tile && !(tile.id in room.markers)) {
            // Pick a somewhat relevant option (random for bot)
            room.markers[tile.id] = Math.floor(Math.random() * tile.options.length);
          }
        }
        broadcastToAll(io, room);
      }, 3000);
    }
    return;
  }
}

function checkEvilDone(io: Server, room: GameRoom): void {
  if (room.state !== 'NIGHT_EVIL_CHOOSE_CARDS') return;

  const murderer = room.players.find(p => p.role === 'MURDERER');
  const accomplice = room.players.find(p => p.role === 'ACCOMPLICE');

  const murdererDone = murderer?.trueMeans && murderer?.trueClue;
  const accompliceDone = !accomplice || (accomplice.trueMeans && accomplice.trueClue);

  if (murdererDone && accompliceDone) {
    if (accomplice) {
      room.state = 'NIGHT_WITNESS_REVEAL';
    } else {
      room.state = 'NIGHT_FORENSIC_REVEAL';
    }
    broadcastToAll(io, room);
    processBotActions(io, room);
  } else {
    // Broadcast current state so real player sees bot's selection
    broadcastToAll(io, room);
  }
}

function broadcastToAll(io: Server, room: GameRoom): void {
  for (const p of room.players) {
    if (p.isBot) continue;
    const playerSocket = io.sockets.sockets.get(p.socketId);
    if (playerSocket) {
      playerSocket.emit('game:state', getPlayerView(room, p.id));
    }
  }
}
