import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { sessionHash, verifyPassword } from '../lib/password.js';
export const authRouter = Router();
const cookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};
authRouter.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 }), async (req, res) => {
  const { email, password } = z
    .object({ email: z.email(), password: z.string().min(1).max(200) })
    .parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: 'Email or password is incorrect.' });
    return;
  }
  const token = randomBytes(32).toString('hex');
  await prisma.session.create({
    data: { id: sessionHash(token), userId: user.id, expiresAt: new Date(Date.now() + 86400000) },
  });
  res.cookie('session', token, { ...cookie, maxAge: 86400000 }).json({ ok: true });
});
authRouter.post('/logout', async (req, res) => {
  if (req.cookies.session)
    await prisma.session.deleteMany({ where: { id: sessionHash(req.cookies.session) } });
  res.clearCookie('session', cookie).json({ ok: true });
});
