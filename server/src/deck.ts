import { Card, CardColor } from './types';
import { randomUUID } from 'crypto';

const COLORS: Exclude<CardColor, 'wild'>[] = ['red', 'blue', 'green', 'yellow'];

// Build a fresh 108-card deck
export function createDeck(): Card[] {
  const deck: Card[] = [];

  for (const color of COLORS) {
    // One 0 per color
    deck.push({ id: randomUUID(), color, type: 'number', value: 0 });

    // Two of each 1-9 per color
    for (let v = 1; v <= 9; v++) {
      deck.push({ id: randomUUID(), color, type: 'number', value: v });
      deck.push({ id: randomUUID(), color, type: 'number', value: v });
    }

    // Two Skip, Reverse, Draw2 per color
    deck.push({ id: randomUUID(), color, type: 'skip' });
    deck.push({ id: randomUUID(), color, type: 'skip' });
    deck.push({ id: randomUUID(), color, type: 'reverse' });
    deck.push({ id: randomUUID(), color, type: 'reverse' });
    deck.push({ id: randomUUID(), color, type: 'draw2' });
    deck.push({ id: randomUUID(), color, type: 'draw2' });
  }

  // Four Wild + four WildDraw4
  for (let i = 0; i < 4; i++) {
    deck.push({ id: randomUUID(), color: 'wild', type: 'wild' });
    deck.push({ id: randomUUID(), color: 'wild', type: 'wildDraw4' });
  }

  return deck; // 100 + 8 = 108 cards
}

// Fisher-Yates shuffle
export function shuffleDeck(deck: Card[]): Card[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

// Remove and return n cards from front of deck
export function drawCards(deck: Card[], n: number): { drawn: Card[]; remaining: Card[] } {
  const count = Math.min(n, deck.length);
  return {
    drawn: deck.slice(0, count),
    remaining: deck.slice(count),
  };
}
