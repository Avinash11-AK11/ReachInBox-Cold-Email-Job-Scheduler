import app from './app';
import { getEtherealTransporter } from './config/ethereal';
import { startEmailWorker } from './queues/emailWorker';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await getEtherealTransporter();

    if (process.env.START_WORKER !== 'false') {
      console.log('⚡ Starting BullMQ Email Worker in background...');
      startEmailWorker();
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 ReachInbox Backend API Server running on port ${PORT}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
