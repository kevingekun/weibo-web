import type { Weibo } from '../types';
import { API_BASE_URL } from '../constants';

/**
 * A helper function to make API requests.
 * It automatically adds the Authorization header if a token is available.
 * It also handles response parsing and error formatting.
 * @param endpoint The API endpoint to call (e.g., '/users/login').
 * @param options The options for the fetch call (method, body, etc.).
 * @returns A promise that resolves with the JSON response.
 */
const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    // 处理 hash 路由中的查询参数 (例如 #/weibo?token=123)
    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const urlParams = new URLSearchParams(queryString);
    const urlToken = urlParams.get('token');
    const urlUserId = urlParams.get('userId');
    
    // 如果 endpoint 不包含查询参数，则添加问号，否则添加 &
    const separator = endpoint.includes('?') ? '&' : '?';
    let fullUrl = `${API_BASE_URL}${endpoint}`;
    
    if (urlToken) {
        fullUrl += `${separator}token=${urlToken}`;
    }
    if (urlUserId) {
        fullUrl += `${separator}userId=${urlUserId}`;
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    const response = await fetch(fullUrl, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorData;
        try {
            // Try to parse the error response as JSON
            errorData = await response.json();
        } catch (e) {
            // If it's not JSON, use the status text
            errorData = { message: response.statusText };
        }
        // Throw an error with the message from the backend, or a generic one
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle responses that might not have a body (e.g., 204 No Content)
    if (response.status === 204) {
        return null as T;
    }
    
    return response.json();
};


// 13. Get Weibo Page
type WeiboPageResponse = {
    records: Weibo[];
    total: number;
    size: number;
    current: number;
};
export const getWeiboPage = async (page: number = 1, size: number = 10, userId?: string): Promise<WeiboPageResponse> => {
    let url = `/weibo/page?page=${page}&size=${size}`;
    return apiFetch<WeiboPageResponse>(url);
};
