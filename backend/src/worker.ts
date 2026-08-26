import dotenv from 'dotenv';
dotenv.config();

import { startEmailWorker } from './queues/emailWorker';

console.log('⚡ Initializing ReachInbox BullMQ Email Worker Process...');
startEmailWorker();
