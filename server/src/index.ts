import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { registerSocketHandlers } from './socketHandlers.js';
import { cleanupStaleRooms } from './roomManager.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

registerSocketHandlers(io);

// Cleanup stale rooms every 30 minutes
setInterval(cleanupStaleRooms, 30 * 60 * 1000);

httpServer.listen(PORT, () => {
  console.log(`Bingo server running on port ${PORT}`);
});
