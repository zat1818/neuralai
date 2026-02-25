import { API_BASE_URL } from '../constants';
import { TickerItemProps, NewsItemProps } from '../types';

interface RequestOptions extends RequestInit {
  token?: string | null;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...init } = options;
  const headers = new Headers(init.headers || {});
  
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...init,
      headers,
    });
  } catch (e: any) {
    console.error('Network error:', e);
    throw new Error('Gagal terhubung ke server. Periksa koneksi internet Anda.');
  }

  let data: any;
  try {
    data = await response.json();
  } catch (e) {
    data = { message: 'Server returned an invalid response' };
  }

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/')) {
      localStorage.removeItem('neural_token');
      localStorage.removeItem('neural_user');
      window.location.href = '/login';
    }
    if (response.status === 403 && data.banned) {
      localStorage.setItem('neural_ban_reason', data.reason || 'Pelanggaran kebijakan');
      window.location.href = '/blocked';
    }
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const api = {
  auth: {
    login: (body: any) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body: any) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    verifyOtp: (body: any) => request('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
    resendOtp: (body: any) => request('/api/auth/resend-otp', { method: 'POST', body: JSON.stringify(body) }),
    me: (token: string) => request('/api/auth/me', { token }),
  },
  user: {
    getApiKey: (token: string) => request('/api/user/apikey', { token }),
    setupApiKey: (token: string, body: any) => request('/api/user/apikey', { method: 'PUT', body: JSON.stringify(body), token }),
    testApiKey: (token: string, body: { provider: string }) => request('/api/user/apikey/test', { method: 'POST', body: JSON.stringify(body), token }),
    deleteApiKey: (token: string, provider: string) => request(`/api/user/apikey/${provider}`, { method: 'DELETE', token }),
    getUsage: (token: string) => request('/api/user/usage', { token }),
    updateProfile: (token: string, body: any) => request('/api/user/profile', { method: 'PUT', body: JSON.stringify(body), token }),
    updateSettings: (token: string, body: any) => request('/api/user/settings', { method: 'PUT', body: JSON.stringify(body), token }),
  },
  signal: {
    generate: (token: string, body: any) => request('/api/signal/generate', { method: 'POST', body: JSON.stringify(body), token }),
    getHistory: (token: string, params?: any) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return request(`/api/signal/history${query}`, { token });
    },
    getDetail: (token: string, id: string) => request(`/api/signal/${id}`, { token }),
    updateResult: (token: string, id: string, body: any) => request(`/api/signal/${id}/result`, { method: 'PATCH', body: JSON.stringify(body), token }),
  },
  forum: {
    getPosts: (token: string) => request('/api/forum/posts', { token }),
    getPostDetail: (token: string, id: string) => request(`/api/forum/posts/${id}`, { token }),
    createPost: (token: string, body: any) => request('/api/forum/posts', { method: 'POST', body: JSON.stringify(body), token }),
    deletePost: (token: string, id: string) => request(`/api/forum/posts/${id}`, { method: 'DELETE', token }),
    addComment: (token: string, id: string, body: any) => request(`/api/forum/posts/${id}/comments`, { method: 'POST', body: JSON.stringify(body), token }),
    likePost: (token: string, id: string) => request(`/api/forum/posts/${id}/like`, { method: 'POST', token }),
    unlikePost: (token: string, id: string) => request(`/api/forum/posts/${id}/like`, { method: 'DELETE', token }),
    getLeaderboard: (token: string) => request('/api/forum/leaderboard', { token }),
    searchUsers: (token: string, q: string) => request(`/api/forum/search/users?q=${q}`, { token }),
  },
  notifications: {
    getAll: (token: string) => request('/api/notifications', { token }),
    getCount: (token: string) => request('/api/notifications/count', { token }),
    markRead: (token: string, id: string) => request(`/api/notifications/${id}/read`, { method: 'PATCH', token }),
    markReadAll: (token: string) => request('/api/notifications/read-all', { method: 'PATCH', token }),
    delete: (token: string, id: string) => request(`/api/notifications/${id}`, { method: 'DELETE', token }),
    deleteAll: (token: string) => request('/api/notifications', { method: 'DELETE', token }),
  },
  models: {
    getAll: (token: string, provider?: string) => {
      const query = provider ? `?provider=${provider}` : '';
      return request(`/api/models${query}`, { token });
    },
  },
  admin: {
    getDashboard: (token: string) => request('/api/admin/dashboard', { token }),
    getUsers: (token: string) => request('/api/admin/users', { token }),
    getUserDetail: (token: string, id: string) => request(`/api/admin/users/${id}`, { token }),
    updateUserRole: (token: string, id: string, body: any) => request(`/api/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify(body), token }),
    verifyUser: (token: string, id: string) => request(`/api/admin/users/${id}/verify`, { method: 'PATCH', token }),
    deleteUser: (token: string, id: string) => request(`/api/admin/users/${id}`, { method: 'DELETE', token }),
    banUser: (token: string, id: string, body: { reason: string }) => request(`/api/admin/users/${id}/ban`, { method: 'POST', body: JSON.stringify(body), token }),
    unbanUser: (token: string, id: string) => request(`/api/admin/users/${id}/unban`, { method: 'POST', token }),
    getSignals: (token: string) => request('/api/admin/signals', { token }),
    getForumPosts: (token: string) => request('/api/admin/forum/posts', { token }),
    updateForumPost: (token: string, id: string, body: any) => request(`/api/admin/forum/posts/${id}`, { method: 'PATCH', body: JSON.stringify(body), token }),
    deleteForumPost: (token: string, id: string) => request(`/api/admin/forum/posts/${id}`, { method: 'DELETE', token }),
    broadcast: (token: string, body: any) => request('/api/admin/notify/broadcast', { method: 'POST', body: JSON.stringify(body), token }),
    notifyUser: (token: string, id: string, body: any) => request(`/api/admin/notify/user/${id}`, { method: 'POST', body: JSON.stringify(body), token }),
    getBugReports: (token: string) => request('/api/admin/bug-reports', { token }),
    updateBugReport: (token: string, id: string, body: any) => request(`/api/admin/bug-reports/${id}`, { method: 'PATCH', body: JSON.stringify(body), token }),
    deleteBugReport: (token: string, id: string) => request(`/api/admin/bug-reports/${id}`, { method: 'DELETE', token }),
    backupDB: (token: string, body: { targetUri: string }) => request('/api/admin/backup', { method: 'POST', body: JSON.stringify(body), token }),
  },
  bugReports: {
    submit: (token: string, body: any) => request('/api/bug-reports', { method: 'POST', body: JSON.stringify(body), token }),
  },
  public: {
    getNewsTicker: () => request<TickerItemProps[]>('/api/public/news-ticker'),
    getMarketBroadcast: () => request<{ mainNews: NewsItemProps; smallNews: NewsItemProps[] }>('/api/public/market-broadcast'),
  }
};
