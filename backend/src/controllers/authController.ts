import { Request, Response } from 'express';
import prisma from '../config/database';

export async function getMe(req: Request, res: Response) {
  if (req.user) {
    return res.json({
      success: true,
      user: req.user,
    });
  }

  // Fallback dev user
  let devUser = await prisma.user.findFirst({
    where: { email: 'demo.user@reachinbox.ai' },
  });

  if (!devUser) {
    devUser = await prisma.user.create({
      data: {
        googleId: 'dev-google-id-12345',
        email: 'demo.user@reachinbox.ai',
        name: 'ReachInbox Demo User',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
    });
  }

  return res.json({
    success: true,
    user: devUser,
  });
}

export function logout(req: Request, res: Response) {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.json({ success: true, message: 'Logged out successfully' });
    });
  });
}

export async function devLogin(req: Request, res: Response) {
  let devUser = await prisma.user.findFirst({
    where: { email: 'demo.user@reachinbox.ai' },
  });

  if (!devUser) {
    devUser = await prisma.user.create({
      data: {
        googleId: 'dev-google-id-12345',
        email: 'demo.user@reachinbox.ai',
        name: 'ReachInbox Demo User',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
    });
  }

  req.login(devUser, (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Login error' });
    }
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/dashboard`);
  });
}
