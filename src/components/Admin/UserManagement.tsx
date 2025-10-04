import React, { useCallback, useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type UserManagementProps = {
  onBack?: () => void;
};

type Profile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'email' | 'phone' | 'role' | 'created_at'
>;

const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, role, created_at')
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
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: nextRole })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      await fetchUsers();
    } catch (updateErr) {
      const message = updateErr instanceof Error ? updateErr.message : 'No se pudo actualizar el rol del usuario.';
      setError(message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeactivateUser = async (user: Profile) => {
    if (!user.id) return;

    try {
      setUpdatingUserId(user.id);
      setError(null);
      const { error: deactivateError } = await supabase
        .from('profiles')
        .update({ is_active: false } as Record<string, unknown>)
        .eq('id', user.id);

      if (deactivateError) {
        throw deactivateError;
      }

      await fetchUsers();
    } catch (deactivateErr) {
      const message =
        deactivateErr instanceof Error ? deactivateErr.message : 'No se pudo desactivar al usuario seleccionado.';
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

        {!loading && !error &&
          users.map((user) => (
            <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{user.full_name || 'Sin nombre'}</p>
                <p className="text-sm text-gray-500">{user.email || 'Sin correo'}</p>
                <p className="text-sm text-gray-400">
                  Registrado el {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/D'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
                  Rol: {user.role ?? 'N/D'}
                </span>
                <button
                  onClick={() => handleToggleRole(user)}
                  disabled={updatingUserId === user.id}
                  className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingUserId === user.id ? 'Actualizando...' : 'Cambiar rol'}
                </button>
                <button
                  onClick={() => handleDeactivateUser(user)}
                  disabled={updatingUserId === user.id}
                  className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingUserId === user.id ? 'Actualizando...' : 'Desactivar'}
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default UserManagement;
