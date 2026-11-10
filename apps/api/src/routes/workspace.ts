import { Router } from 'express';
import { z } from 'zod';
import { clientInput, entryInput, reportInput, studioInput } from '@careledger/shared';
import { prisma } from '../lib/prisma.js';
import { getWorkspace } from '../services/workspace.js';
export const workspaceRouter = Router();
workspaceRouter.get('/workspace', async (_req, res) => {
  res.json(await getWorkspace());
});
workspaceRouter.post('/clients', async (req, res) => {
  const { name, contact, siteName, url } = clientInput.parse(req.body);
  res.status(201).json(
    await prisma.client.create({
      data: { name, contact, sites: { create: { name: siteName, url } } },
    }),
  );
});
workspaceRouter.delete('/clients/:id', async (req, res) => {
  await prisma.client.delete({ where: { id: String(req.params.id) } });
  res.json({ ok: true });
});
workspaceRouter.post('/entries', async (req, res) => {
  res.status(201).json(await prisma.entry.create({ data: entryInput.parse(req.body) }));
});
workspaceRouter.delete('/entries/:id', async (req, res) => {
  await prisma.entry.delete({ where: { id: String(req.params.id) } });
  res.json({ ok: true });
});
workspaceRouter.post('/reports', async (req, res) => {
  const data = reportInput.parse(req.body);
  const site = await prisma.site.findUniqueOrThrow({
    where: { id: data.siteId },
    include: { client: true },
  });
  const studio = await prisma.studio.findUniqueOrThrow({ where: { id: 'studio' } });
  const entries = await prisma.entry.findMany({
    where: { siteId: site.id, happenedOn: { startsWith: data.period } },
    orderBy: { happenedOn: 'asc' },
  });
  const snapshot = JSON.parse(
    JSON.stringify({ studio, client: site.client, site, entries, demo: false }),
  );
  res.status(201).json(await prisma.report.create({ data: { ...data, snapshot } }));
});
workspaceRouter.post('/reports/:id/review', async (req, res) => {
  z.object({ confirm: z.literal(true) }).parse(req.body);
  const result = await prisma.report.updateMany({
    where: { id: String(req.params.id), status: 'draft' },
    data: { status: 'reviewed' },
  });
  if (!result.count) {
    res.status(409).json({ error: 'Only a draft can be reviewed.' });
    return;
  }
  res.json({ ok: true });
});
workspaceRouter.put('/studio', async (req, res) => {
  res.json(
    await prisma.studio.update({ where: { id: 'studio' }, data: studioInput.parse(req.body) }),
  );
});
