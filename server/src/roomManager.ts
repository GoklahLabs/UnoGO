import { Room, Player, GameState } from './types';

// In-memory stores
const rooms = new Map<string, Room>();
const playerRooms = new Map<string, string>(); // playerId → roomCode

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ──────────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────────

export function createRoom(hostId: string, nickname: string): Room {
  // Guarantee unique code
  let code: string;
  do { code = generateCode(); } while (rooms.has(code));

  const host: Player = {
    id: hostId,
    nickname,
    hand: [],
    saidUno: false,
    connected: true,
    isHost: true,
  };

  const gameState: GameState = {
    roomCode: code,
    players: [host],
    deck: [],
    discardPile: [],
    currentPlayerIndex: 0,
    direction: 1,
    currentColor: 'red',
    pendingDraw: 0,
    status: 'waiting',
    canPass: false,
  };

  const room: Room = { code, hostId, gameState };
  rooms.set(code, room);
  playerRooms.set(hostId, code);
  return room;
}

export function joinRoom(
  code: string,
  playerId: string,
  nickname: string,
): Room | null {
  const room = rooms.get(code.toUpperCase());
  if (!room) return null;
  if (room.gameState.players.length >= 2) return null;
  if (room.gameState.status !== 'waiting') return null;
  // Don't allow same player joining twice
  if (room.gameState.players.some((p) => p.id === playerId)) return null;

  const player: Player = {
    id: playerId,
    nickname,
    hand: [],
    saidUno: false,
    connected: true,
    isHost: false,
  };

  room.gameState.players.push(player);
  playerRooms.set(playerId, code.toUpperCase());
  return room;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

export function getRoomByPlayerId(playerId: string): Room | undefined {
  const code = playerRooms.get(playerId);
  return code ? rooms.get(code) : undefined;
}

/** Remove player from their room. Returns the (possibly updated) room or undefined if room was deleted. */
export function removePlayer(playerId: string): Room | undefined {
  const code = playerRooms.get(playerId);
  if (!code) return undefined;

  const room = rooms.get(code);
  if (!room) return undefined;

  playerRooms.delete(playerId);
  room.gameState.players = room.gameState.players.filter((p) => p.id !== playerId);

  // Delete room if empty
  if (room.gameState.players.length === 0) {
    rooms.delete(code);
    return undefined;
  }

  // Transfer host if needed
  if (room.hostId === playerId) {
    const newHost = room.gameState.players[0];
    newHost.isHost = true;
    room.hostId = newHost.id;
  }

  return room;
}

export function deleteRoom(code: string): void {
  const room = rooms.get(code);
  if (!room) return;
  for (const p of room.gameState.players) playerRooms.delete(p.id);
  rooms.delete(code);
}
