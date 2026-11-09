import { env } from 'node:process';

const backendUrl = env.BACKEND_URL;
if (!backendUrl) {
  throw new Error('BACKEND_URL must be set in the Vercel build environment');
}

let backend: URL;
try {
  backend = new URL(backendUrl);
} catch (error) {
  throw new Error('BACKEND_URL must be a valid HTTPS URL', { cause: error });
}

if (
  backend.protocol !== 'https:' ||
  !['/', '/api/v1', '/api/v1/'].includes(backend.pathname) ||
  backend.search ||
  backend.hash
) {
  throw new Error('BACKEND_URL must be an HTTPS Render URL, optionally ending in /api/v1');
}

export const config = {
  rewrites: [
    {
      source: '/api/v1/:path*',
      destination: `${backend.origin}/api/v1/:path*`,
    },
    {
      source: '/(.*)',
      destination: '/index.html',
    },
  ],
};
