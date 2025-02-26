import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server);

  io.on('connection', (socket) => {
    console.log('A guest connected');

    socket.on('joinEvent', (eventId) => {
      socket.join(eventId);
      console.log(`Guest joined event: ${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log('A guest disconnected');
    });
  });
};

export const getIO = () => io;