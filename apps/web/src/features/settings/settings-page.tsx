'use client';
import { useState, type FormEvent } from 'react';
import { useWorkspace } from '@/providers/workspace-provider';
import { isDemo } from '@/lib/api';
import { Button } from '@/components/ui/button';
export function SettingsPage() {
  const { data, mutate } = useWorkspace();
  const [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  if (!data) return null;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      await mutate('/studio', Object.fromEntries(new FormData(e.currentTarget)), 'PUT');
      setMessage('Studio settings saved.');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Your studio</h1>
          <p>The details behind every client report.</p>
        </div>
      </div>
      <form className="settings-form" onSubmit={submit}>
        <label>
          Studio name
          <input name="name" defaultValue={data.studio.name} required maxLength={100} />
        </label>
        <div className="form-row">
          <label>
            Monogram
            <input name="initials" defaultValue={data.studio.initials} maxLength={4} required />
          </label>
          <label>
            Report ink
            <input type="color" name="color" defaultValue={data.studio.color} />
          </label>
        </div>
        <p role="status">{message}</p>
        <Button className="primary" disabled={busy}>
          Save studio settings
        </Button>
      </form>
      {isDemo && (
        <section className="reset-section">
          <h2>Start fresh</h2>
          <p>Reset this browser’s fictional workspace to its sample records.</p>
          <Button
            onClick={async () => {
              if (confirm('Reset all demo changes in this browser?')) {
                await mutate('/reset', {});
                setMessage('Demo reset.');
              }
            }}
          >
            Reset demo
          </Button>
        </section>
      )}
    </>
  );
}
