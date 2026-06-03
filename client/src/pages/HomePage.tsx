import { useState, useRef, useEffect } from 'react';
import { socket } from '../socket';
import { SessionInfo } from '../types';
import { sounds } from '../sounds';

interface HomePageProps {
  onRoomJoined: (info: SessionInfo) => void;
}

export default function HomePage({ onRoomJoined }: HomePageProps) {
  const [nickname, setNickname] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<'create' | 'join' | null>(null);

  const nicknameRef = useRef(nickname);
  nicknameRef.current = nickname;

  useEffect(() => {
    const onJoined = (data: { roomCode: string; playerId: string; isHost: boolean }) => {
      setLoading(null);
      sounds.click();
      onRoomJoined({ ...data, nickname: nicknameRef.current.trim() });
    };
    const onErr = ({ message }: { message: string }) => {
      setError(message);
      setLoading(null);
      sounds.error();
    };
    socket.on('roomJoined', onJoined);
    socket.on('gameError', onErr);
    return () => { socket.off('roomJoined', onJoined); socket.off('gameError', onErr); };
  }, [onRoomJoined]);

  const validate = () => {
    if (!nickname.trim()) { setError('Informe seu nickname'); return false; }
    if (nickname.trim().length < 2) { setError('Mínimo 2 caracteres'); return false; }
    setError('');
    return true;
  };

  const handleCreate = () => {
    if (!validate()) return;
    sounds.click();
    setLoading('create');
    socket.emit('createRoom', { nickname: nickname.trim() });
  };

  const handleJoin = () => {
    if (!validate()) return;
    if (!joinCode.trim()) { setError('Informe o código da sala'); return; }
    sounds.click();
    setLoading('join');
    socket.emit('joinRoom', { code: joinCode.trim().toUpperCase(), nickname: nickname.trim() });
  };

  return (
    <div className="home-page">
      <div className="home-card">

        {/* Logo */}
        <div className="home-logo">
          <div className="home-pips">
            <div className="pip pip-r" />
            <div className="pip pip-b" />
            <div className="pip pip-g" />
            <div className="pip pip-y" />
          </div>
          <h1>UnoGO</h1>
          <p>Jogo de cartas para dois &nbsp;·&nbsp; v1.0</p>
        </div>

        {/* Nickname */}
        <div className="home-section">
          <label className="home-label" htmlFor="inp-nick">Seu nickname</label>
          <input
            id="inp-nick"
            className="input"
            type="text"
            placeholder="Como quer ser chamado..."
            value={nickname}
            maxLength={20}
            onChange={e => setNickname(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
        </div>

        {/* Create */}
        <button
          className="btn btn-primary"
          onClick={handleCreate}
          disabled={loading !== null}
          id="btn-create"
        >
          {loading === 'create'
            ? <><span className="spinner" style={{ width:14,height:14 }} /> Criando...</>
            : 'Criar sala'}
        </button>

        <div className="home-divider">ou entre em sala existente</div>

        {/* Join */}
        <div className="home-join-row">
          <input
            id="inp-code"
            className="input"
            type="text"
            placeholder="Código (ex: AB3X9Z)"
            value={joinCode}
            maxLength={6}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />
          <button
            className="btn btn-secondary"
            onClick={handleJoin}
            disabled={loading !== null}
            id="btn-join"
            style={{ flexShrink: 0 }}
          >
            {loading === 'join' ? '...' : 'Entrar'}
          </button>
        </div>

        {error && <div className="error-inline">{error}</div>}
      </div>
    </div>
  );
}
