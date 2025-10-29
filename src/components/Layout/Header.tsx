import React, { useState } from 'react';
import { User, LogOut, Settings, Calendar, Home, UserCircle, Menu, X, LayoutGrid } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const navigationItems = user.role === 'admin'
    ? [
        { id: 'dashboard', label: 'Inicio', icon: Home },
        { id: 'spaces', label: 'Espacios', icon: LayoutGrid },
        { id: 'calendar', label: 'Calendario', icon: Calendar },
        { id: 'all-reservations', label: 'Reservas', icon: Calendar },
        { id: 'profile', label: 'Perfil', icon: UserCircle },
        { id: 'admin-panel', label: 'Admin', icon: Settings },
      ]
    : [
        { id: 'dashboard', label: 'Inicio', icon: Home },
        { id: 'spaces', label: 'Espacios', icon: LayoutGrid },
        { id: 'calendar', label: 'Calendario', icon: Calendar },
        { id: 'my-reservations', label: 'Mis Reservas', icon: Calendar },
        { id: 'profile', label: 'Perfil', icon: UserCircle },
      ];

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-md">
                <LayoutGrid className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-neutral-900 hidden sm:block">
                Espacios Comunitarios
              </h1>
            </div>

            <nav className="hidden lg:flex gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                      currentView === item.id
                        ? 'text-primary-700 bg-primary-50 shadow-sm'
                        : 'text-neutral-700 hover:text-primary-600 hover:bg-neutral-50'
                    }`}
                    aria-current={currentView === item.id ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {currentView === item.id && (
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary-600 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-neutral-50 rounded-lg">
              <div className={`badge ${
                user.role === 'admin'
                  ? 'badge-primary'
                  : 'badge-success'
              }`}>
                {user.role === 'admin' ? 'Admin' : 'Usuario'}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-neutral-900">
                  {user.fullName}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Salir</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white animate-slide-in">
          <div className="px-4 py-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentView === item.id
                      ? 'text-primary-700 bg-primary-50 shadow-sm'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-3 mt-3 border-t border-neutral-200">
              <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-lg mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-900">{user.fullName}</div>
                  <div className={`badge badge-sm ${
                    user.role === 'admin' ? 'badge-primary' : 'badge-success'
                  }`}>
                    {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;