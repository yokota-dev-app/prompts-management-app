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

async function handler(request: Request): Promise<Response> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    console.error('BACKEND_URL is not configured for the Vercel API proxy');
    return new Response('API proxy is not configured', { status: 500 });
  }

  const requestUrl = new URL(request.url);
  const apiPath = requestUrl.searchParams.get('_proxy_path');
  if (!apiPath || (apiPath !== '/api/v1' && !apiPath.startsWith('/api/v1/'))) {
    return new Response('Not found', { status: 404 });
  }

  let upstreamBaseUrl: URL;
  try {
    upstreamBaseUrl = new URL(backendUrl);
  } catch (error) {
    console.error('BACKEND_URL must be a valid HTTPS origin', error);
    return new Response('API proxy is misconfigured', { status: 500 });
  }

  if (
    upstreamBaseUrl.protocol !== 'https:' ||
    !['/', '/api/v1', '/api/v1/'].includes(upstreamBaseUrl.pathname) ||
    upstreamBaseUrl.search ||
    upstreamBaseUrl.hash
  ) {
    console.error('BACKEND_URL must be an HTTPS origin, optionally ending in /api/v1');
    return new Response('API proxy is misconfigured', { status: 500 });
  }

  const upstreamUrl = new URL(apiPath, upstreamBaseUrl);
  requestUrl.searchParams.forEach((value, name) => {
    if (name !== '_proxy_path') {
      upstreamUrl.searchParams.append(name, value);
    }
  });

  const headers = new Headers();
  request.headers.forEach((value, name) => {
    if (!HOP_BY_HOP_HEADERS.has(name)) {
      headers.set(name, value);
    }
  });

  try {
    const method = request.method.toUpperCase();
    const body =
      method === 'GET' || method === 'HEAD'
        ? undefined
        : await request.arrayBuffer();
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers,
      body,
    });

    const responseHeaders = new Headers();
    upstreamResponse.headers.forEach((value, name) => {
      if (name !== 'set-cookie' && !HOP_BY_HOP_HEADERS.has(name)) {
        responseHeaders.set(name, value);
      }
    });
    upstreamResponse.headers.getSetCookie().forEach((cookie) => {
      responseHeaders.append('set-cookie', cookie);
    });

    const responseBody =
      method === 'HEAD' || upstreamResponse.status === 204 || upstreamResponse.status === 304
        ? null
        : await upstreamResponse.arrayBuffer();

    return new Response(responseBody, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Vercel API proxy request failed', {
      method: request.method,
      path: apiPath,
      error,
    });
    return new Response('API request failed', { status: 502 });
  }
}

export default { fetch: handler };
