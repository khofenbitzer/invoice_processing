import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

function llmProxy(): Plugin {
  return {
    name: 'llm-proxy',
    configureServer(server) {
      server.middlewares.use('/llm-proxy', async (req, res) => {
        const targetUrl = req.headers['x-llm-target-url'] as string;
        if (!targetUrl) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Missing X-LLM-Target-URL header' }));
          return;
        }

        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk as Buffer);
        }
        const body = Buffer.concat(chunks);

        const apiKey = req.headers['x-llm-api-key'] as string | undefined;
        const upstreamHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (apiKey) {
          upstreamHeaders['Authorization'] = `Bearer ${apiKey}`;
        }

        try {
          const upstream = await fetch(targetUrl, {
            method: req.method || 'POST',
            headers: upstreamHeaders,
            body: body.length > 0 ? body : undefined,
          });

          res.statusCode = upstream.status;
          const responseBody = await upstream.arrayBuffer();
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
          res.end(Buffer.from(responseBody));
        } catch (err) {
          res.statusCode = 502;
          res.end(JSON.stringify({ error: `Proxy error: ${err}` }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), llmProxy()],
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
})
