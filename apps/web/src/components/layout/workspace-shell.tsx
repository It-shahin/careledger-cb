'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useWorkspace } from '@/providers/workspace-provider';
import { isDemo } from '@/lib/api';
const links = [
  ['/overview', 'Overview'],
  ['/clients', 'Client sites'],
  ['/maintenance', 'Maintenance log'],
  ['/reports', 'Reports'],
  ['/settings', 'Studio settings'],
];
export function WorkspaceShell({ children }: { children: ReactNode }) {
  const { data, ready, signedIn, logout } = useWorkspace();
  const router = useRouter(),
    path = usePathname();
  useEffect(() => {
    if (ready && !signedIn) router.replace('/');
  }, [ready, signedIn, router]);
  if (!ready || !signedIn || !data) return <p className="loading">Opening your workspace…</p>;
  return (
    <div className="workspace">
      <aside className="sidebar">
        <Link href="/overview" className="brand">
          <span className="mark">C</span>
          <span>
            CareLedger<small>Website care workspace</small>
          </span>
        </Link>
        <div className="studio">
          <span className="monogram">{data.studio.initials}</span>
          <span>
            {data.studio.name}
            <small>Independent care studio</small>
          </span>
        </div>
        <nav aria-label="Workspace">
          {links.map(([href, label]) => (
            <Link aria-current={path === href ? 'page' : undefined} href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <small>
            {isDemo
              ? 'Fictional demo · saved in this browser'
              : 'Connected to your studio database'}
          </small>
          <button
            className="text-button"
            onClick={async () => {
              await logout();
              router.replace('/');
            }}
          >
            Sign out →
          </button>
        </div>
      </aside>
      <div className="content">
        <header className="topbar">
          Workspace <span>/</span> {links.find(([href]) => href === path)?.[1]}
          <small>{isDemo ? 'Demo workspace' : 'Studio workspace'}</small>
        </header>
        <main id="main">{children}</main>
      </div>
    </div>
  );
}
