// Mirror of server types (hands of other players are hidden)

export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardType = 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wildDraw4';

export interface Card {
  id: string;
  color: CardColor;
  type: CardType;
  value?: number;
}

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

export interface SessionInfo {
  roomCode: string;
  playerId: string;
  isHost: boolean;
  nickname: string;
}
