import { CardColor } from '../types';

interface ColorPickerProps {
  onColorChosen: (color: Exclude<CardColor, 'wild'>) => void;
}

const COLORS: { color: Exclude<CardColor, 'wild'>; label: string }[] = [
  { color: 'red',    label: 'Vermelho' },
  { color: 'blue',   label: 'Azul'     },
  { color: 'green',  label: 'Verde'    },
  { color: 'yellow', label: 'Amarelo'  },
];

export default function ColorPicker({ onColorChosen }: ColorPickerProps) {
  return (
    <div className="picker-overlay">
      <div className="picker-box">
        <div className="picker-title">Escolha a cor</div>
        <div className="picker-grid">
          {COLORS.map(({ color, label }) => (
            <button
              key={color}
              className={`picker-btn ${color}`}
              onClick={() => onColorChosen(color)}
              id={`color-btn-${color}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
