import {
  clientInput,
  entryInput,
  reportInput,
  studioInput,
  type Workspace,
  type Report,
} from '@careledger/shared';
const key = 'careledger-next-demo-v1';
export const demoCredentials = { email: 'studio@careledger.demo', password: 'CareLedgerDemo2026!' };
function seed(): Workspace {
  const date = new Date().toISOString().slice(0, 10);
  return {
    studio: { name: 'Fieldwork Studio', initials: 'FS', color: '#285647' },
    clients: [
      { id: 'client-1', name: 'Fern & Form', contact: 'hello@fern-and-form.example' },
      { id: 'client-2', name: 'Northline Coffee', contact: 'hello@northline.example' },
      { id: 'client-3', name: 'Atelier June', contact: 'hello@atelier-june.example' },
    ],
    sites: [
      {
        id: 'site-1',
        clientId: 'client-1',
        name: 'Fern & Form Studio',
        url: 'https://fern-and-form.example',
      },
      {
        id: 'site-2',
        clientId: 'client-2',
        name: 'Northline Coffee',
        url: 'https://northline.example',
      },
      {
        id: 'site-3',
        clientId: 'client-3',
        name: 'Atelier June',
        url: 'https://atelier-june.example',
      },
    ],
    entries: [
      {
        id: 'entry-1',
        siteId: 'site-1',
        title: 'Tested the enquiry form',
        details: 'Submitted a fictional enquiry and checked its receipt in the demo scenario.',
        evidence: 'Fictional manual test note',
        kind: 'Check',
        happenedOn: date,
      },
      {
        id: 'entry-2',
        siteId: 'site-1',
        title: 'Updated the site plugins',
        details: 'Updated the contact-form and image plugins in a fictional staging environment.',
        evidence: 'Fictional staging checklist',
        kind: 'Update',
        happenedOn: date,
      },
      {
        id: 'entry-3',
        siteId: 'site-1',
        title: 'Recorded a backup',
        details: 'Recorded a fictional provider completion log. A restore test was not performed.',
        evidence: 'Fictional completion log',
        kind: 'Backup',
        happenedOn: date,
      },
      {
        id: 'entry-4',
        siteId: 'site-2',
        title: 'Corrected the opening hours',
        details: 'Updated the footer and checked the mobile layout in the demo scenario.',
        evidence: 'Fictional client request',
        kind: 'Fix',
        happenedOn: date,
      },
    ],
    reports: [],
  };
}
export function demoRequest(path: string, body?: unknown, method = 'GET'): unknown {
  let db: Workspace;
  try {
    db = JSON.parse(localStorage.getItem(key) || 'null') || seed();
  } catch {
    db = seed();
  }
  const save = () => localStorage.setItem(key, JSON.stringify(db));
  if (path === '/workspace') {
    save();
    return db;
  }
  if (path === '/reset') {
    db = seed();
    save();
    return db;
  }
  if (path === '/clients' && method === 'POST') {
    const data = clientInput.parse(body);
    const id = crypto.randomUUID();
    db.clients.push({ id, name: data.name, contact: data.contact });
    db.sites.push({ id: crypto.randomUUID(), clientId: id, name: data.siteName, url: data.url });
  } else if (path === '/entries' && method === 'POST') {
    const data = entryInput.parse(body);
    if (!db.sites.some((s) => s.id === data.siteId)) throw new Error('Site not found.');
    db.entries.unshift({ id: crypto.randomUUID(), ...data });
  } else if (path === '/reports' && method === 'POST') {
    const data = reportInput.parse(body);
    const site = db.sites.find((s) => s.id === data.siteId);
    if (!site) throw new Error('Site not found.');
    const client = db.clients.find((c) => c.id === site.clientId)!;
    db.reports.unshift({
      id: crypto.randomUUID(),
      ...data,
      status: 'draft',
      snapshot: structuredClone({
        studio: db.studio,
        site,
        client,
        entries: db.entries.filter(
          (e) => e.siteId === site.id && e.happenedOn.startsWith(data.period),
        ),
        demo: true,
      }),
    });
  } else if (path.endsWith('/review')) {
    const report = db.reports.find((r) => r.id === path.split('/')[2]);
    if (!report || report.status !== 'draft' || (body as { confirm?: boolean })?.confirm !== true)
      throw new Error('Confirm review of a draft.');
    report.status = 'reviewed';
  } else if (path === '/studio') {
    db.studio = studioInput.parse(body);
  } else if (path.startsWith('/entries/') && method === 'DELETE') {
    db.entries = db.entries.filter((e) => e.id !== path.split('/')[2]);
  } else if (path.startsWith('/clients/') && method === 'DELETE') {
    const id = path.split('/')[2];
    const ids = db.sites.filter((s) => s.clientId === id).map((s) => s.id);
    db.clients = db.clients.filter((c) => c.id !== id);
    db.sites = db.sites.filter((s) => !ids.includes(s.id));
    db.entries = db.entries.filter((e) => !ids.includes(e.siteId));
    db.reports = db.reports.filter((r) => !ids.includes(r.siteId));
  } else throw new Error('Unknown demo action.');
  save();
  return { ok: true };
}
