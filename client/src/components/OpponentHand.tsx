import { PublicPlayer } from '../types';

interface OpponentHandProps {
  opponent: PublicPlayer | undefined;
  isOpponentTurn: boolean;
}

export default function OpponentHand({ opponent, isOpponentTurn }: OpponentHandProps) {
  if (!opponent) {
    return (
      <div className="opp-strip">
        <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.06em' }}>
          Aguardando adversário...
        </div>
        <div className="spinner" />
      </div>
    );
  }

  const count = opponent.cardCount;
  const displayCount = Math.min(count, 10);
  const middle = (displayCount - 1) / 2;
  const spreadPerCard = displayCount <= 1 ? 0 : Math.min(6, 30 / (displayCount - 1));

  return (
    <div className="opp-strip">
      <div className={`opp-name ${isOpponentTurn ? 'active' : ''}`}>
        {opponent.nickname}
        {!opponent.connected && ' — desconectado'}
      </div>

      {/* Fan of card backs */}
      <div className="opp-cards-fan" style={{ minWidth: `${displayCount * 28 + 52}px` }}>
        {displayCount > 0 ? (
          Array.from({ length: displayCount }).map((_, i) => {
            const offset = i - middle;
            const rotate = offset * spreadPerCard;
            return (
              <div
                key={i}
                className="card-back"
                style={{
                  position: 'absolute',
                  left: `${i * 20}px`,
                  transform: `rotate(${rotate}deg)`,
                  transformOrigin: 'bottom center',
                  zIndex: i,
                }}
              />
            );
          })
        ) : (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Sem cartas</div>
        )}

        {/* UNO badge */}
        {opponent.saidUno && count === 1 && (
          <div className="opp-uno-tag">UNO</div>
        )}
      </div>

      <div className="opp-count">
        {count} {count === 1 ? 'carta' : 'cartas'}
        {count > 10 && ` (+${count - 10} não exibidos)`}
      </div>
    </div>
  );
}
