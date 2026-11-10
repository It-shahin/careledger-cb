import { z } from 'zod';
export const clientInput = z.object({
  name: z.string().trim().min(1).max(100),
  contact: z.string().trim().max(254),
  siteName: z.string().trim().min(1).max(100),
  url: z.url().refine((v) => new URL(v).protocol === 'https:', 'Use an HTTPS address'),
});
export const entryInput = z.object({
  siteId: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  details: z.string().trim().min(1).max(2000),
  evidence: z.string().trim().min(1).max(500),
  kind: z.enum(['Update', 'Backup', 'Check', 'Fix', 'Other']),
  happenedOn: z.iso
    .date()
    .refine(
      (v) => v <= new Date().toISOString().slice(0, 10),
      'Choose a date that is not in the future',
    ),
});
export const reportInput = z.object({
  siteId: z.string().min(1),
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  summary: z.string().trim().min(1).max(2000),
  nextSteps: z.string().trim().max(2000),
});
export const studioInput = z.object({
  name: z.string().trim().min(1).max(100),
  initials: z.string().trim().min(1).max(4),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
});
export interface Studio {
  name: string;
  initials: string;
  color: string;
}
export interface Client {
  id: string;
  name: string;
  contact: string;
}
export interface Site {
  id: string;
  clientId: string;
  name: string;
  url: string;
}
export interface Entry {
  id: string;
  siteId: string;
  title: string;
  details: string;
  evidence: string;
  kind: string;
  happenedOn: string;
}
export interface Snapshot {
  studio: Studio;
  site: Site;
  client: Client;
  entries: Entry[];
  demo: boolean;
}
export interface Report {
  id: string;
  siteId: string;
  period: string;
  summary: string;
  nextSteps: string;
  status: string;
  snapshot: Snapshot;
}
export interface Workspace {
  studio: Studio;
  clients: Client[];
  sites: Site[];
  entries: Entry[];
  reports: Report[];
}
