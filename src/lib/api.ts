

'use client';

import { useAuth } from '@/context/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const refreshToken = async () => {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    if (!currentRefreshToken) {
        throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to refresh token');
    }

    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
};

const api = async (url: string, options: RequestInit = {}) => {
    let accessToken = localStorage.getItem('accessToken');

    const headers: Record<string, string> = {
        ...options.headers,
    };
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Set Content-Type if a body is present, regardless of method.
    if (options.body) {
        headers['Content-Type'] = 'application/json';
    }

    options.headers = headers;

    let response = await fetch(`${API_BASE_URL}${url}`, options);

    if (response.status === 401 && accessToken) {
        try {
            const newAccessToken = await refreshToken();
            // Update header with new token
            (options.headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
            // Retry the original request
            response = await fetch(`${API_BASE_URL}${url}`, options);
        } catch (error) {
            // If refresh fails, we can't recover.
            console.error('Session expired. Please log in again.', error);
            // This is where you might call a logout function.
            // For now, we'll re-throw the error.
            throw new Error('Session expired.');
        }
    }

    return response;
};

export default api;
