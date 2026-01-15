import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  return socket;
};

export const connectSocket = () => {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const joinEvent = (eventId: string) => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('joinEvent', eventId);
  }
};

export const onNewMedia = (callback: (media: any) => void) => {
  const socket = getSocket();
  socket.on('newMedia', callback);
};

export const onMediaApproved = (callback: (media: any) => void) => {
  const socket = getSocket();
  socket.on('mediaApproved', callback);
};

export const offNewMedia = () => {
  const socket = getSocket();
  socket.off('newMedia');
};

export const offMediaApproved = () => {
  const socket = getSocket();
  socket.off('mediaApproved');
};
