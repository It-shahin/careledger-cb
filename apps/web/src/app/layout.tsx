import type { Metadata } from 'next';
import { WorkspaceProvider } from '@/providers/workspace-provider';
import './globals.css';
export const metadata: Metadata = {
  title: 'CareLedger — Website care, made visible',
  description: 'Client websites, maintenance notes, and monthly care reports.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WorkspaceProvider>{children}</WorkspaceProvider>
      </body>
    </html>
  );
}
