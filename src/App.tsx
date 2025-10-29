import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SpaceProvider } from './context/SpaceContext';
import { ReservationProvider } from './context/ReservationContext';
import { ToastProvider } from './hooks/useToast';
import { LoadingSpinner } from './components/UI/LoadingSpinner';
import Header from './components/Layout/Header';
import Breadcrumbs from './components/UI/Breadcrumbs';
import LoginForm from './components/Auth/LoginForm';
import Dashboard from './components/Dashboard/Dashboard';
import SpacesList from './components/Spaces/SpacesList';
import ReservationsList from './components/Reservations/ReservationsList';
import AdminPanel from './components/Admin/AdminPanel';
import UserManagement from './components/Admin/UserManagement';
import ReportsPanel from './components/Admin/ReportsPanel';
import AdvancedSettings from './components/Admin/AdvancedSettings';
import ProfileSettings from './components/Profile/ProfileSettings';
import CalendarView from './pages/CalendarView';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Cargando..." size="lg" />;
  }

  if (!user) {
    return <LoginForm />;
  }

  const getBreadcrumbs = () => {
    const breadcrumbsMap: Record<string, { label: string; view?: string }[]> = {
      'dashboard': [],
      'spaces': [{ label: 'Espacios' }],
      'my-reservations': [{ label: 'Mis Reservas' }],
      'all-reservations': [{ label: 'Todas las Reservas' }],
      'calendar': [{ label: 'Calendario' }],
      'admin-panel': [{ label: 'Administración' }],
      'profile': [{ label: 'Mi Perfil' }],
      'admin-users': [
        { label: 'Administración', view: 'admin-panel' },
        { label: 'Gestión de Usuarios' }
      ],
      'admin-reports': [
        { label: 'Administración', view: 'admin-panel' },
        { label: 'Reportes' }
      ],
      'admin-advanced-settings': [
        { label: 'Administración', view: 'admin-panel' },
        { label: 'Configuración Avanzada' }
      ],
    };
    return breadcrumbsMap[currentView] || [];
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'spaces':
        return <SpacesList />;
      case 'my-reservations':
        return <ReservationsList isAdminView={false} />;
      case 'all-reservations':
        return <ReservationsList isAdminView={true} />;
      case 'calendar':
        return <CalendarView />;
      case 'admin-panel':
        return user.role === 'admin' ? (
          <AdminPanel
            onManageUsers={() => setCurrentView('admin-users')}
            onShowReports={() => setCurrentView('admin-reports')}
            onOpenAdvancedSettings={() => setCurrentView('admin-advanced-settings')}
          />
        ) : (
          <Dashboard onViewChange={setCurrentView} />
        );
      case 'profile':
        return <ProfileSettings />;
      case 'admin-users':
        return user.role === 'admin' ? (
          <UserManagement onBack={() => setCurrentView('admin-panel')} />
        ) : (
          <Dashboard onViewChange={setCurrentView} />
        );
      case 'admin-reports':
        return user.role === 'admin' ? (
          <ReportsPanel onBack={() => setCurrentView('admin-panel')} />
        ) : (
          <Dashboard onViewChange={setCurrentView} />
        );
      case 'admin-advanced-settings':
        return user.role === 'admin' ? (
          <AdvancedSettings onBack={() => setCurrentView('admin-panel')} />
        ) : (
          <Dashboard onViewChange={setCurrentView} />
        );
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <main className="animate-fade-in">
        {breadcrumbs.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <Breadcrumbs items={breadcrumbs} onNavigate={setCurrentView} />
          </div>
        )}
        {renderCurrentView()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <SpaceProvider>
          <ReservationProvider>
            <AppContent />
          </ReservationProvider>
        </SpaceProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;