import type { RequestHandler } from 'express';
import { prisma } from '../lib/prisma.js';
import { sessionHash } from '../lib/password.js';
export const requireSession: RequestHandler = async (req, res, next) => {
  const token = req.cookies.session;
  const session = token && (await prisma.session.findUnique({ where: { id: sessionHash(token) } }));
  if (!session || session.expiresAt < new Date()) {
    res.status(401).json({ error: 'Please sign in.' });
    return;
  }
  next();
};
