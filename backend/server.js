import 'dotenv/config';
import { logger }          from './src/utils/logger.js';
import { connectDB }       from './src/config/database.js';
import { seedAdminIfEmpty } from './src/services/authService.js';
import app                 from './src/app.js';

const PORT    = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ── Startup validation ────────────────────────────────────────────────────
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  logger.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// ── Start server ──────────────────────────────────────────────────────────
async function startServer() {
  try {
    await connectDB();

    // Seed first admin user if DB is empty
    const seeded = await seedAdminIfEmpty();
    if (seeded) {
      logger.warn(`🌱 Seeded default admin: ${seeded.email} — CHANGE THIS PASSWORD IMMEDIATELY`);
    }

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
      logger.info(`   Health: http://localhost:${PORT}/api/v1/health`);
    });

    // ── Graceful shutdown ─────────────────────────────────────────────────
    function shutdown(signal) {
      logger.warn(`${signal} received — shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
