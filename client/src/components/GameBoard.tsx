import { PublicGameState, PublicPlayer } from '../types';
import { colorName } from '../utils';
import Card from './Card';

const ORB_COLOR: Record<string, string> = {
  red:    '#e53535',
  blue:   '#2563eb',
  green:  '#16a34a',
  yellow: '#facc15',
  wild:   '#818cf8',
};

const ORB_BG: Record<string, string> = {
  red:    'linear-gradient(145deg, #e53535, #991b1b)',
  blue:   'linear-gradient(145deg, #2563eb, #1e3a8a)',
  green:  'linear-gradient(145deg, #16a34a, #14532d)',
  yellow: 'linear-gradient(145deg, #facc15, #ca8a04)',
  wild:   'linear-gradient(145deg, #4f46e5, #312e81)',
};

interface GameBoardProps {
  gameState: PublicGameState;
  isMyTurn: boolean;
  myPlayer: PublicPlayer | undefined;
  canChallenge: boolean;
  onDraw: () => void;
  onPass: () => void;
  onUno: () => void;
  onChallenge: () => void;
}

export default function GameBoard({
  gameState,
  isMyTurn,
  myPlayer,
  canChallenge,
  onDraw,
  onPass,
  onUno,
  onChallenge,
}: GameBoardProps) {
  const { topCard, currentColor, pendingDraw, canPass, players, currentPlayerIndex } = gameState;
  const currentPlayerName = players[currentPlayerIndex]?.nickname ?? '...';

  const showUno =
    isMyTurn &&
    myPlayer &&
    myPlayer.cardCount <= 2 &&
    !myPlayer.saidUno;

  return (
    <div className="board">

      {/* ── Pending draw banner ─────────────────────────────────────────── */}
      {pendingDraw > 0 && (
        <div className="pending-banner">
          <div className="pending-banner-number">+{pendingDraw}</div>
          <div className="pending-banner-sub">
            {isMyTurn ? 'Compre as cartas' : 'Compra acumulada'}
          </div>
        </div>
      )}

      {/* ── Piles ──────────────────────────────────────────────────────── */}
      <div className="board-piles">

        {/* Draw pile */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          <div
            className={`deck-pile ${isMyTurn && !canPass ? 'clickable' : ''}`}
            onClick={isMyTurn && !canPass ? onDraw : undefined}
            id="deck-pile"
            title="Comprar carta"
          >
            <span className="deck-star">✦</span>
          </div>
          <span className="deck-pile-label">Comprar</span>
        </div>

        {/* Center: color orb + direction */}
        <div className="board-center-info">
          <div
            className="color-orb"
            style={{
              background: ORB_BG[currentColor] ?? ORB_BG.wild,
              // CSS custom property for box-shadow glow
              ['--orb-color' as string]: ORB_COLOR[currentColor] ?? '#818cf8',
            }}
            title={`Cor atual: ${colorName(currentColor)}`}
          />
          <div className="orb-label">{colorName(currentColor)}</div>
          <div className="direction-indicator">
            {gameState.direction === 1 ? '— horário' : '— anti-horário'}
          </div>
        </div>

        {/* Discard pile */}
        <div className="discard-pile-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          {topCard ? (
            <Card card={topCard} isDiscard />
          ) : (
            <div className="discard-placeholder">?</div>
          )}
          <span className="discard-pile-label">Descarte</span>
        </div>
      </div>

      {/* ── Status + actions ───────────────────────────────────────────── */}
      <div className="board-status">
        <div className={`turn-label ${isMyTurn ? 'my-turn' : ''}`}>
          {isMyTurn ? 'Sua vez' : `Vez de ${currentPlayerName}`}
        </div>
      </div>

      <div className="board-actions">
        {/* UNO */}
        {showUno && (
          <button className="btn btn-uno" onClick={onUno} id="btn-uno">
            UNO
          </button>
        )}

        {/* Pass after drawing */}
        {isMyTurn && canPass && (
          <button className="btn btn-secondary" onClick={onPass} id="btn-pass">
            Passar vez
          </button>
        )}

        {/* Challenge UNO */}
        {canChallenge && (
          <button className="btn btn-danger btn-sm" onClick={onChallenge} id="btn-challenge">
            Acusar UNO
          </button>
        )}
      </div>
    </div>
  );
}
