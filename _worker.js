export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Only proxy /v1/* paths to Replicate — serve everything else normally
    if (!url.pathname.startsWith('/v1/')) {
      return env.ASSETS.fetch(request);
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type, Prefer',
        }
      });
    }

    // Forward to Replicate
    const replicateUrl = 'https://api.replicate.com' + url.pathname + url.search;

    const response = await fetch(replicateUrl, {
      method: request.method,
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
        'Prefer': request.headers.get('Prefer') || '',
      },
      body: request.method !== 'GET' ? request.body : undefined,
    });

    const body = await response.arrayBuffer();

    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
};