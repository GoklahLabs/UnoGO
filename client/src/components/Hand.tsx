import { Card as CardType, PublicGameState } from '../types';
import { isCardPlayable } from '../utils';
import Card from './Card';

interface HandProps {
  cards: CardType[];
  isMyTurn: boolean;
  gameState: PublicGameState;
  onPlayCard: (card: CardType) => void;
}

export default function Hand({ cards, isMyTurn, gameState, onPlayCard }: HandProps) {
  const total = cards.length;
  // Fan: max ±14° total spread, capped at 3° per card
  const spreadPerCard = total <= 1 ? 0 : Math.min(3, 14 / (total - 1));
  const middle = (total - 1) / 2;
  // Overlap: more cards = more overlap
  const overlap = total > 8 ? 24 : total > 5 ? 18 : 12;

  return (
    <div className={`hand-strip ${isMyTurn ? 'my-turn-glow' : ''}`}>
      <div className="hand-label">Suas cartas — {total}</div>
      <div className="hand-cards" style={{ alignItems: 'flex-end' }}>
        {cards.map((card, i) => {
          const playable = isCardPlayable(card, gameState, isMyTurn);
          const highlighted = gameState.canPass && card.id === gameState.lastDrawnCardId;
          const offset = i - middle;
          const rotate = offset * spreadPerCard;
          const liftY = -Math.abs(offset) * 2; // center cards are slightly higher

          return (
            <div
              key={card.id}
              style={{
                transform: `rotate(${rotate}deg) translateY(${liftY}px)`,
                transformOrigin: 'bottom center',
                marginLeft: i === 0 ? 0 : `-${overlap}px`,
                zIndex: i,
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (playable) (e.currentTarget as HTMLDivElement).style.zIndex = '30';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.zIndex = String(i);
              }}
            >
              <Card
                card={card}
                playable={playable}
                highlighted={highlighted}
                onClick={() => onPlayCard(card)}
              />
            </div>
          );
        })}
        {total === 0 && (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', padding: '20px 0' }}>
            Sem cartas na mão
          </div>
        )}
      </div>
    </div>
  );
}
