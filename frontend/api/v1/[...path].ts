import type { IncomingMessage, ServerResponse } from 'node:http';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
]);

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    console.error('BACKEND_URL is not configured for the Vercel API proxy');
    res.statusCode = 500;
    res.end('API proxy is not configured');
    return;
  }

  const requestUrl = new URL(req.url ?? '/', 'https://vercel.local');
  if (requestUrl.pathname !== '/api/v1' && !requestUrl.pathname.startsWith('/api/v1/')) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  let upstreamBaseUrl: URL;
  try {
    upstreamBaseUrl = new URL(backendUrl);
  } catch (error) {
    console.error('BACKEND_URL must be a valid HTTPS origin', error);
    res.statusCode = 500;
    res.end('API proxy is misconfigured');
    return;
  }

  if (
    upstreamBaseUrl.protocol !== 'https:' ||
    upstreamBaseUrl.pathname !== '/' ||
    upstreamBaseUrl.search ||
    upstreamBaseUrl.hash
  ) {
    console.error('BACKEND_URL must be an HTTPS origin without a path, query, or fragment');
    res.statusCode = 500;
    res.end('API proxy is misconfigured');
    return;
  }

  const upstreamUrl = new URL(`${requestUrl.pathname}${requestUrl.search}`, upstreamBaseUrl);
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (!HOP_BY_HOP_HEADERS.has(name) && value !== undefined) {
      headers.set(name, Array.isArray(value) ? value.join(', ') : value);
    }
  }

  try {
    const method = req.method ?? 'GET';
    const chunks: Buffer[] = [];
    if (method !== 'GET' && method !== 'HEAD') {
      for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
    }

    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers,
      body: chunks.length > 0 ? Buffer.concat(chunks) : undefined,
    });

    res.statusCode = upstreamResponse.status;
    upstreamResponse.headers.forEach((value, name) => {
      if (name !== 'set-cookie' && !HOP_BY_HOP_HEADERS.has(name)) {
        res.setHeader(name, value);
      }
    });

    const cookies = upstreamResponse.headers.getSetCookie();
    if (cookies.length > 0) {
      res.setHeader('Set-Cookie', cookies);
    }

    res.end(
      method === 'HEAD' || upstreamResponse.status === 204 || upstreamResponse.status === 304
        ? undefined
        : Buffer.from(await upstreamResponse.arrayBuffer()),
    );
  } catch (error) {
    console.error('Vercel API proxy request failed', {
      method: req.method,
      path: requestUrl.pathname,
      error,
    });
    if (!res.headersSent) {
      res.statusCode = 502;
      res.end('API request failed');
    }
  }
}
