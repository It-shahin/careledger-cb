import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ZodError } from 'zod';
import { authRouter } from './routes/auth.js';
import { workspaceRouter } from './routes/workspace.js';
import { requireSession } from './middleware/auth.js';
export const app = express();
const origin = process.env.WEB_ORIGIN || 'http://localhost:3000';
app.use(
  helmet(),
  cors({ origin, credentials: true }),
  express.json({ limit: '100kb' }),
  cookieParser(),
);
app.use((req, res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('origin') !== origin) {
    res.status(403).json({ error: 'Untrusted request origin.' });
    return;
  }
  next();
});
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api', requireSession, workspaceRouter);
app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));
app.use(
  (error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.issues[0]?.message || 'Invalid input.' });
      return;
    }
    const code = (error as { code?: string }).code;
    if (code === 'P2025') {
      res.status(404).json({ error: 'Record not found.' });
      return;
    }
    if (code === 'P2003') {
      res.status(400).json({ error: 'Choose an existing client site.' });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'The request could not be completed.' });
  },
);
