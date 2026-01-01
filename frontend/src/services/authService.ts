import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

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
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  async logout(): Promise<void> {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    localStorage.removeItem('token');
  },

  async requestPasswordReset(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Password reset request failed');
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    if (!response.ok) throw new Error('Password reset failed');
  },

  async confirmEmail(token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.CONFIRM_EMAIL}?token=${token}`);
    if (!response.ok) throw new Error('Email confirmation failed');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  setToken(token: string): void {
    localStorage.setItem('token', token);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
