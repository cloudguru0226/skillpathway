import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { db } from './db.js';
import { comparePasswords } from './utils.js';

const pgSession = connectPgSimple(session);

// LocalStrategy for login
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
      secure: false,  // ✅ THIS IS THE FIX
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      is_admin: req.user.is_admin
    });
  });

  app.post('/api/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });
}
