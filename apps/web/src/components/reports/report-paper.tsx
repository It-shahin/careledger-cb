import type { Report } from '@careledger/shared';
export function ReportPaper({ report }: { report: Report }) {
  const s = report.snapshot;
  return (
    <article
      className="report-paper"
      style={{ '--report-ink': s.studio.color } as React.CSSProperties}
    >
      <header>
        <span className="monogram" style={{ background: s.studio.color, color: 'white' }}>
          {s.studio.initials}
        </span>
        <div>
          <strong>{s.studio.name}</strong>
          <small>Website care report</small>
        </div>
        <span>{report.period}</span>
      </header>
      {s.demo && <p className="fictional">Fictional demonstration · no actual work performed</p>}
      <h1>{s.site.name}</h1>
      <p>{s.site.url}</p>
      <section>
        <h2>This month, in plain English</h2>
        <p>{report.summary}</p>
      </section>
      <section>
        <h2>The work behind the scenes</h2>
        {s.entries.length ? (
          s.entries.map((e) => (
            <div className="paper-entry" key={e.id}>
              <h3>✓ {e.title}</h3>
              <p>{e.details}</p>
              <small>
                {e.happenedOn} · {e.kind}
                <br />
                Source: {e.evidence}
              </small>
            </div>
          ))
        ) : (
          <p>No maintenance recorded for this period.</p>
        )}
      </section>
      <section>
        <h2>Looking ahead</h2>
        <p>{report.nextSteps || 'No next steps added.'}</p>
      </section>
      <footer>
        Prepared for {s.client.name} by {s.studio.name}. Based on studio-entered records.
      </footer>
    </article>
  );
}
