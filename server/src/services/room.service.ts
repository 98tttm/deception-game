import { v4 as uuidv4 } from 'uuid';
import { GameRoom, LobbyRoomView, Player } from '../models/types';
import { PLAYER_LIMITS } from '../models/constants';

class RoomService {
  private rooms = new Map<string, GameRoom>();

  createRoom(
    hostPlayer: Player,
    options: { name: string; maxPlayers: number; mode: 'HUMAN_FORENSIC' | 'AI_FORENSIC'; isPrivate: boolean; password?: string },
  ): GameRoom {
    const room: GameRoom = {
      id: uuidv4().slice(0, 8),
      name: options.name,
      hostId: hostPlayer.id,
      mode: options.mode,
      isPrivate: options.isPrivate,
      password: options.password,
      maxPlayers: Math.min(options.maxPlayers, PLAYER_LIMITS.MAX),
      players: [hostPlayer],
      state: 'LOBBY',
      currentRound: 1,
      sceneBoard: { location: null, cause: null, clues: [] },
      markers: {},
      tileDeck: [],
      eventsUsed: [],
      countdownTriggered: false,
      chatLog: [],
      accusations: [],
      timers: {},
    };
    this.rooms.set(room.id, room);
    return room;
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room?.timers.current) clearTimeout(room.timers.current);
    this.rooms.delete(roomId);
  }

  addPlayer(roomId: string, player: Player): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    if (room.state !== 'LOBBY') return false;
    if (room.players.length >= room.maxPlayers) return false;
    if (room.players.some((p) => p.id === player.id)) return false;
    room.players.push(player);
    return true;
  }

  removePlayer(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.players = room.players.filter((p) => p.id !== playerId);
    if (room.players.length === 0) {
      this.deleteRoom(roomId);
    } else if (room.hostId === playerId) {
      room.hostId = room.players[0].id;
    }
  }

  findRoomByPlayerId(playerId: string): GameRoom | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.some((p) => p.id === playerId)) return room;
    }
    return undefined;
  }

  findRoomBySocketId(socketId: string): GameRoom | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.some((p) => p.socketId === socketId)) return room;
    }
    return undefined;
  }

  getLobbyList(): LobbyRoomView[] {
    const list: LobbyRoomView[] = [];
    for (const room of this.rooms.values()) {
      if (room.isPrivate) continue;
      list.push({
        id: room.id,
        name: room.name,
        hostId: room.hostId,
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          isConnected: p.isConnected,
        })),
        maxPlayers: room.maxPlayers,
        mode: room.mode,
        isPrivate: room.isPrivate,
        status: room.state === 'LOBBY' ? 'WAITING' : 'IN_GAME',
      });
    }
    return list;
  }

  setPlayerConnection(socketId: string, connected: boolean): GameRoom | undefined {
    for (const room of this.rooms.values()) {
      const player = room.players.find((p) => p.socketId === socketId);
      if (player) {
        player.isConnected = connected;
        return room;
      }
    }
    return undefined;
  }
}

export const roomService = new RoomService();
