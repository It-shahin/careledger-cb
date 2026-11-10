'use client';
import Link from 'next/link';
import { useWorkspace } from '@/providers/workspace-provider';
export function OverviewPage() {
  const { data } = useWorkspace();
  if (!data) return null;
  const month = new Date().toISOString().slice(0, 7),
    entries = data.entries.filter((e) => e.happenedOn.startsWith(month));
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Your work deserves to be seen</h1>
          <p>A little care, a clear record, a report worth sending.</p>
        </div>
        <Link className="button primary" href="/maintenance">
          + Log maintenance
        </Link>
      </div>
      <div className="overview-grid">
        <section>
          <h2>{new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h2>
          <div className="stats">
            {[
              ['Client sites', data.sites.length],
              ['Care activities', entries.length],
              ['Reports reviewed', data.reports.filter((r) => r.status === 'reviewed').length],
            ].map(([label, value]) => (
              <div key={label}>
                <small>{label}</small>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="section-heading">
            <h2>Your client sites</h2>
            <Link href="/clients">View all →</Link>
          </div>
          {data.sites.length ? (
            data.sites.map((s) => (
              <div className="list-row" key={s.id}>
                <span className="monogram">{s.name[0]}</span>
                <div>
                  <h3>{s.name}</h3>
                  <p>{s.url}</p>
                </div>
                <Link href="/reports">Compose →</Link>
              </div>
            ))
          ) : (
            <div className="empty">
              <h3>Your first client starts here</h3>
              <p>Add a site, then record the work you perform.</p>
              <Link className="button primary" href="/clients">
                Add client site
              </Link>
            </div>
          )}
          <h2 className="section-title">Recent care</h2>
          {entries.slice(0, 5).map((e) => (
            <div className="list-row" key={e.id}>
              <span className="tick">✓</span>
              <div>
                <h3>{e.title}</h3>
                <p>
                  {data.sites.find((s) => s.id === e.siteId)?.name} · {e.happenedOn}
                </p>
              </div>
            </div>
          ))}
          {!entries.length && <p>No maintenance recorded this month.</p>}
        </section>
        <aside className="editorial">
          <span className="mark">C</span>
          <h2>
            From care notes
            <br />
            to client confidence.
          </h2>
          <p>
            Keep a record of the work. Explain what mattered. Give your client a monthly report they
            can understand.
          </p>
          <Link className="button" href="/reports">
            Compose a report →
          </Link>
        </aside>
      </div>
    </>
  );
}
