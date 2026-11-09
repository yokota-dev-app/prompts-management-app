import { routes, type VercelConfig } from '@vercel/config/v1';

const backendUrl = process.env.BACKEND_URL;
if (!backendUrl) {
  throw new Error('BACKEND_URL must be set in the Vercel project environment');
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

export const config: VercelConfig = {
  rewrites: [
    routes.rewrite('/api/v1/:path*', `${backend.origin}/api/v1/:path*`),
    routes.rewrite('/(.*)', '/index.html'),
  ],
};
