import { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';
import { Card, CardColor, PublicGameState, SessionInfo } from '../types';
import { cardLabel } from '../utils';
import { sounds } from '../sounds';
import Hand from '../components/Hand';
import OpponentHand from '../components/OpponentHand';
import GameBoard from '../components/GameBoard';
import ColorPicker from '../components/ColorPicker';
import WinScreen from '../components/WinScreen';

interface GamePageProps {
  session: SessionInfo;
  gameState: PublicGameState;
  onLeave: () => void;
}

interface Toast {
  id: number;
  msg: string;
  type: 'error' | 'info' | 'draw';
}

let toastId = 0;

export default function GamePage({ session, gameState, onLeave }: GamePageProps) {
  const [pendingWild, setPendingWild] = useState<Card | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [winnerName, setWinnerName] = useState('');
  const [showTurnAnnounce, setShowTurnAnnounce] = useState(false);

  // ── Track previous state for sound triggers ──────────────────────────────
  const prevIsMyTurnRef = useRef(false);
  const prevStatusRef   = useRef<string>('waiting');
  const prevCanPassRef  = useRef(false);
  const prevPendingRef  = useRef(0);
  const lastDrawnRef    = useRef<string | undefined>(undefined);

  // ── Derived ───────────────────────────────────────────────────────────────
  const myPlayer      = gameState.players.find(p => p.id === session.playerId);
  const opponent      = gameState.players.find(p => p.id !== session.playerId);
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn      = currentPlayer?.id === session.playerId;
  const isOpponentTurn = currentPlayer?.id === opponent?.id;
  const isFinished    = gameState.status === 'finished';
  const isWinner      = isFinished && gameState.winner === session.playerId;

  const canChallenge =
    !isMyTurn &&
    !!opponent &&
    opponent.cardCount === 1 &&
    !opponent.saidUno;

  // ── Toast helper ──────────────────────────────────────────────────────────
  function addToast(msg: string, type: Toast['type'], duration = 3000) {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }

  // ── Socket listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    const onErr = ({ message }: { message: string }) => {
      addToast(message, 'error');
      sounds.error();
    };
    const onOver = ({ winnerName: name }: { winnerName: string }) => {
      setWinnerName(name);
    };
    const onLeft = ({ message }: { message: string }) => {
      addToast(message, 'info');
    };
    socket.on('gameError', onErr);
    socket.on('gameOver', onOver);
    socket.on('playerLeft', onLeft);
    return () => {
      socket.off('gameError', onErr);
      socket.off('gameOver', onOver);
      socket.off('playerLeft', onLeft);
    };
  }, []);

  // ── Turn change sound + announce ──────────────────────────────────────────
  useEffect(() => {
    if (isMyTurn && !prevIsMyTurnRef.current && gameState.status === 'playing') {
      sounds.turn();
      setShowTurnAnnounce(true);
      setTimeout(() => setShowTurnAnnounce(false), 1600);
    }
    prevIsMyTurnRef.current = isMyTurn;
  }, [isMyTurn, gameState.status]);

  // ── Win / lose sound ──────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState.status === 'finished' && prevStatusRef.current !== 'finished') {
      if (isWinner) sounds.win();
      else sounds.lose();
    }
    prevStatusRef.current = gameState.status;
  }, [gameState.status, isWinner]);

  // ── Draw sound + toast ────────────────────────────────────────────────────
  useEffect(() => {
    const justDrew =
      gameState.canPass &&
      !prevCanPassRef.current &&
      gameState.lastDrawnCardId !== lastDrawnRef.current;

    if (justDrew) {
      sounds.draw();
      const card = gameState.myHand.find(c => c.id === gameState.lastDrawnCardId);
      if (card) {
        addToast(`Você comprou: ${cardLabel(card)}`, 'draw', 2400);
      }
    }
    prevCanPassRef.current = gameState.canPass;
    lastDrawnRef.current = gameState.lastDrawnCardId;
  }, [gameState.canPass, gameState.lastDrawnCardId, gameState.myHand]);

  // ── Penalty sound (when drawing with pendingDraw > 0, it will reset) ─────
  // Detected when pendingDraw goes from >0 to 0 (opponent applied draw)
  // We just play the penalty sound when we receive cards (canPass changes)
  // The draw handler plays the sound contextually based on pendingDraw state.

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCardClick = (card: Card) => {
    if (!isMyTurn) return;
    if (card.type === 'wild' || card.type === 'wildDraw4') {
      sounds.wild();
      setPendingWild(card);
      return;
    }
    if (card.type === 'skip' || card.type === 'reverse') sounds.skip();
    else if (card.type === 'draw2') sounds.penalty();
    else sounds.card();
    socket.emit('playCard', { roomCode: session.roomCode, cardId: card.id });
  };

  const handleColorChosen = (color: Exclude<CardColor, 'wild'>) => {
    if (!pendingWild) return;
    if (pendingWild.type === 'wildDraw4') sounds.penalty();
    else sounds.card();
    socket.emit('playCard', {
      roomCode: session.roomCode,
      cardId: pendingWild.id,
      chosenColor: color,
    });
    setPendingWild(null);
  };

  const handleDraw = () => {
    if (gameState.pendingDraw > 0) sounds.penalty();
    else sounds.draw();
    socket.emit('drawCard', { roomCode: session.roomCode });
  };

  const handlePass = () => {
    sounds.click();
    socket.emit('passTurn', { roomCode: session.roomCode });
  };

  const handleUno = () => {
    sounds.uno();
    socket.emit('sayUno', { roomCode: session.roomCode });
  };

  const handleChallenge = () => {
    sounds.challenge();
    socket.emit('challengeUno', { roomCode: session.roomCode });
  };

  const handleRestart = () => {
    sounds.click();
    socket.emit('restartGame', { roomCode: session.roomCode });
    setWinnerName('');
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="game-page">

      {/* Toasts */}
      {toasts.slice(-1).map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.msg}
        </div>
      ))}

      {/* Turn announcement overlay */}
      {showTurnAnnounce && (
        <div className="turn-announce">Sua vez</div>
      )}

      {/* Opponent area */}
      <OpponentHand opponent={opponent} isOpponentTurn={isOpponentTurn} />

      {/* Center board */}
      <GameBoard
        gameState={gameState}
        isMyTurn={isMyTurn}
        myPlayer={myPlayer}
        canChallenge={canChallenge}
        onDraw={handleDraw}
        onPass={handlePass}
        onUno={handleUno}
        onChallenge={handleChallenge}
      />

      {/* My hand */}
      <Hand
        cards={gameState.myHand}
        isMyTurn={isMyTurn}
        gameState={gameState}
        onPlayCard={handleCardClick}
      />

      {/* Color picker */}
      {pendingWild && (
        <ColorPicker onColorChosen={handleColorChosen} />
      )}

      {/* Win/Lose screen */}
      {isFinished && (
        <WinScreen
          isWinner={isWinner}
          winnerName={winnerName || (isWinner ? session.nickname : opponent?.nickname ?? 'Adversário')}
          isHost={session.isHost}
          onRestart={handleRestart}
          onLeave={onLeave}
        />
      )}
    </div>
  );
}
