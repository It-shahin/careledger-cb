import 'dotenv/config';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
test('authenticated PostgreSQL workflow preserves a reviewed report snapshot', async () => {
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address() as { port: number };
  const base = `http://127.0.0.1:${address.port}/api`;
  let cookie = '',
    clientId = '';
  async function call(path: string, body?: unknown, method = body ? 'POST' : 'GET') {
    const response = await fetch(base + path, {
      method,
      headers: {
        Origin: process.env.WEB_ORIGIN || 'http://localhost:3000',
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const set = response.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    return { status: response.status, body: await response.json() };
  }
  try {
    assert.equal((await call('/workspace')).status, 401);
    assert.equal(
      (await call('/auth/login', { email: process.env.SEED_EMAIL, password: 'incorrect' })).status,
      401,
    );
    assert.equal(
      (
        await call('/auth/login', {
          email: process.env.SEED_EMAIL,
          password: process.env.SEED_PASSWORD,
        })
      ).status,
      200,
    );
    const client = await call('/clients', {
      name: 'Integration client',
      contact: '',
      siteName: 'Integration site',
      url: 'https://example.com',
    });
    assert.equal(client.status, 201);
    clientId = client.body.id;
    const state = (await call('/workspace')).body;
    const siteId = state.sites.find((s: { clientId: string }) => s.clientId === clientId).id;
    const date = new Date().toISOString().slice(0, 10);
    const entry = await call('/entries', {
      siteId,
      title: 'Checked contact form',
      details: 'Confirmed receipt',
      evidence: 'Test ticket',
      kind: 'Check',
      happenedOn: date,
    });
    assert.equal(entry.status, 201);
    const report = await call('/reports', {
      siteId,
      period: date.slice(0, 7),
      summary: 'Contact form checked.',
      nextSteps: 'Review next month.',
    });
    assert.equal(report.status, 201);
    assert.equal((await call(`/reports/${report.body.id}/review`, { confirm: false })).status, 400);
    assert.equal((await call(`/reports/${report.body.id}/review`, { confirm: true })).status, 200);
    assert.equal((await call(`/reports/${report.body.id}/review`, { confirm: true })).status, 409);
    await call(`/entries/${entry.body.id}`, undefined, 'DELETE');
    const saved = (await call('/workspace')).body.reports.find(
      (r: { id: string }) => r.id === report.body.id,
    );
    assert.equal(saved.snapshot.entries.length, 1);
    assert.equal(saved.status, 'reviewed');
    await call('/auth/logout', {});
    assert.equal((await call('/workspace')).status, 401);
  } finally {
    if (clientId) await prisma.client.deleteMany({ where: { id: clientId } });
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await prisma.$disconnect();
  }
});
