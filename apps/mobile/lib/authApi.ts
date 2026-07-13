import { API_URL } from '@/constants/api';
import { apiFetch } from '@/lib/api';
import type { User } from '@/stores/authStore';

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return (await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })) as AuthResponse;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return (await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })) as AuthResponse;
}

export async function logout(): Promise<void> {
  await apiFetch('/auth/logout', { method: 'POST' });
}

export async function forgotPassword(
  payload: ForgotPasswordPayload
): Promise<{ message: string }> {
  return (await apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })) as { message: string };
}

export function getGoogleOAuthUrl(): string {
  return `${API_URL}/api/auth/oauth/google/redirect`;
}
