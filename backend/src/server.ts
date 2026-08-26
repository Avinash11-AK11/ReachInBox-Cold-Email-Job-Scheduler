import app from './app';
import { getEtherealTransporter } from './config/ethereal';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Pre-warm Ethereal SMTP transporter
    await getEtherealTransporter();

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
