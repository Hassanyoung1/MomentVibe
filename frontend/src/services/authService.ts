import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token?: string;
  message?: string;
  user?: {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  async requestPasswordReset(email: string): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET, { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
  },

  async confirmEmail(token: string): Promise<void> {
    await axiosInstance.get(`${API_ENDPOINTS.AUTH.CONFIRM_EMAIL}?token=${token}`);
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
