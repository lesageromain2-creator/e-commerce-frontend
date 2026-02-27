// frontend/components/admin/AdminHeader.js - EcamSap Admin
import { useState, useEffect } from 'react';
import { Search, Bell, User, ChevronDown, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/router';
import { adminSearch, logout } from '../../utils/api';
import { toast } from 'react-toastify';

export default function AdminHeader({ user, onSearch }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    // Polling pour notifications (toutes les 30s)
    const interval = setInterval(async () => {
      // TODO: Implémenter récupération notifications
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const results = await adminSearch(query);
      setSearchResults(results);
      setShowSearchResults(true);
      if (onSearch) onSearch(results);
    } catch (error) {
      console.error('Erreur recherche:', error);
    }
  };

  const getInitials = (firstname, lastname) => {
    return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
  };

  const handleLogout = async () => {
    try {
      toast.info('Déconnexion...');
      await logout();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <header className="admin-header">
      <div className="header-content">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher produits, commandes, clients..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          {showSearchResults && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result, idx) => (
                <div key={idx} className="search-result-item">
                  <span className="result-type">{result.type}</span>
                  <span className="result-title">{result.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="header-actions">
          <div className="notifications-container">
            <button
              className="icon-button"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                </div>
                {notifications.length === 0 ? (
                  <div className="empty-notifications">
                    <p>Aucune notification</p>
                  </div>
                ) : (
                  <div className="notifications-list">
                    {notifications.map((notif, idx) => (
                      <div key={idx} className="notification-item">
                        <p className="notification-text">{notif.message}</p>
                        <span className="notification-time">{notif.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="profile-container">
            <button
              className="profile-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" />
                ) : (
                  <span>{getInitials(user?.firstname, user?.lastname)}</span>
                )}
              </div>
              <div className="profile-info">
                <span className="profile-name">{user?.firstname} {user?.lastname}</span>
                <span className="profile-role">Administrateur</span>
              </div>
              <ChevronDown size={16} />
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="dropdown-item" onClick={() => router.push('/admin/profile')}>
                  <User size={16} />
                  <span>Mon profil</span>
                </div>
                <div className="dropdown-item" onClick={() => router.push('/admin/settings')}>
                  <Settings size={16} />
                  <span>Paramètres</span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Déconnexion</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-header {
          position: fixed;
          top: 0;
          left: 280px;
          right: 0;
          height: 80px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 90;
          padding: 0 32px;
        }

        .header-content {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .search-container {
          flex: 1;
          max-width: 500px;
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #C9A96E;
          background: rgba(255, 255, 255, 0.08);
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.5);
        }

        .search-results {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: rgba(10, 14, 39, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 8px;
          max-height: 300px;
          overflow-y: auto;
          z-index: 1000;
        }

        .search-result-item {
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .search-result-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .result-type {
          padding: 4px 8px;
          background: rgba(201, 169, 110, 0.2);
          color: #C9A96E;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .result-title {
          color: white;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-button {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .icon-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #FF6B35;
          color: white;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: 700;
          min-width: 18px;
          text-align: center;
        }

        .notifications-container {
          position: relative;
        }

        .notifications-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 360px;
          background: rgba(10, 14, 39, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          z-index: 1000;
          overflow: hidden;
        }

        .dropdown-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dropdown-header h3 {
          color: white;
          font-size: 16px;
          font-weight: 700;
        }

        .empty-notifications {
          padding: 40px 20px;
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
        }

        .notifications-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .notification-item {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background 0.2s;
        }

        .notification-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .notification-text {
          color: white;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .notification-time {
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
        }

        .profile-container {
          position: relative;
        }

        .profile-button {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .profile-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .profile-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #C9A96E, #8B7355);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          color: #1A1A1A;
          flex-shrink: 0;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 10px;
          object-fit: cover;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .profile-name {
          color: white;
          font-size: 14px;
          font-weight: 600;
        }

        .profile-role {
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 200px;
          background: rgba(10, 14, 39, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          z-index: 1000;
          overflow: hidden;
        }

        .dropdown-item {
          padding: 12px 16px;
          color: white;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .dropdown-item.danger {
          color: #FF6B35;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 4px 0;
        }

        @media (max-width: 1024px) {
          .admin-header {
            left: 0;
          }
        }
      `}</style>
    </header>
  );
}
