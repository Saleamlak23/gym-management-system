import apiClient from '@/lib/api';
import { ApiResponse, AuthUser, RegisterRequest } from '@/types';

const AUTH_BASE = '/auth';

export const authService = {
  async login(email: string, password: string) {
    const response = await apiClient.getClient().post<ApiResponse<{ token: string; user: AuthUser }>>(
      `${AUTH_BASE}/login`,
      { email, password }
    );
    return response.data;
  },

  async register(data: RegisterRequest) {
    const response = await apiClient.getClient().post<ApiResponse<{ token: string; user: AuthUser }>>(
      `${AUTH_BASE}/register`,
      data
    );
    return response.data;
  },

  async getCurrentUser() {
    const response = await apiClient.getClient().get<ApiResponse<{ user: AuthUser }>>(`${AUTH_BASE}/me`);
    return response.data;
  },

  async logout() {
    apiClient.clearToken();
  },
};
