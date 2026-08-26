import { Router } from 'express';
import passport from 'passport';
import { getMe, logout, devLogin } from '../controllers/authController';

const router = Router();

router.get('/me', getMe);
router.post('/logout', logout);
router.get('/dev-login', devLogin);

// Google OAuth endpoints
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed` }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`);
  }
);

export default router;
