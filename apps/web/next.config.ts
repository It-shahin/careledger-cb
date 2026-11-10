import type { NextConfig } from 'next';
const config: NextConfig = {
  ...(process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? { output: 'export' } : {}),
  transpilePackages: ['@careledger/shared'],
};
export default config;
