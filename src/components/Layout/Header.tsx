import React from 'react';
import { User, LogOut, Settings, Calendar, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const navigationItems = user.role === 'admin' 
    ? [
        { id: 'dashboard', label: 'Inicio', icon: Home },
        { id: 'spaces', label: 'Espacios', icon: Calendar },
        { id: 'all-reservations', label: 'Todas las Reservas', icon: Calendar },
        { id: 'admin-panel', label: 'Panel Admin', icon: Settings },
      ]
    : [
        { id: 'dashboard', label: 'Inicio', icon: Home },
        { id: 'spaces', label: 'Espacios', icon: Calendar },
        { id: 'my-reservations', label: 'Mis Reservas', icon: Calendar },
      ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Espacios Comunitarios
              </h1>
            </div>

            <nav className="hidden md:flex space-x-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === item.id
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
              </div>
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {user.fullName}
              </span>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-4 py-2 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === item.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;