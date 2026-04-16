import axios, { type AxiosError } from 'axios';
import type { ApiResponse, AuthResponse, LoginDTO, RegisterDTO, User } from '@clawchat/shared';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clawchat_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiResponse<unknown>>) => {
    const msg = err.response?.data?.message || err.message || 'Network error';
    return Promise.reject(new Error(msg));
  }
);

// Auth APIs
export const authApi = {
  register: (data: RegisterDTO) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data).then((r) => r.data.data),
  login: (data: LoginDTO) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data).then((r) => r.data.data),
  getProfile: () => api.get<ApiResponse<User>>('/auth/profile').then((r) => r.data.data),
};

export default api;
