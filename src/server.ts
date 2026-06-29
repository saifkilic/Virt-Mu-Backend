import dotenv from 'dotenv';
// Load environment variables before importing other modules
dotenv.config();

import app from './app';
import { connectDB } from './config/db';
// // import { connectRedis } from './config/redis.js'; // Paused for now

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to databases
  await connectDB();
  // await connectRedis(); // Paused for now

  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Handle unexpected code crashes (Crucial Safety Net)
  process.on('unhandledRejection', (err: any) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
    // Close server completely & exit process so your process manager (like PM2/Render) can auto-restart it cleanly
    server.close(() => process.exit(1));
  });

  // Handle Cloud platform shutdown signals (Graceful Exit)
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Process terminated safely.');
    });
  });
};

startServer();