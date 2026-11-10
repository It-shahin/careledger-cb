'use client';
import { useState, type FormEvent } from 'react';
import { useWorkspace } from '@/providers/workspace-provider';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
export function ClientsPage() {
  const { data, mutate } = useWorkspace();
  const [open, setOpen] = useState(false),
    [error, setError] = useState(''),
    [search, setSearch] = useState(''),
    [busy, setBusy] = useState(false);
  if (!data) return null;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      await mutate('/clients', Object.fromEntries(new FormData(e.currentTarget)));
      setOpen(false);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (!confirm('Delete this client and their sites, notes, and reports?')) return;
    try {
      await mutate(`/clients/${id}`, undefined, 'DELETE');
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Client sites</h1>
          <p>The websites you look after, and the people behind them.</p>
        </div>
        <Button
          className="primary"
          onClick={() => {
            setError('');
            setOpen(true);
          }}
        >
          + Add client site
        </Button>
      </div>
      <input
        className="search"
        aria-label="Search client sites"
        placeholder="Search sites or clients"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <p className="error" role="alert">
        {!open && error}
      </p>
      <div className="cards">
        {data.sites
          .filter((s) =>
            (s.name + s.url + data.clients.find((c) => c.id === s.clientId)?.name)
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
          .map((s) => (
            <article className="card" key={s.id}>
              <span className="monogram">{s.name[0]}</span>
              <h2>{s.name}</h2>
              <p>{data.clients.find((c) => c.id === s.clientId)?.name}</p>
              <p>{s.url}</p>
              <small>
                {data.entries.filter((e) => e.siteId === s.id).length} recorded activities
              </small>
              <button className="text-button danger" onClick={() => remove(s.clientId)}>
                Delete client
              </button>
            </article>
          ))}
      </div>
      {!data.sites.length && (
        <div className="empty">
          <h2>No client sites yet</h2>
          <p>Add your first client and their website.</p>
        </div>
      )}
      {open && (
        <Dialog title="Add a client site" onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <label>
              Client name
              <input name="name" required maxLength={100} />
            </label>
            <label>
              Contact email
              <input name="contact" type="email" />
            </label>
            <label>
              Website name
              <input name="siteName" required maxLength={100} />
            </label>
            <label>
              Website address
              <input name="url" type="url" required placeholder="https://example.com" />
            </label>
            <p className="error" role="alert">
              {error}
            </p>
            <Button className="primary" disabled={busy}>
              Save client site
            </Button>
          </form>
        </Dialog>
      )}
    </>
  );
}
