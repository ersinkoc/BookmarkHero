import { api } from './api';
import { User, AuthTokens, LoginRequest, RegisterRequest } from '@bookmark-hero/types';

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post<{
      user: User;
      tokens: AuthTokens;
    }>('/auth/login', { email, password });
    return response.data;
  },

  async register(email: string, password: string, name?: string) {
    const response = await api.post<{
      user: User;
      tokens: AuthTokens;
    }>('/auth/register', { email, password, name });
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    }
  },

  async getMe() {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },

  async refreshToken(refreshToken: string) {
    const response = await api.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },
};