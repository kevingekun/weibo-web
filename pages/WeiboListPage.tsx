import React, { useEffect, useState } from 'react';
import { getWeiboPage } from '../services/api';
import { Weibo } from '../types';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import ImageWithProxy from '../components/ImageWithProxy';

export const WeiboListPage: React.FC = () => {
    const [weibos, setWeibos] = useState<Weibo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const size = 10;

    useEffect(() => {
        const fetchWeibos = async () => {
            try {
                setLoading(true);
                const data = await getWeiboPage(page, size);
                setWeibos(data.records);
                setTotal(data.total);
            } catch (err) {
                setError(err instanceof Error ? err.message : '获取内容失败');
            } finally {
                setLoading(false);
            }
        };
        fetchWeibos();
    }, [page]);

    if (loading) return <Spinner />;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">内容列表</h1>
            <div className="space-y-4">
                {weibos.map(weibo => (
                    <Card key={weibo.id} className="p-4">
                        <div className="font-bold">{weibo.screenName}</div>
                        <div className="mt-2 text-gray-200">
                            {weibo.text}
                            {weibo.links && weibo.links !== '[]' && (
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {weibo.links.split(',').map((link, i) => {
                                        // 处理链接格式：去除可能存在的方括号、引号
                                        const url = link.replace(/[\[\]"']/g, '').trim();
                                        if (!url) return null;
                                        return (
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:underline">
                                                [链接 {i + 1}]
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        {weibo.pics && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {weibo.pics.split(',').map((url, i) => (
                                    <ImageWithProxy key={i} src={url} alt={`图片 ${i}`} className="w-24 h-24 object-cover rounded cursor-pointer hover:opacity-80" onClick={() => setFullscreenImage(url)} />
                                ))}
                            </div>
                        )}
                        {fullscreenImage && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4" onClick={() => setFullscreenImage(null)}>
                                <ImageWithProxy src={fullscreenImage} alt="全屏查看" className="max-w-full max-h-full rounded" />
                            </div>
                        )}
                        <div className="mt-2 text-sm text-gray-400">
                            {new Date(weibo.createdAt).toLocaleString()} | 转发: {weibo.repostsCount} | 评论: {weibo.commentsCount} | 点赞: {weibo.attitudesCount}
                        </div>
                    </Card>
                ))}
            </div>
            <div className="flex justify-center items-center mt-4 space-x-2">
                <button 
                    disabled={page === 1}
                    onClick={() => setPage(1)}
                    className="px-2 py-1 bg-gray-700 text-white rounded"
                >
                    首页
                </button>
                <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-2 py-1 bg-indigo-600 text-white rounded"
                >
                    上一页
                </button>
                {Array.from({ length: Math.min(5, Math.ceil(total / size)) }).map((_, i) => {
                    const p = Math.max(1, Math.min(Math.ceil(total / size) - 4, page - 2)) + i;
                    return (
                        <button 
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-3 py-1 rounded ${page === p ? 'bg-indigo-800' : 'bg-gray-700'}`}
                        >
                            {p}
                        </button>
                    );
                })}
                <button 
                    disabled={page >= Math.ceil(total / size)}
                    onClick={() => setPage(p => p + 1)}
                    className="px-2 py-1 bg-indigo-600 text-white rounded"
                >
                    下一页
                </button>
                <span className="text-sm">共 {Math.ceil(total / size)} 页</span>
                <input 
                    type="number"
                    min="1"
                    max={Math.ceil(total / size)}
                    className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded"
                    placeholder="页码"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const val = parseInt(e.currentTarget.value);
                            if (val >= 1 && val <= Math.ceil(total / size)) setPage(val);
                        }
                    }}
                />
            </div>
        </div>
    );
};
