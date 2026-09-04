import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`⚡️ CloudDrive Express Server running at http://localhost:${PORT}`);
  console.log(`🔒 Connected to Supabase URL: ${env.SUPABASE_URL}`);
  console.log(`🌐 Allowing CORS for: ${env.FRONTEND_URL}`);
});

process.on('unhandledRejection', (err: any) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err: any) => {
  console.error('Uncaught Exception:', err);
});

export default server;
