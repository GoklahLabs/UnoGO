import { useState, useEffect, useRef } from 'react';
import { socket } from './socket';
import { PublicGameState, SessionInfo } from './types';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';

type Page = 'home' | 'lobby' | 'game';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [gameState, setGameState] = useState<PublicGameState | null>(null);

  // Keep session in ref so socket callbacks always see latest value
  const sessionRef = useRef<SessionInfo | null>(null);
  sessionRef.current = session;

  useEffect(() => {
    const onGameState = (state: PublicGameState) => {
      setGameState(state);
      if (state.status === 'playing' || state.status === 'finished') {
        setPage('game');
      } else if (state.status === 'waiting') {
        // Reset to lobby when game resets
        setPage((prev) => (prev === 'game' ? 'lobby' : prev));
      }
    };

    const onPlayerLeft = ({ message }: { message: string }) => {
      // Show a temporary toast — handled inside GamePage / LobbyPage via prop
      console.log('[playerLeft]', message);
    };

    socket.on('gameState', onGameState);
    socket.on('playerLeft', onPlayerLeft);
    return () => {
      socket.off('gameState', onGameState);
      socket.off('playerLeft', onPlayerLeft);
    };
  }, []);

  const handleRoomJoined = (info: SessionInfo) => {
    setSession(info);
    setPage('lobby');
  };

  const handleLeave = () => {
    setPage('home');
    setSession(null);
    setGameState(null);
  };

  return (
    <div className="app">
      {page === 'home' && (
        <HomePage onRoomJoined={handleRoomJoined} />
      )}
      {page === 'lobby' && session && (
        <LobbyPage
          session={session}
          gameState={gameState}
          onLeave={handleLeave}
        />
      )}
      {page === 'game' && session && gameState && (
        <GamePage
          session={session}
          gameState={gameState}
          onLeave={handleLeave}
        />
      )}
    </div>
  );
}
