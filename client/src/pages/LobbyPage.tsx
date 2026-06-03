import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { PublicGameState, SessionInfo } from '../types';
import { sounds } from '../sounds';

interface LobbyPageProps {
  session: SessionInfo;
  gameState: PublicGameState | null;
  onLeave: () => void;
}

export default function LobbyPage({ session, gameState, onLeave }: LobbyPageProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onErr = ({ message }: { message: string }) => {
      setError(message);
      sounds.error();
    };
    socket.on('gameError', onErr);
    return () => { socket.off('gameError', onErr); };

  }, []);

  const roomUrl = `${window.location.origin}?room=${session.roomCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
    } catch {
      const el = document.createElement('textarea');
      el.value = session.roomCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
    }
    sounds.click();
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleStart = () => {
    sounds.click();
    setError('');
    socket.emit('startGame', { roomCode: session.roomCode });
  };

  const players = gameState?.players ?? [];
  const canStart = session.isHost && players.length >= 2;

  return (
    <div className="lobby-page">
      <div className="lobby-card">
        <h2 className="lobby-heading">Sala de Espera</h2>

        {/* Room code */}
        <div className="lobby-code-box">
          <div className="lobby-code-label">Código da sala</div>
          <div className="lobby-code">{session.roomCode}</div>
          <button className={`lobby-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} id="btn-copy">
            {copied ? 'Link copiado' : 'Copiar link'}
          </button>
        </div>

        {/* Players */}
        <div style={{ marginBottom: 20 }}>
          <div className="lobby-section-label">Jogadores ({players.length} / 2)</div>

          {players.map(p => (
            <div key={p.id} className="lobby-player">
              <div className="lobby-dot" />
              <div className="lobby-player-name">
                {p.nickname}{p.id === session.playerId ? ' — você' : ''}
              </div>
              {p.isHost && <div className="lobby-badge">Host</div>}
            </div>
          ))}

          {players.length < 2 && (
            <div className="lobby-waiting-row">
              <div className="spinner" />
              Aguardando o segundo jogador...
            </div>
          )}
        </div>

        {/* Hint */}
        {players.length < 2 && (
          <div style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            padding: '12px 16px',
            fontSize: '0.84rem',
            color: 'var(--text-soft)',
            lineHeight: 1.55,
            marginBottom: 4,
          }}>
            Compartilhe o código ou o link com seu parceiro.
          </div>
        )}

        {/* Actions */}
        <div className="lobby-actions">
          {session.isHost ? (
            <button
              className="btn btn-success"
              onClick={handleStart}
              disabled={!canStart}
              id="btn-start"
            >
              {canStart ? 'Iniciar partida' : 'Aguardando jogadores...'}
            </button>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-soft)', fontSize: '0.88rem', padding: '8px 0' }}>
              Aguardando o host iniciar...
            </div>
          )}
          <button className="btn btn-ghost btn-sm" onClick={onLeave} id="btn-leave">
            Sair da sala
          </button>
        </div>

        {error && <div className="error-inline" style={{ marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}
