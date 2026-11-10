import { prisma } from '../lib/prisma.js';
export async function getWorkspace() {
  const [studio, clients, sites, entries, reports] = await Promise.all([
    prisma.studio.upsert({ where: { id: 'studio' }, create: { id: 'studio' }, update: {} }),
    prisma.client.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.site.findMany(),
    prisma.entry.findMany({ orderBy: { happenedOn: 'desc' } }),
    prisma.report.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);
  return { studio, clients, sites, entries, reports };
}
