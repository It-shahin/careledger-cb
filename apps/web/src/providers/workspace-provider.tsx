'use client';
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Workspace } from '@careledger/shared';
import { isDemo, request } from '@/lib/api';
import { demoCredentials } from '@/lib/demo-store';
const Context = createContext<{
  data: Workspace | null;
  ready: boolean;
  signedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  mutate: (path: string, body?: unknown, method?: string) => Promise<void>;
} | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Workspace | null>(null),
    [ready, setReady] = useState(false),
    [signedIn, setSignedIn] = useState(false);
  const refresh = useCallback(async () => {
    setData(await request<Workspace>('/workspace'));
  }, []);
  useEffect(() => {
    (async () => {
      try {
        if (isDemo && sessionStorage.getItem('careledger-session') !== 'demo') return;
        await refresh();
        setSignedIn(true);
      } catch {
      } finally {
        setReady(true);
      }
    })();
  }, [refresh]);
  async function login(email: string, password: string) {
    if (isDemo) {
      if (email !== demoCredentials.email || password !== demoCredentials.password)
        throw new Error('Email or password is incorrect.');
      sessionStorage.setItem('careledger-session', 'demo');
    } else await request('/auth/login', { email, password });
    await refresh();
    setSignedIn(true);
  }
  async function logout() {
    if (!isDemo) await request('/auth/logout', {});
    sessionStorage.removeItem('careledger-session');
    setSignedIn(false);
    setData(null);
  }
  async function mutate(path: string, body?: unknown, method?: string) {
    await request(path, body, method);
    await refresh();
  }
  return (
    <Context.Provider value={{ data, ready, signedIn, login, logout, refresh, mutate }}>
      {children}
    </Context.Provider>
  );
}
export function useWorkspace() {
  const value = useContext(Context);
  if (!value) throw new Error('WorkspaceProvider is missing.');
  return value;
}
