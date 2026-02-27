// frontend/components/admin/AdminSidebar.js
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Warehouse, 
  DollarSign, 
  BarChart3,
  Users, 
  Calendar,
  MessageSquare,
  Tag,
  Star,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';

export default function AdminSidebar({ activeSection, onNavigate, notifications = {} }) {
  const router = useRouter();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/ecommerce/dashboard' },
    { id: 'products', label: 'Produits', icon: Package, path: '/admin/ecommerce/products' },
    { id: 'orders', label: 'Commandes', icon: ShoppingCart, path: '/admin/ecommerce/orders', badge: notifications.orders },
    { id: 'inventory', label: 'Inventaire', icon: Warehouse, path: '/admin/inventory' },
    { id: 'finances', label: 'Finances', icon: DollarSign, path: '/admin/finances' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'customers', label: 'Clients', icon: Users, path: '/admin/customers' },
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar, path: '/admin/appointments', badge: notifications.appointments },
    { id: 'support', label: 'Support', icon: MessageSquare, path: '/admin/support', badge: notifications.support },
    { id: 'marketing', label: 'Marketing', icon: Tag, path: '/admin/marketing' },
    { id: 'reviews', label: 'Avis', icon: Star, path: '/admin/reviews', badge: notifications.reviews },
    { id: 'content', label: 'Contenu', icon: FileText, path: '/admin/content' },
    { id: 'settings', label: 'Paramètres', icon: Settings, path: '/admin/settings' },
  ];

  const handleLogout = async () => {
    try {
      const { logout } = await import('../../utils/api');
      await logout();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">E</span>
          <span className="logo-text">EcamSap Admin</span>
        </div>
        <span className="admin-badge">Admin</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id || router.pathname === item.path;
          
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                router.push(item.path);
                if (onNavigate) onNavigate(item.id);
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}

        <div className="nav-divider"></div>

        <button className="nav-item logout" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </nav>

      <style jsx>{`
        .admin-sidebar {
          width: 280px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          z-index: 100;
        }

        .sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #0066FF, #00D9FF);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 18px;
          color: white;
        }

        .logo-text {
          color: white;
          font-weight: 700;
          font-size: 16px;
        }

        .admin-badge {
          padding: 4px 12px;
          background: rgba(0, 102, 255, 0.2);
          color: #00D9FF;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .sidebar-nav {
          flex: 1;
          padding: 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          width: 100%;
          position: relative;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .nav-item.active {
          background: rgba(0, 102, 255, 0.2);
          color: #00D9FF;
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 60%;
          background: linear-gradient(135deg, #0066FF, #00D9FF);
          border-radius: 0 4px 4px 0;
        }

        .nav-badge {
          margin-left: auto;
          background: #FF6B35;
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          min-width: 20px;
          text-align: center;
        }

        .nav-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 12px 0;
        }

        .nav-item.logout {
          color: #FF6B35;
          margin-top: auto;
        }

        .nav-item.logout:hover {
          background: rgba(255, 107, 53, 0.1);
        }

        @media (max-width: 1024px) {
          .admin-sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .admin-sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
}
