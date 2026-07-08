/**
 * Cloudflare Worker - 微博图床图片代理
 *
 * 部署到 wb.102181.xyz 的 /proxy-image 路由。
 * 通过服务端请求微博图床并设置 Referer 为 localhost，绕过防盗链。
 *
 * 部署方式：
 *   npx wrangler deploy workers/proxy-image.js --name proxy-image --compatibility-date 2026-07-08 --routes wb.102181.xyz/proxy-image*
 */

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const imageUrl = url.searchParams.get('url');

    if (!imageUrl) {
      return new Response('Missing "url" parameter', { status: 400 });
    }

    // 验证 URL 格式
    try {
      new URL(imageUrl);
    } catch {
      return new Response('Invalid URL', { status: 400 });
    }

    try {
      const response = await fetch(imageUrl, {
        headers: {
          // 伪装 Referer 为 localhost，绕过微博图床防盗链
          'Referer': 'http://localhost',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        return new Response(`Proxy error: ${response.status} ${response.statusText}`, {
          status: response.status,
        });
      }

      // 获取原始响应头并转发
      const responseHeaders = new Headers(response.headers);
      
      // 设置缓存控制（缓存 1 年）
      responseHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
      
      // 允许跨域访问
      responseHeaders.set('Access-Control-Allow-Origin', '*');

      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(`Proxy error: ${err.message}`, { status: 500 });
    }
  },
};
