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
    <header className="bg-white/80 backdrop-blur-lg shadow-soft border-b border-neutral-200/50 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-glow ring-2 ring-primary-500/20">
                <LayoutGrid className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-neutral-900 leading-none">
                  Espacios Comunitarios
                </h1>
                <p className="text-xs text-neutral-500 mt-0.5">Sistema de Gestión</p>
              </div>
            </div>

            <nav className="hidden lg:flex gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      currentView === item.id
                        ? 'text-white bg-gradient-to-r from-primary-600 to-primary-700 shadow-md scale-[1.02]'
                        : 'text-neutral-700 hover:text-primary-700 hover:bg-primary-50/80 hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`h-4 w-4 transition-transform duration-300 ${
                      currentView === item.id ? '' : 'group-hover:scale-110'
                    }`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 bg-gradient-to-br from-neutral-50 to-white rounded-xl border border-neutral-200/60 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-primary-500/20 shadow-md">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    user.role === 'admin' ? 'bg-primary-600' : 'bg-success-500'
                  }`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-neutral-900 leading-tight">
                    {user.fullName}
                  </span>
                  <span className={`text-xs font-medium ${
                    user.role === 'admin' ? 'text-primary-600' : 'text-success-600'
                  }`}>
                    {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-neutral-700 hover:text-error-600 hover:bg-error-50 transition-all duration-300 border border-transparent hover:border-error-200 shadow-sm hover:shadow-md"
            >
              <LogOut className="h-4 w-4" />
              <span>Salir</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-primary-50 transition-all duration-300 border border-transparent hover:border-primary-200 active:scale-95"
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-neutral-700" /> : <Menu className="h-6 w-6 text-neutral-700" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200/50 bg-white/95 backdrop-blur-lg animate-slide-in">
          <div className="px-4 py-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    currentView === item.id
                      ? 'text-white bg-gradient-to-r from-primary-600 to-primary-700 shadow-md'
                      : 'text-neutral-700 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-4 mt-3 border-t border-neutral-200/60">
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-neutral-50 to-white rounded-xl border border-neutral-200/60 mb-3 shadow-sm">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 flex items-center justify-center text-white font-bold ring-2 ring-primary-500/20 shadow-md">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    user.role === 'admin' ? 'bg-primary-600' : 'bg-success-500'
                  }`} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900 leading-tight">{user.fullName}</div>
                  <div className={`text-xs font-medium mt-0.5 ${
                    user.role === 'admin' ? 'text-primary-600' : 'text-success-600'
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
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-error-600 hover:bg-error-50 transition-all duration-300 border border-transparent hover:border-error-200 shadow-sm hover:shadow-md"
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