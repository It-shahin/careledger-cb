import 'dotenv/config';
import { prisma } from '../src/lib/prisma.js';
import { hashPassword } from '../src/lib/password.js';
const email = process.env.SEED_EMAIL?.toLowerCase();
const password = process.env.SEED_PASSWORD;
if (!email || !password || password.length < 12)
  throw new Error('Set SEED_EMAIL and SEED_PASSWORD (at least 12 characters).');
try {
  await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash: hashPassword(password) },
    update: {},
  });
  await prisma.studio.upsert({ where: { id: 'studio' }, create: { id: 'studio' }, update: {} });
  console.log('Studio user ready. Existing passwords were not changed.');
} finally {
  await prisma.$disconnect();
}
