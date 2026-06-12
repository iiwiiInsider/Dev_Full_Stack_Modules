import express from 'express';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import authRouter from './web/auth.js';
import appRouter from './web/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Security & perf
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
  "img-src": ["'self'", 'data:', 'blob:', 'https://*.microsoft.com', 'https://graph.microsoft.com'],
  "script-src": ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
  "connect-src": ["'self'", 'https://graph.microsoft.com', 'https://cdn.jsdelivr.net']
    }
  }
}));
app.use(compression());
app.use(morgan('dev'));
app.set('trust proxy', 1);

// Sessions
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Basic rate limiting for API routes
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(['/api', '/auth'], limiter);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Static
app.use('/static', express.static(path.join(__dirname, '..', 'public')));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/', authRouter);
app.use('/', appRouter);

// Config helper route
app.get('/config', (req, res) => {
  res.render('config', {
    title: 'Configure Microsoft Sign-in',
    authed: Boolean(req.session.tokens?.access_token),
    config: {
      tenant: process.env.AZURE_TENANT || 'common',
      clientId: Boolean(process.env.AZURE_CLIENT_ID),
      clientSecret: Boolean(process.env.AZURE_CLIENT_SECRET),
      redirectUri: process.env.AZURE_REDIRECT_URI || 'http://localhost:3000/auth/callback',
      scopes: process.env.AZURE_SCOPES || 'offline_access Files.Read'
    }
  });
});

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Not Found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
