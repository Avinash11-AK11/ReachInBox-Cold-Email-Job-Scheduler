import { Router } from 'express';
import multer from 'multer';
import { isAuthenticated } from '../middleware/auth';
import {
  scheduleCampaign,
  getScheduledEmails,
  getSentEmails,
  getStats,
  deleteScheduledEmail,
  parseLeadsFromFile,
} from '../controllers/emailController';

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit
const router = Router();

router.use(isAuthenticated);

router.post('/schedule', upload.single('file'), scheduleCampaign);
router.get('/scheduled', getScheduledEmails);
router.get('/sent', getSentEmails);
router.get('/stats', getStats);
router.delete('/:id', deleteScheduledEmail);
router.post('/parse-leads', upload.single('file'), parseLeadsFromFile);

export default router;
