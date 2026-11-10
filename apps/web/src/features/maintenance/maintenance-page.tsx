'use client';
import { useState, type FormEvent } from 'react';
import { useWorkspace } from '@/providers/workspace-provider';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
export function MaintenancePage() {
  const { data, mutate } = useWorkspace();
  const [open, setOpen] = useState(false),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  if (!data) return null;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      await mutate('/entries', Object.fromEntries(new FormData(e.currentTarget)));
      setOpen(false);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (!confirm('Remove this activity? Saved report snapshots keep their copy.')) return;
    try {
      await mutate(`/entries/${id}`, undefined, 'DELETE');
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const entries = data.entries.filter((e) => e.happenedOn.startsWith(month));
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Maintenance log</h1>
          <p>A dated record of the work behind every report.</p>
        </div>
        <Button
          className="primary"
          disabled={!data.sites.length}
          onClick={() => {
            setError('');
            setOpen(true);
          }}
        >
          + Log maintenance
        </Button>
      </div>
      <label className="month-filter">
        Period
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </label>
      <p className="error" role="alert">
        {!open && error}
      </p>
      {entries.map((e) => (
        <article className="activity" key={e.id}>
          <div className="activity-date">
            {e.happenedOn}
            <span className="tag">{e.kind}</span>
          </div>
          <div>
            <h2>{e.title}</h2>
            <p>{e.details}</p>
            <small>
              {data.sites.find((s) => s.id === e.siteId)?.name} · Source: {e.evidence}
            </small>
          </div>
          <button className="text-button danger" onClick={() => remove(e.id)}>
            Remove
          </button>
        </article>
      ))}
      {!entries.length && (
        <div className="empty">
          <h2>No work recorded for this month</h2>
          <p>
            {data.sites.length
              ? 'Record the maintenance you performed.'
              : 'Add a client site before logging maintenance.'}
          </p>
        </div>
      )}
      {open && (
        <Dialog title="Log maintenance" onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <label>
              Client site
              <select name="siteId">
                {data.sites.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-row">
              <label>
                Type
                <select name="kind">
                  {['Update', 'Backup', 'Check', 'Fix', 'Other'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label>
                Date
                <input
                  type="date"
                  name="happenedOn"
                  required
                  max={new Date().toISOString().slice(0, 10)}
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </label>
            </div>
            <label>
              Activity title
              <input name="title" required maxLength={160} />
            </label>
            <label>
              What did you do?
              <textarea name="details" required maxLength={2000} />
            </label>
            <label>
              Evidence or source
              <input name="evidence" required maxLength={500} />
            </label>
            <p className="error" role="alert">
              {error}
            </p>
            <Button className="primary" disabled={busy}>
              Save activity
            </Button>
          </form>
        </Dialog>
      )}
    </>
  );
}
