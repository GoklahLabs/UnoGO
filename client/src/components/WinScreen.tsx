import { useEffect, useRef } from 'react';

interface WinScreenProps {
  isWinner: boolean;
  winnerName: string;
  isHost: boolean;
  onRestart: () => void;
  onLeave: () => void;
}

const CONFETTI_COLORS = ['#e53535','#2563eb','#16a34a','#facc15','#818cf8','#f472b6','#fb923c'];

export default function WinScreen({ isWinner, winnerName, isHost, onRestart, onLeave }: WinScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isWinner || !containerRef.current) return;
    const box = containerRef.current;
    const pieces: HTMLDivElement[] = [];

    for (let i = 0; i < 50; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      const size = 6 + Math.random() * 9;
      el.style.cssText = `
        width: ${size}px; height: ${size}px;
        background: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
        left: ${Math.random() * 100}%;
        top: 0;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation-duration: ${1.4 + Math.random() * 2}s;
        animation-delay: ${Math.random() * 0.9}s;
      `;
      box.appendChild(el);
      pieces.push(el);
    }
    return () => pieces.forEach(p => p.remove());
  }, [isWinner]);

  return (
    <div className="win-overlay">
      <div className="win-box" ref={containerRef}>

        {/* Icon */}
        <div className={`win-icon-wrap ${isWinner ? 'winner' : 'loser'}`}>
          {isWinner ? (
            /* Trophy in CSS */
            <div className="trophy-icon">
              <div className="trophy-cup" />
              <div className="trophy-stem" />
              <div className="trophy-base" />
            </div>
          ) : (
            <div className="shield-icon" />
          )}
        </div>

        <h2 className={`win-title ${isWinner ? 'winner' : 'loser'}`}>
          {isWinner ? 'Você ganhou' : 'Você perdeu'}
        </h2>

        <p className="win-sub">
          {isWinner
            ? 'Todas as cartas jogadas. Partida encerrada.'
            : `${winnerName} venceu esta rodada.`}
        </p>

        <div className="win-actions">
          {isHost ? (
            <button className="btn btn-success" onClick={onRestart} id="btn-restart">
              Jogar novamente
            </button>
          ) : (
            <div style={{ color: 'var(--text-soft)', fontSize: '0.88rem', padding: '6px 0' }}>
              Aguardando o host reiniciar...
            </div>
          )}
          <button className="btn btn-ghost" onClick={onLeave} id="btn-leave-win">
            Sair da sala
          </button>
        </div>
      </div>
    </div>
  );
}
