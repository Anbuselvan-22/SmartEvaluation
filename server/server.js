const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  logger.info(`Smart Evaluation server started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API Health Check: http://localhost:${PORT}/health`);
});
