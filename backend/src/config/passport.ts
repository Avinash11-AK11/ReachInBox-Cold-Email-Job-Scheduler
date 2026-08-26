import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './database';

export function configurePassport() {
  const clientID = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret';
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback';

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${googleId}@google.com`;
          const name = profile.displayName || profile.name?.givenName || 'Google User';
          const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

          let user = await prisma.user.findUnique({
            where: { googleId },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                googleId,
                email,
                name,
                avatar,
              },
            });
          } else {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { name, avatar: user.avatar || avatar, email },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}
