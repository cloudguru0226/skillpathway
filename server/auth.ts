import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { db } from './db.js';
import { comparePasswords } from './utils.js';

const pgSession = connectPgSimple(session);

// Setup local strategy
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await db.getUserByUsername(username);
      if (!user) return done(null, false, { message: 'Incorrect username.' });

      const isMatch = await comparePasswords(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password.' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.getUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export function setupAuth(app, pgPool) {
  app.use(session({
    store: new pgSession({
      pool: pgPool,
      tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,  // ✅ Use HTTPS + secure: true in production
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000  // 1 week
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Login failed' });
      }

      req.logIn(user, (err) => {
        if (err) return next(err);

        // Ensure session is saved before responding
        req.session.save((err) => {
          if (err) return next(err);
          console.log('✅ Session saved for user:', user.username);

          res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            is_admin: user.is_admin
          });
        });
      });
    })(req, res, next);
  });

  app.post('/api/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy(() => {
        res.json({ message: 'Logged out successfully' });
      });
    });
  });
}
