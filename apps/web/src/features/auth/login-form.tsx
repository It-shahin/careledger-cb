'use client';
import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/providers/workspace-provider';
import { isDemo } from '@/lib/api';
import { demoCredentials } from '@/lib/demo-store';
import { Button } from '@/components/ui/button';
export function LoginForm() {
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [show, setShow] = useState(false);
  const { login, signedIn } = useWorkspace(),
    router = useRouter();
  useEffect(() => {
    if (signedIn) router.replace('/overview');
  }, [signedIn, router]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      router.push('/overview');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login">
      <section className="login-story">
        <a className="brand" href="/">
          <span className="mark">C</span>
          <span>
            CareLedger<small>Website care, made visible</small>
          </span>
        </a>
        <div>
          <h1>
            Good care deserves
            <br />a clear record.
          </h1>
          <p>
            A home for the work behind your clients’ websites.
            <br />
            Log it, explain it, and send a thoughtful monthly report.
          </p>
        </div>
      </section>
      <section className="login-panel">
        <div>
          <p className="eyebrow">YOUR STUDIO, IN ORDER</p>
          <h2>Back to your studio</h2>
          <p>Sign in to your website care workspace.</p>
          <form onSubmit={submit}>
            <label>
              Email
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your studio email"
              />
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-label="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
            <p role="alert" className="error">
              {error}
            </p>
            <Button className="primary" disabled={busy}>
              {busy ? 'Opening…' : 'Open your workspace'} <span>→</span>
            </Button>
          </form>
          {isDemo && (
            <section className="demo-entry">
              <h3>Take a look around</h3>
              <p>One studio user, with fictional client records.</p>
              <dl>
                <dt>Email</dt>
                <dd>{demoCredentials.email}</dd>
                <dt>Password</dt>
                <dd>{demoCredentials.password}</dd>
              </dl>
              <button
                className="text-button"
                onClick={() => {
                  setEmail(demoCredentials.email);
                  setPassword(demoCredentials.password);
                }}
              >
                Use the demo credentials →
              </button>
              <small>Public sample credentials. Changes stay in this browser.</small>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
