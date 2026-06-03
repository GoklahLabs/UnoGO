import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import * as room from './roomManager';
import * as game from './gameManager';
import { CardColor } from './types';

// ──────────────────────────────────────────────────────────────────────────────
// Setup
// ──────────────────────────────────────────────────────────────────────────────

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const PORT = process.env.PORT || 3001;

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Send personalised game state to every player in a room */
function broadcastState(roomCode: string): void {
  const r = room.getRoom(roomCode);
  if (!r) return;
  for (const player of r.gameState.players) {
    const state = game.getPublicState(r.gameState, player.id);
    io.to(player.id).emit('gameState', state);
  }
}

function err(socket: Socket, message: string): void {
  socket.emit('gameError', { message });
}

// ──────────────────────────────────────────────────────────────────────────────
// Socket handlers
// ──────────────────────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[+] ${socket.id} connected`);

  // ─── Create room ───────────────────────────────────────────────────────────
  socket.on('createRoom', ({ nickname }: { nickname: string }) => {
    if (!nickname?.trim()) { err(socket, 'Informe um nickname'); return; }

    const r = room.createRoom(socket.id, nickname.trim());
    socket.join(r.code);

    socket.emit('roomJoined', {
      roomCode: r.code,
      playerId: socket.id,
      isHost: true,
    });

    broadcastState(r.code);
  });

  // ─── Join room ─────────────────────────────────────────────────────────────
  socket.on('joinRoom', ({ code, nickname }: { code: string; nickname: string }) => {
    if (!nickname?.trim() || !code?.trim()) { err(socket, 'Dados inválidos'); return; }

    const r = room.joinRoom(code.trim(), socket.id, nickname.trim());
    if (!r) { err(socket, 'Sala não encontrada, cheia ou partida em andamento'); return; }

    socket.join(r.code);

    socket.emit('roomJoined', {
      roomCode: r.code,
      playerId: socket.id,
      isHost: false,
    });

    broadcastState(r.code);
  });

  // ─── Start game ────────────────────────────────────────────────────────────
  socket.on('startGame', ({ roomCode }: { roomCode: string }) => {
    const r = room.getRoom(roomCode);
    if (!r) { err(socket, 'Sala não encontrada'); return; }
    if (r.hostId !== socket.id) { err(socket, 'Apenas o host pode iniciar'); return; }
    if (r.gameState.players.length < 2) { err(socket, 'Aguardando o segundo jogador'); return; }
    if (r.gameState.status === 'playing') { err(socket, 'Partida já em andamento'); return; }

    game.startGame(r);
    broadcastState(r.code);
  });

  // ─── Play card ─────────────────────────────────────────────────────────────
  socket.on(
    'playCard',
    ({ roomCode, cardId, chosenColor }: { roomCode: string; cardId: string; chosenColor?: CardColor }) => {
      const r = room.getRoom(roomCode);
      if (!r || r.gameState.status !== 'playing') { err(socket, 'Partida inativa'); return; }

      const error = game.playCard(r, socket.id, cardId, chosenColor);
      if (error) { err(socket, error); return; }

      const winner = game.checkWinner(r);
      if (winner) {
        r.gameState.status = 'finished';
        r.gameState.winner = winner.id;
        broadcastState(r.code);
        io.to(r.code).emit('gameOver', { winnerId: winner.id, winnerName: winner.nickname });
        return;
      }

      broadcastState(r.code);
    },
  );

  // ─── Draw card ─────────────────────────────────────────────────────────────
  socket.on('drawCard', ({ roomCode }: { roomCode: string }) => {
    const r = room.getRoom(roomCode);
    if (!r || r.gameState.status !== 'playing') { err(socket, 'Partida inativa'); return; }

    const error = game.drawCard(r, socket.id);
    if (error) { err(socket, error); return; }

    broadcastState(r.code);
  });

  // ─── Pass turn ─────────────────────────────────────────────────────────────
  socket.on('passTurn', ({ roomCode }: { roomCode: string }) => {
    const r = room.getRoom(roomCode);
    if (!r || r.gameState.status !== 'playing') return;

    const error = game.passTurn(r, socket.id);
    if (error) { err(socket, error); return; }

    broadcastState(r.code);
  });

  // ─── Say UNO ───────────────────────────────────────────────────────────────
  socket.on('sayUno', ({ roomCode }: { roomCode: string }) => {
    const r = room.getRoom(roomCode);
    if (!r) return;
    game.sayUno(r, socket.id);
    broadcastState(r.code);
  });

  // ─── Challenge UNO ─────────────────────────────────────────────────────────
  socket.on('challengeUno', ({ roomCode }: { roomCode: string }) => {
    const r = room.getRoom(roomCode);
    if (!r) return;
    const error = game.challengeUno(r, socket.id);
    if (error) err(socket, error);
    broadcastState(r.code);
  });

  // ─── Restart game ──────────────────────────────────────────────────────────
  socket.on('restartGame', ({ roomCode }: { roomCode: string }) => {
    const r = room.getRoom(roomCode);
    if (!r) return;
    if (r.hostId !== socket.id) { err(socket, 'Apenas o host pode reiniciar'); return; }

    game.resetGame(r);
    broadcastState(r.code);
  });

  // ─── Disconnect ────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`[-] ${socket.id} disconnected`);
    const r = room.removePlayer(socket.id);
    if (!r) return;

    // If game was in progress, reset to waiting
    if (r.gameState.status === 'playing') {
      game.resetGame(r);
      io.to(r.code).emit('playerLeft', { message: 'O adversário desconectou. Aguardando reconexão...' });
    }

    broadcastState(r.code);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Health check
// ──────────────────────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok' }));

httpServer.listen(PORT, () => {
  console.log(`🚀 Color Clash server listening on http://localhost:${PORT}`);
});
