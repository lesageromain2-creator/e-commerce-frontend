/**
 * Layout Admin unifié - Wrapper pour toutes les pages admin
 * Intègre le sidebar, le header et gère l'authentification
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  requireAuth?: boolean;
}

export default function AdminLayout({ 
  children, 
  title = 'Admin Dashboard',
  requireAuth = true 
}: AdminLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    orders: 0,
    appointments: 0,
    support: 0,
    reviews: 0,
  });

  useEffect(() => {
    if (requireAuth) {
      checkAuth();
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [requireAuth]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login?redirect=' + encodeURIComponent(router.asPath));
        return;
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000,
      });

      const userData = response.data.user;
      if (userData) {
        // Vérifier que l'utilisateur est admin
        if (userData.role !== 'admin') {
          router.push('/dashboard'); // Rediriger vers dashboard utilisateur
          return;
        }
        setUser(userData);
      } else {
        router.push('/login?redirect=' + encodeURIComponent(router.asPath));
      }
    } catch (error) {
      console.error('Erreur auth:', error);
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });

      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Erreur notifications:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1A1F3A] to-[#0A0E27] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar 
        activeSection={undefined}
        notifications={notifications}
        onNavigate={() => setSidebarOpen(false)}
      />
      
      <div className="admin-content">
        <AdminHeader 
          user={user} 
          onSearch={() => {}} 
        />
        
        <main className="admin-main">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <style jsx>{`
        .admin-layout {
          min-height: 100vh;
          background: linear-gradient(135deg, #0A0E27 0%, #1A1F3A 50%, #0A0E27 100%);
        }

        .admin-content {
          margin-left: 280px;
          min-height: 100vh;
        }

        .admin-main {
          padding-top: 80px;
          padding-left: 0;
          padding-right: 0;
        }

        .admin-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 95;
        }

        @media (max-width: 1024px) {
          .admin-content {
            margin-left: 0;
          }

          .admin-overlay {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}
