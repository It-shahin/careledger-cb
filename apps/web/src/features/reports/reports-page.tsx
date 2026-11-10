'use client';
import { useState, type FormEvent } from 'react';
import { useWorkspace } from '@/providers/workspace-provider';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReportPaper } from '@/components/reports/report-paper';
export function ReportsPage() {
  const { data, mutate } = useWorkspace();
  const [compose, setCompose] = useState(false),
    [selected, setSelected] = useState<string | null>(null),
    [confirmed, setConfirmed] = useState(false),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  if (!data) return null;
  const report = data.reports.find((r) => r.id === selected);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      await mutate('/reports', Object.fromEntries(new FormData(e.currentTarget)));
      setCompose(false);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function review() {
    setBusy(true);
    try {
      await mutate(`/reports/${selected}/review`, { confirm: confirmed });
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading no-print">
        <div>
          <h1>Client reports</h1>
          <p>Compose, review, and save a report for your client.</p>
        </div>
        <Button
          className="primary"
          disabled={!data.sites.length}
          onClick={() => {
            setError('');
            setCompose(true);
          }}
        >
          + Compose report
        </Button>
      </div>
      <p className="error no-print" role="alert">
        {!compose && error}
      </p>
      {report ? (
        <>
          <div className="report-actions no-print">
            <button className="text-button" onClick={() => setSelected(null)}>
              ← Back to reports
            </button>
            {report.status === 'draft' ? (
              <div>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                  I reviewed the report and its claims.
                </label>
                <Button disabled={!confirmed || busy} className="primary" onClick={review}>
                  Mark reviewed
                </Button>
              </div>
            ) : (
              <Button className="primary" onClick={() => window.print()}>
                Print / save as PDF
              </Button>
            )}
          </div>
          <ReportPaper report={report} />
        </>
      ) : (
        <>
          <div className="report-list">
            {data.reports.map((r) => (
              <button
                className="list-row"
                key={r.id}
                onClick={() => {
                  setSelected(r.id);
                  setConfirmed(false);
                  setError('');
                }}
              >
                <div>
                  <h2>{r.snapshot.site.name}</h2>
                  <p>
                    {r.period} · {r.summary.slice(0, 100)}
                  </p>
                </div>
                <span className="tag">{r.status}</span>
                <span>Open →</span>
              </button>
            ))}
          </div>
          {!data.reports.length && (
            <div className="empty">
              <h2>The first report is a few notes away</h2>
              <p>
                {data.sites.length
                  ? 'Choose a site and month, then write a summary.'
                  : 'Add a client site to start your first report.'}
              </p>
            </div>
          )}
        </>
      )}
      {compose && (
        <Dialog title="Compose a monthly report" onClose={() => setCompose(false)}>
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
            <label>
              Report month
              <input
                name="period"
                type="month"
                defaultValue={new Date().toISOString().slice(0, 7)}
                required
              />
            </label>
            <label>
              Monthly summary
              <textarea
                name="summary"
                required
                maxLength={2000}
                placeholder="Explain what mattered to your client this month"
              />
            </label>
            <label>
              Looking ahead
              <textarea name="nextSteps" maxLength={2000} />
            </label>
            <small>
              The draft captures a snapshot of the saved notes and studio branding for this month.
            </small>
            <p className="error" role="alert">
              {error}
            </p>
            <Button className="primary" disabled={busy}>
              Save draft
            </Button>
          </form>
        </Dialog>
      )}
    </>
  );
}
