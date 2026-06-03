import { Card as CardType } from '../types';
import { cardLabel } from '../utils';

interface CardProps {
  card: CardType;
  playable?: boolean;
  highlighted?: boolean;
  isDiscard?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const BG: Record<CardType['color'], string> = {
  red:    'linear-gradient(145deg, #e53535 0%, #991b1b 100%)',
  blue:   'linear-gradient(145deg, #2563eb 0%, #1e3a8a 100%)',
  green:  'linear-gradient(145deg, #16a34a 0%, #14532d 100%)',
  yellow: 'linear-gradient(145deg, #facc15 0%, #ca8a04 65%, #713f12 100%)',
  wild:   'conic-gradient(#e53535 0deg 90deg, #2563eb 90deg 180deg, #16a34a 180deg 270deg, #facc15 270deg 360deg)',
};

export default function Card({
  card,
  playable = false,
  highlighted = false,
  isDiscard = false,
  style,
  onClick,
}: CardProps) {
  const label = cardLabel(card);

  const cls = [
    'card',
    isDiscard          ? 'card-discard' : '',
    !isDiscard && playable  ? 'playable'  : '',
    !isDiscard && !playable ? 'disabled'  : '',
    highlighted             ? 'highlighted' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cls}
      style={{ background: BG[card.color], ...style }}
      onClick={playable && !isDiscard ? onClick : undefined}
      role={playable && !isDiscard ? 'button' : undefined}
      title={`${card.color} ${label}`}
    >
      {/* Characteristic UNO oval */}
      <div className="card-oval" />

      {/* Corner top-left */}
      <span className="card-corner tl">{label}</span>

      {/* Center symbol */}
      <span className="card-symbol">{label}</span>

      {/* Corner bottom-right (rotated 180°) */}
      <span className="card-corner br">{label}</span>
    </div>
  );
}
