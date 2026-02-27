// ============================================
// HOOK AUTHENTIFICATION
// ============================================
// Gère uniquement JWT (backend) - Better Auth désactivé

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '@/lib/axios';
import type { 
  AuthState, 
  LoginCredentials, 
  RegisterData, 
  UserAuth 
} from '@/types';
import { toast } from 'react-toastify';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: UserAuth) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const router = useRouter();
  
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Charger / resynchroniser l'utilisateur depuis localStorage (à chaque changement de route pour prendre en compte une connexion faite sur la page login)
  useEffect(() => {
    const loadUser = () => {
      try {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          const user = JSON.parse(userStr);
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else if (token) {
          setState({
            user: null,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Erreur chargement utilisateur:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadUser();
  }, [router.asPath]); // Resync après navigation (ex: retour depuis page login)

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const response = await axiosInstance.post('/auth/login', credentials);

      if (response.data.success) {
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));

        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        toast.success('Connexion réussie !');
        
        // Redirection selon le rôle
        if (user.role === 'admin') {
          router.push('/admin/ecommerce/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Erreur login:', error);
      toast.error(error.response?.data?.message || 'Erreur de connexion');
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const response = await axiosInstance.post('/auth/register', data);

      if (response.data.success) {
        toast.success('Inscription réussie ! Vérifiez votre email.');
        router.push('/login');
      }
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      toast.error(error.response?.data?.message || 'Erreur d\'inscription');
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [router]);

  const logout = useCallback(async () => {
    // Toujours déconnecter localement et rediriger, même si l'API renvoie 429 ou autre erreur
    const clearAndRedirect = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      toast.info('Déconnexion réussie');
      router.push('/');
    };
    try {
      await axiosInstance.post('/auth/logout');
    } catch (_error) {
      // 429 (rate limit) ou autre : on ignore, la déco côté client est prioritaire
    }
    clearAndRedirect();
  }, [router]);

  const updateUser = useCallback((user: UserAuth) => {
    localStorage.setItem('user', JSON.stringify(user));
    setState((prev) => ({ ...prev, user }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };
};

// Provider à utiliser dans _app.tsx
export { AuthContext };
