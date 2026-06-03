// ─────────────────────────────────────────────
// Shared types for Color Clash
// ─────────────────────────────────────────────

export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardType = 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wildDraw4';

export interface Card {
  id: string;
  color: CardColor;
  type: CardType;
  value?: number; // 0-9 for number cards
}

export interface Player {
  id: string;
  nickname: string;
  hand: Card[];
  saidUno: boolean;
  connected: boolean;
  isHost: boolean;
}

export interface GameState {
  roomCode: string;
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  currentColor: CardColor;
  pendingDraw: number;       // accumulated draw penalty
  status: 'waiting' | 'playing' | 'finished';
  canPass: boolean;          // true after drawing 1 card (player may pass or play drawn card)
  lastDrawnCardId?: string;  // id of the card just drawn (only playable card when canPass=true)
  winner?: string;           // playerId of winner
}

export interface Room {
  code: string;
  hostId: string;
  gameState: GameState;
}

// ─── Public state sent to each client ───────────────────────────────────────
// Other players' hands are hidden; only counts are shown.

export interface PublicPlayer {
  id: string;
  nickname: string;
  cardCount: number;
  saidUno: boolean;
  connected: boolean;
  isHost: boolean;
}

export interface PublicGameState {
  roomCode: string;
  players: PublicPlayer[];
  myHand: Card[];
  topCard: Card | null;
  currentColor: CardColor;
  currentPlayerIndex: number;
  direction: 1 | -1;
  pendingDraw: number;
  status: 'waiting' | 'playing' | 'finished';
  canPass: boolean;
  lastDrawnCardId?: string;
  winner?: string;
}
