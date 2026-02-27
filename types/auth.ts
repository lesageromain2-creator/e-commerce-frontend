// ============================================
// TYPES AUTHENTIFICATION
// ============================================

import { UUID } from './common';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserAuth;
  message?: string;
}

export interface UserAuth {
  id: UUID;
  email: string;
  // Nom/prénom peuvent venir sous différentes formes selon les endpoints
  first_name?: string;
  last_name?: string;
  firstname?: string;
  lastname?: string;
  name?: string;
  avatar_url?: string;
  role: 'admin' | 'client' | 'user';
  is_verified?: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  password_confirm: string;
}

export interface EmailVerification {
  token: string;
}

export interface AuthState {
  user: UserAuth | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
