/**
 * Gestion des rôles utilisateurs - Admin
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Users, Shield, Package, Search, Loader2, ChevronDown,
  Mail, Calendar, ShoppingBag 
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
  created_at: string;
  email_verified: boolean;
  orders_count: number;
  total_spent: string;
}

interface Role {
  name: string;
  description: string;
  permissions: string[];
}

export default function RolesManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Record<string, Role>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [changingRole, setChangingRole] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedRole, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [rolesRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/admin/roles`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/users`, {
          params: { role: selectedRole || undefined, search: search || undefined },
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (rolesRes.data.success) setRoles(rolesRes.data.roles);
      if (usersRes.data.success) setUsers(usersRes.data.users);
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir changer le rôle de cet utilisateur ?`)) {
      return;
    }

    setChangingRole(userId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchData();
      }
    } catch (error: any) {
      console.error('Erreur changement rôle:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du changement de rôle');
    } finally {
      setChangingRole(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { className: string }> = {
      admin: { className: 'bg-red-100 text-red-800 border-red-200' },
      dropshipper: { className: 'bg-purple-100 text-purple-800 border-purple-200' },
      user: { className: 'bg-gray-100 text-gray-800 border-gray-200' },
    };
    const badge = badges[role] || badges.user;
    return (
      <span className={`px-3 py-1 rounded-capsule text-xs font-medium border ${badge.className}`}>
        {roles[role]?.name || role}
      </span>
    );
  };

  return (
    <>
      <Head>
        <title>Gestion des rôles | Admin</title>
      </Head>

      <div className="min-h-screen bg-offwhite">
        {/* Header */}
        <header className="bg-white border-b border-pearl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading text-2xl text-charcoal flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  Gestion des rôles
                </h1>
                <p className="text-small text-charcoal/60 mt-1">
                  Gérez les permissions et rôles des utilisateurs
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Rôles disponibles */}
          <section>
            <h2 className="font-heading text-xl text-charcoal mb-4">Rôles disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(roles).map(([key, role]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-refined p-6 border border-pearl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {key === 'admin' && <Shield className="w-6 h-6 text-red-600" />}
                    {key === 'dropshipper' && <Package className="w-6 h-6 text-purple-600" />}
                    {key === 'user' && <Users className="w-6 h-6 text-gray-600" />}
                    <h3 className="font-heading text-lg text-charcoal">{role.name}</h3>
                  </div>
                  <p className="text-small text-charcoal/70 mb-4">{role.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-charcoal/60 uppercase">Permissions :</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((perm, i) => (
                        <span key={i} className="text-xs bg-pearl/50 text-charcoal/70 px-2 py-1 rounded">
                          {perm}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="text-xs text-charcoal/50">+{role.permissions.length - 3}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Filtres */}
          <section>
            <div className="bg-white rounded-refined p-4 border border-pearl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                  <input
                    type="text"
                    placeholder="Rechercher par email ou nom..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-pearl rounded-refined focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                {/* Filtre rôle */}
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-4 py-2 border border-pearl rounded-refined focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  <option value="">Tous les rôles</option>
                  {Object.entries(roles).map(([key, role]) => (
                    <option key={key} value={key}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Liste utilisateurs */}
          <section>
            <div className="bg-white rounded-refined border border-pearl overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-gold animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-pearl/30 border-b border-pearl">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 uppercase tracking-wider">
                          Rôle actuel
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 uppercase tracking-wider">
                          Commandes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 uppercase tracking-wider">
                          Total dépensé
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 uppercase tracking-wider">
                          Inscrit le
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/70 uppercase tracking-wider">
                          Changer le rôle
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pearl">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-charcoal/60">
                            Aucun utilisateur trouvé
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="hover:bg-pearl/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center font-medium text-gold">
                                  {user.firstname?.[0]}{user.lastname?.[0]}
                                </div>
                                <div>
                                  <p className="text-small font-medium text-charcoal">
                                    {user.firstname} {user.lastname}
                                  </p>
                                  <p className="text-xs text-charcoal/60 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getRoleBadge(user.role)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-small text-charcoal">
                                <ShoppingBag className="w-4 h-4" />
                                {user.orders_count}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-small font-semibold text-charcoal">
                              {parseFloat(user.total_spent).toFixed(2)} €
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-small text-charcoal/60">
                                <Calendar className="w-4 h-4" />
                                {new Date(user.created_at).toLocaleDateString('fr-FR')}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={user.role}
                                onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                disabled={changingRole === user.id}
                                className="px-3 py-1.5 border border-pearl rounded-refined text-small focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
                              >
                                {Object.entries(roles).map(([key, role]) => (
                                  <option key={key} value={key}>
                                    {role.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
