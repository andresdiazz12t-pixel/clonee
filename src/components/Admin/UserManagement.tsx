import React, { useCallback, useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type UserManagementProps = {
  onBack?: () => void;
};

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  identification_number: string | null;
  role: 'admin' | 'user' | null;
  created_at: string | null;
  is_active: boolean | null;
};

const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, identification_number, role, is_active, created_at')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setUsers(data ?? []);
    } catch (fetchErr) {
      const message = fetchErr instanceof Error ? fetchErr.message : 'No se pudieron cargar los usuarios.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'admin'
        ? user.role === 'admin'
        : user.role === 'user' || user.role === null);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? user.is_active === true : user.is_active === false);

    return matchesRole && matchesStatus;
  });

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleToggleRole = async (user: Profile) => {
    if (!user.id) return;

    const currentRole = user.role === 'admin' ? 'admin' : 'user';
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';

    try {
      setUpdatingUserId(user.id);
      setError(null);
      const { error: rpcError } = await supabase.rpc('set_user_role', {
        user_id: user.id,
        new_role: nextRole,
      });

      if (rpcError) {
        throw rpcError;
      }

      await fetchUsers();
    } catch (updateErr) {
      const message = updateErr instanceof Error ? updateErr.message : 'No se pudo actualizar el rol del usuario.';
      setError(message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleToggleActive = async (user: Profile) => {
    if (!user.id) return;

    const currentState = user.is_active ?? false;
    const nextState = !currentState;

    try {
      setUpdatingUserId(user.id);
      setError(null);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_active: nextState })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      await fetchUsers();
    } catch (updateErr) {
      const message =
        updateErr instanceof Error
          ? updateErr.message
          : 'No se pudo actualizar el estado del usuario seleccionado.';
      setError(message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600">Revisa y administra los usuarios registrados en la plataforma.</p>
          </div>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Volver al Panel
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <label className="text-sm font-medium text-gray-700" htmlFor="role-filter">
            Filtrar por rol
          </label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="admin">Administradores</option>
            <option value="user">Usuarios</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <label className="text-sm font-medium text-gray-700" htmlFor="status-filter">
            Estado de cuenta
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        {loading && (
          <div className="p-6 text-center text-gray-500">Cargando usuarios...</div>
        )}

        {error && !loading && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border-b border-red-100">{error}</div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="p-6 text-center text-gray-500">No se encontraron usuarios registrados.</div>
        )}

        {!loading && !error && users.length > 0 && filteredUsers.length === 0 && (
          <div className="p-6 text-center text-gray-500">No hay resultados para los filtros seleccionados.</div>
        )}

        {!loading && !error &&
          filteredUsers.map((user) => {
            const isActive = user.is_active ?? false;

            return (
              <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{user.full_name ?? 'Sin nombre'}</p>
                  <p className="text-sm text-gray-500">{user.email ?? 'Sin correo'}</p>
                  <p className="text-sm text-gray-500">
                    Identificación: {user.identification_number ?? 'N/D'}
                  </p>
                  <p className="text-sm text-gray-500">Teléfono: {user.phone ?? 'N/D'}</p>
                  <p className="text-sm text-gray-400">
                    Registrado el {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/D'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
                    Rol: {user.role ?? 'N/D'}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}
                  >
                  Estado: {isActive ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    onClick={() => handleToggleRole(user)}
                    disabled={updatingUserId === user.id}
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingUserId === user.id ? 'Actualizando...' : 'Cambiar rol'}
                  </button>
                  <button
                    onClick={() => handleToggleActive(user)}
                    disabled={updatingUserId === user.id}
                    className={`px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isActive
                        ? 'text-red-600 border-red-200 hover:bg-red-50'
                        : 'text-green-600 border-green-200 hover:bg-green-50'
                    }`}
                  >
                    {updatingUserId === user.id
                      ? 'Actualizando...'
                    : isActive
                      ? 'Desactivar'
                      : 'Activar'}
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default UserManagement;
