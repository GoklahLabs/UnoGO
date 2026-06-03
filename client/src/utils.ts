import { Card, CardColor, PublicGameState } from './types';

/** Decide if a card in the player's hand is currently playable */
export function isCardPlayable(
  card: Card,
  gameState: PublicGameState,
  isMyTurn: boolean,
): boolean {
  if (!isMyTurn) return false;

  const { topCard, currentColor, pendingDraw, canPass, lastDrawnCardId } = gameState;
  if (!topCard) return false;

  // After drawing, only the drawn card is playable
  if (canPass && lastDrawnCardId) {
    if (card.id !== lastDrawnCardId) return false;
  }

  return canPlayCard(card, topCard, currentColor, pendingDraw);
}

function canPlayCard(
  card: Card,
  topCard: Card,
  currentColor: CardColor,
  pendingDraw: number,
): boolean {
  if (card.type === 'wildDraw4') return true;
  if (card.type === 'wild') return pendingDraw === 0;
  if (pendingDraw > 0) return false;
  if (card.color === currentColor) return true;
  if (card.type !== 'number' && card.type === topCard.type) return true;
  if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value) return true;
  return false;
}

/** Display label for card type */
export function cardLabel(card: Card): string {
  switch (card.type) {
    case 'number': return String(card.value ?? '');
    case 'skip': return '⊘';
    case 'reverse': return '↺';
    case 'draw2': return '+2';
    case 'wild': return '✦';
    case 'wildDraw4': return '+4';
  }
}

/** Human-readable color name */
export function colorName(color: CardColor): string {
  const map: Record<CardColor, string> = {
    red: 'Vermelho',
    blue: 'Azul',
    green: 'Verde',
    yellow: 'Amarelo',
    wild: 'Coringa',
  };
  return map[color];
}
