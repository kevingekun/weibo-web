import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { parse } from 'url';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [
        react(),
        // 图片代理插件：解决微博图床防盗链问题
        {
          name: 'image-proxy',
          configureServer(server) {
            server.middlewares.use('/proxy-image', async (req, res) => {
              const parsedUrl = parse(req.url || '', true);
              const imageUrl = parsedUrl.query?.url as string || '';
              if (!imageUrl) {
                res.statusCode = 400;
                res.end('Missing url parameter');
                return;
              }
              try {
                const response = await fetch(imageUrl, {
                  headers: {
                    // 伪装 Referer 为 localhost，绕过微博图床防盗链
                    'Referer': 'http://localhost',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                  },
                });
                if (!response.ok) {
                  res.statusCode = response.status;
                  res.end(`Proxy error: ${response.statusText}`);
                  return;
                }
                const contentType = response.headers.get('content-type') || 'image/jpeg';
                res.setHeader('Content-Type', contentType);
                res.setHeader('Cache-Control', 'public, max-age=31536000');
                // 将图片数据流式传输给客户端
                const arrayBuffer = await response.arrayBuffer();
                res.end(Buffer.from(arrayBuffer));
              } catch (err) {
                res.statusCode = 500;
                res.end(`Proxy error: ${err}`);
              }
            });
          },
        },
      ],
      base: '/',
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
