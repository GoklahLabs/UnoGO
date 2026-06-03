import { io } from 'socket.io-client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL ?? 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnectionAttempts: 5,
});

export default socket;
