import { Room, Card, CardColor, GameState, Player, PublicGameState } from './types';
import { createDeck, shuffleDeck, drawCards } from './deck';

// ──────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────────────────────────────────────

function refillDeckIfNeeded(room: Room): void {
  const gs = room.gameState;
  if (gs.deck.length < 4 && gs.discardPile.length > 1) {
    const topCard = gs.discardPile[gs.discardPile.length - 1];
    const toReshuffle = gs.discardPile.slice(0, -1);
    gs.discardPile = [topCard];
    gs.deck = [...gs.deck, ...shuffleDeck(toReshuffle)];
    console.log(`[deck] Reshuffled discard pile. Deck now has ${gs.deck.length} cards.`);
  }
}

function applyPendingDraw(room: Room, player: Player): void {
  const gs = room.gameState;
  if (gs.pendingDraw <= 0) return;
  refillDeckIfNeeded(room);
  const count = Math.min(gs.pendingDraw, gs.deck.length);
  const { drawn, remaining } = drawCards(gs.deck, count);
  gs.deck = remaining;
  player.hand = [...player.hand, ...drawn];
  gs.pendingDraw = 0;
}

// ──────────────────────────────────────────────────────────────────────────────
// Core
// ──────────────────────────────────────────────────────────────────────────────

export function advanceTurn(room: Room): void {
  const gs = room.gameState;
  const n = gs.players.length;
  gs.currentPlayerIndex = ((gs.currentPlayerIndex + gs.direction) + n) % n;
}

// ──────────────────────────────────────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────────────────────────────────────

export function canPlayCard(
  card: Card,
  topCard: Card,
  currentColor: CardColor,
  pendingDraw: number,
): boolean {
  // Wild cards: always playable when there is no pending draw
  // WildDraw4 can still be played on top of pendingDraw
  if (card.type === 'wildDraw4') return true;
  if (card.type === 'wild') return pendingDraw === 0;

  // With a pending draw, only matching draw cards could stack (not implemented – player must draw)
  if (pendingDraw > 0) return false;

  // Same active color
  if (card.color === currentColor) return true;

  // Same type (special cards)
  if (card.type !== 'number' && card.type === topCard.type) return true;

  // Same number value
  if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value) return true;

  return false;
}

// ──────────────────────────────────────────────────────────────────────────────
// Game lifecycle
// ──────────────────────────────────────────────────────────────────────────────

export function startGame(room: Room): void {
  const gs = room.gameState;
  const deck = shuffleDeck(createDeck());

  let remaining = [...deck];

  // Deal 7 cards to each player
  for (const player of gs.players) {
    player.hand = remaining.splice(0, 7);
    player.saidUno = false;
  }

  // Reveal top card — skip wilds as first card
  let topCard: Card;
  do {
    topCard = remaining.splice(0, 1)[0];
    if (topCard.type === 'wild' || topCard.type === 'wildDraw4') {
      remaining.push(topCard); // put back at end
    } else {
      break;
    }
  } while (remaining.length > 0);

  gs.deck = remaining;
  gs.discardPile = [topCard];
  gs.currentPlayerIndex = 0;
  gs.direction = 1;
  gs.currentColor = topCard.color as Exclude<CardColor, 'wild'>;
  gs.pendingDraw = 0;
  gs.status = 'playing';
  gs.canPass = false;
  gs.lastDrawnCardId = undefined;
  gs.winner = undefined;

  // Handle special first card effects
  if (topCard.type === 'skip' || topCard.type === 'reverse') {
    // First player is skipped → second player goes first
    advanceTurn(room);
  } else if (topCard.type === 'draw2') {
    // Auto-apply draw to first player, then advance
    const firstPlayer = gs.players[0];
    const { drawn, remaining: rest } = drawCards(gs.deck, 2);
    gs.deck = rest;
    firstPlayer.hand = [...firstPlayer.hand, ...drawn];
    advanceTurn(room);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Actions
// ──────────────────────────────────────────────────────────────────────────────

/** Returns an error string or null on success */
export function playCard(
  room: Room,
  playerId: string,
  cardId: string,
  chosenColor?: CardColor,
): string | null {
  const gs = room.gameState;
  const playerIndex = gs.players.findIndex((p) => p.id === playerId);

  if (playerIndex !== gs.currentPlayerIndex) return 'Não é sua vez';

  const player = gs.players[playerIndex];
  const card = player.hand.find((c) => c.id === cardId);
  if (!card) return 'Carta não encontrada na sua mão';

  // When player just drew, only the drawn card may be played
  if (gs.canPass && gs.lastDrawnCardId && cardId !== gs.lastDrawnCardId) {
    return 'Após comprar, só pode jogar a carta que comprou';
  }

  const topCard = gs.discardPile[gs.discardPile.length - 1];
  if (!canPlayCard(card, topCard, gs.currentColor, gs.pendingDraw)) {
    return 'Jogada inválida';
  }

  // Remove from hand
  player.hand = player.hand.filter((c) => c.id !== cardId);
  gs.discardPile.push(card);
  gs.canPass = false;
  gs.lastDrawnCardId = undefined;

  // Reset UNO flag if hand has more than 1 card
  if (player.hand.length > 1) player.saidUno = false;

  // Apply effect
  switch (card.type) {
    case 'number':
      gs.currentColor = card.color;
      advanceTurn(room);
      break;

    case 'skip':
      gs.currentColor = card.color;
      // Skip next player (advance twice for 2-player = same player goes again)
      advanceTurn(room);
      advanceTurn(room);
      break;

    case 'reverse':
      gs.currentColor = card.color;
      // For 2 players reverse = skip
      gs.direction = (gs.direction * -1) as 1 | -1;
      advanceTurn(room);
      advanceTurn(room);
      break;

    case 'draw2':
      gs.currentColor = card.color;
      gs.pendingDraw += 2;
      advanceTurn(room);
      break;

    case 'wild':
      gs.currentColor = chosenColor ?? 'red';
      advanceTurn(room);
      break;

    case 'wildDraw4':
      gs.currentColor = chosenColor ?? 'red';
      gs.pendingDraw += 4;
      advanceTurn(room);
      break;
  }

  return null;
}

/** Draw card(s). If pendingDraw > 0, player draws the penalty and loses turn.
 *  Otherwise draws 1 card and may pass or play it. */
export function drawCard(room: Room, playerId: string): string | null {
  const gs = room.gameState;
  const playerIndex = gs.players.findIndex((p) => p.id === playerId);

  if (playerIndex !== gs.currentPlayerIndex) return 'Não é sua vez';
  if (gs.canPass) return 'Você já comprou uma carta. Jogue-a ou passe a vez.';

  const player = gs.players[playerIndex];
  refillDeckIfNeeded(room);

  if (gs.deck.length === 0) return 'O baralho está vazio!';

  if (gs.pendingDraw > 0) {
    // Penalty draw — draw all pending and lose turn
    applyPendingDraw(room, player);
    advanceTurn(room);
  } else {
    // Normal draw — 1 card, player may play it or pass
    const { drawn, remaining } = drawCards(gs.deck, 1);
    gs.deck = remaining;
    player.hand = [...player.hand, ...drawn];
    gs.canPass = true;
    gs.lastDrawnCardId = drawn[0]?.id;
  }

  return null;
}

/** Pass turn after drawing */
export function passTurn(room: Room, playerId: string): string | null {
  const gs = room.gameState;
  const playerIndex = gs.players.findIndex((p) => p.id === playerId);

  if (playerIndex !== gs.currentPlayerIndex) return 'Não é sua vez';
  if (!gs.canPass) return 'Você precisa comprar uma carta antes de passar';

  gs.canPass = false;
  gs.lastDrawnCardId = undefined;
  advanceTurn(room);
  return null;
}

/** Mark player as having said UNO */
export function sayUno(room: Room, playerId: string): void {
  const player = room.gameState.players.find((p) => p.id === playerId);
  if (player) player.saidUno = true;
}

/** Challenge opponent for not saying UNO — opponent draws 2 if caught */
export function challengeUno(room: Room, challengerId: string): string | null {
  const gs = room.gameState;
  const opponent = gs.players.find((p) => p.id !== challengerId);
  if (!opponent) return 'Adversário não encontrado';

  if (opponent.hand.length === 1 && !opponent.saidUno) {
    refillDeckIfNeeded(room);
    const { drawn, remaining } = drawCards(gs.deck, 2);
    gs.deck = remaining;
    opponent.hand = [...opponent.hand, ...drawn];
    return null; // success
  }

  // Invalid challenge — challenger draws 2
  const challenger = gs.players.find((p) => p.id === challengerId);
  if (challenger) {
    refillDeckIfNeeded(room);
    const { drawn, remaining } = drawCards(gs.deck, 2);
    gs.deck = remaining;
    challenger.hand = [...challenger.hand, ...drawn];
  }
  return 'Acusação inválida — você comprou 2 cartas';
}

/** Check if any player has won (empty hand). Returns winning Player or null. */
export function checkWinner(room: Room): Player | null {
  for (const player of room.gameState.players) {
    if (player.hand.length === 0) return player;
  }
  return null;
}

/** Reset game state back to waiting without destroying the room */
export function resetGame(room: Room): void {
  const gs = room.gameState;
  for (const player of gs.players) {
    player.hand = [];
    player.saidUno = false;
  }
  gs.deck = [];
  gs.discardPile = [];
  gs.currentPlayerIndex = 0;
  gs.direction = 1;
  gs.currentColor = 'red';
  gs.pendingDraw = 0;
  gs.status = 'waiting';
  gs.canPass = false;
  gs.lastDrawnCardId = undefined;
  gs.winner = undefined;
}

// ──────────────────────────────────────────────────────────────────────────────
// State projection — hides opponents' hands
// ──────────────────────────────────────────────────────────────────────────────

export function getPublicState(gs: GameState, forPlayerId: string): PublicGameState {
  const myPlayer = gs.players.find((p) => p.id === forPlayerId);
  const topCard = gs.discardPile.length > 0
    ? gs.discardPile[gs.discardPile.length - 1]
    : null;

  return {
    roomCode: gs.roomCode,
    players: gs.players.map((p) => ({
      id: p.id,
      nickname: p.nickname,
      cardCount: p.hand.length,
      saidUno: p.saidUno,
      connected: p.connected,
      isHost: p.isHost,
    })),
    myHand: myPlayer?.hand ?? [],
    topCard,
    currentColor: gs.currentColor,
    currentPlayerIndex: gs.currentPlayerIndex,
    direction: gs.direction,
    pendingDraw: gs.pendingDraw,
    status: gs.status,
    canPass: gs.canPass,
    lastDrawnCardId: gs.lastDrawnCardId,
    winner: gs.winner,
  };
}
