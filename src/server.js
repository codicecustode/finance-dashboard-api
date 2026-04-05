import app from './app.js';
import  database  from './config/database.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await database.connectDB();
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`API Docs: http://localhost:${PORT}/api/docs`);
      logger.info(`Health:   http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        
        await database.disconnectDB();
        logger.info('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

start();
