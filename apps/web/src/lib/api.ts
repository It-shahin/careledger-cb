import { demoRequest } from './demo-store';
export const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
export async function request<T>(
  path: string,
  body?: unknown,
  method = body ? 'POST' : 'GET',
): Promise<T> {
  if (isDemo) return demoRequest(path, body, method) as T;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api${path}`,
    {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    },
  );
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result as T;
}
