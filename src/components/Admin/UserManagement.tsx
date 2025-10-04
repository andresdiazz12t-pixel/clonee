import React from 'react';
import { Users } from 'lucide-react';

type UserManagementProps = {
  onBack?: () => void;
};

const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
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
        {[1, 2, 3].map((user) => (
          <div key={user} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Usuario Ejemplo {user}</p>
              <p className="text-sm text-gray-500">usuario{user}@correo.com</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50">
                Ver detalles
              </button>
              <button className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50">
                Desactivar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
