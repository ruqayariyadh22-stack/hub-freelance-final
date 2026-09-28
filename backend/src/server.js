import http from 'node:http';
import { Server } from 'socket.io';
import app from './app.js';
import { env } from './config/env.js';
import { attachChatSocket } from './modules/workspace/chat/chatSocket.js';

const startServer = async () => {
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
    },
  });

  attachChatSocket(io);

  httpServer.listen(env.port, () => {
    console.log(`Hub Freelance API listening on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
