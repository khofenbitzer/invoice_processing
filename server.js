// Production server: serves the Vite build and proxies LLM requests
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST_DIR = join(__dirname, 'dist');
const PORT = process.env.PORT || 80;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript',
  '.mjs':  'text/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
};

createServer(async (req, res) => {
  // ── LLM proxy ──────────────────────────────────────────────────────────
  if (req.url === '/llm-proxy' && req.method === 'POST') {
    const targetUrl = req.headers['x-llm-target-url'];
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing X-LLM-Target-URL header' }));
      return;
    }

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    const apiKey = req.headers['x-llm-api-key'];
    const upstreamHeaders = { 'Content-Type': 'application/json' };
    if (apiKey) upstreamHeaders['Authorization'] = `Bearer ${apiKey}`;

    try {
      const upstream = await fetch(targetUrl, {
        method: 'POST',
        headers: upstreamHeaders,
        body,
      });
      res.writeHead(upstream.status, {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
      });
      res.end(Buffer.from(await upstream.arrayBuffer()));
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Proxy error: ${err}` }));
    }
    return;
  }

  // ── Static files ────────────────────────────────────────────────────────
  // Strip query string for file lookup
  const urlPath = req.url.split('?')[0];
  const filePath = join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);

  try {
    const data = await readFile(filePath);
    const mime = MIME_TYPES[extname(filePath)] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  } catch {
    // SPA fallback — serve index.html for unknown routes
    try {
      const data = await readFile(join(DIST_DIR, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    } catch {
      res.writeHead(500);
      res.end('Internal server error');
    }
  }
}).listen(PORT, () => console.log(`Server listening on port ${PORT}`));
