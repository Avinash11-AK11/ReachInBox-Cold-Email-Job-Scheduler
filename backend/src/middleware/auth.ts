import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }

  if (process.env.NODE_ENV === 'development' || !process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your-google-client-id') {
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

    req.user = devUser;
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Unauthorized. Please login via Google OAuth.',
  });
}
