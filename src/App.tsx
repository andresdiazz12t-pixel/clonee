import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SpaceProvider } from './context/SpaceContext';
import { ReservationProvider } from './context/ReservationContext';
import Header from './components/Layout/Header';
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
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <main>
        {renderCurrentView()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SpaceProvider>
        <ReservationProvider>
          <AppContent />
        </ReservationProvider>
      </SpaceProvider>
    </AuthProvider>
  );
};

export default App;