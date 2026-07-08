import React, { useState, useCallback, useMemo } from 'react';

interface ImageWithProxyProps {
    src: string;
    alt?: string;
    className?: string;
    onClick?: () => void;
}

/**
 * 获取图片代理 URL
 * 通过 Cloudflare Worker (/proxy-image) 或 Vite 开发中间件代理微博图床，
 * 服务端设置 Referer 为 localhost 以绕过防盗链。
 */
const getProxyUrl = (src: string): string => {
    return `/proxy-image?url=${encodeURIComponent(src)}`;
};

/**
 * 图片代理组件
 *
 * 微博图床 (wx*.sinaimg.cn) 会检查 Referer/Origin 头，只允许特定来源的请求。
 * 该组件通过服务端代理绕过防盗链：
 * - 开发环境：Vite 开发服务器中间件，服务端设置 Referer 为 localhost
 * - 生产环境：Cloudflare Worker，服务端设置 Referer 为 localhost
 *
 * 注意：不能使用 fetch + blob URL 的方式，因为微博图床没有设置 CORS 头
 * （Access-Control-Allow-Origin），浏览器会阻止跨域 fetch 请求。
 */
const ImageWithProxy: React.FC<ImageWithProxyProps> = ({
    src,
    alt = '',
    className = '',
    onClick,
}) => {
    const [error, setError] = useState(false);

    const imageUrl = useMemo(() => {
        return getProxyUrl(src);
    }, [src]);

    if (error) {
        return (
            <div className={`bg-gray-700 flex items-center justify-center text-gray-400 text-xs ${className}`}>
                加载失败
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={alt}
            className={className}
            onClick={onClick}
            onError={() => setError(true)}
        />
    );
};

export default ImageWithProxy;
