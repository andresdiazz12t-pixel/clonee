import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Users, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSpaces } from '../../context/SpaceContext';
import { useReservations } from '../../context/ReservationContext';
import { formatDate, isToday, isTomorrow, parseLocalDate } from '../../utils/dateUtils';
import { storage, STORAGE_KEYS } from '../../utils/storage';
import { User as UserType } from '../../types';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const { user } = useAuth();
  const { spaces } = useSpaces();
  const { reservations, reservationsError, reloadReservations, getUserReservations } = useReservations();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [isLoadingUserCount, setIsLoadingUserCount] = useState<boolean>(true);
  const [userCountError, setUserCountError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUserCount = async () => {
      setIsLoadingUserCount(true);
      try {
        const users = storage.get<UserType[]>(STORAGE_KEYS.USERS) || [];

        if (isMounted) {
          setUserCount(users.length);
          setUserCountError(null);
        }
      } catch (error) {
        if (isMounted) {
          setUserCountError('No se pudo obtener el total de usuarios registrados.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingUserCount(false);
        }
      }
    };

    fetchUserCount();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!user) return null;

  const activeSpaces = spaces.filter(space => space.isActive);
  const userReservations = getUserReservations(user.id);
  const todayReservations = reservations.filter(res => isToday(res.date) && res.status !== 'cancelled');
  const now = new Date();
  const upcomingReservations = userReservations
    .filter(res => {
      const reservationDate = parseLocalDate(res.date);
      return reservationDate >= now && res.status !== 'cancelled';
    })
    .slice(0, 3);

  const stats = user.role === 'admin' 
    ? [
        { label: 'Espacios Activos', value: activeSpaces.length, icon: MapPin, color: 'blue' },
        { label: 'Reservas Hoy', value: todayReservations.length, icon: Calendar, color: 'green' },
        { label: 'Total Reservas', value: reservations.filter(r => r.status !== 'cancelled').length, icon: Users, color: 'purple' },
        {
          label: 'Usuarios Registrados',
          value: isLoadingUserCount ? '...' : userCount ?? 0,
          icon: Users,
          color: 'orange',
        },
      ]
    : [
        { label: 'Mis Reservas', value: userReservations.length, icon: Calendar, color: 'blue' },
        { label: 'Próximas', value: upcomingReservations.length, icon: Clock, color: 'green' },
        { label: 'Espacios Disponibles', value: activeSpaces.length, icon: MapPin, color: 'purple' },
      ];

  const getStatGradient = (color: string) => {
    const gradients = {
      blue: 'from-primary-500 to-primary-600',
      green: 'from-success-500 to-success-600',
      purple: 'from-primary-600 to-primary-700',
      orange: 'from-warning-500 to-warning-600',
    };
    return gradients[color as keyof typeof gradients];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8 animate-slide-in-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center text-white font-bold text-xl shadow-glow ring-4 ring-primary-500/10">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
              Bienvenido, {user.fullName}
            </h1>
            <p className="text-neutral-600 mt-1 text-base">
              {user.role === 'admin'
                ? 'Panel de administración de espacios comunitarios'
                : 'Gestiona tus reservas de espacios comunitarios'
              }
            </p>
          </div>
        </div>
      </div>

      {reservationsError && (
        <div className="mb-8 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <p className="font-medium">{reservationsError}</p>
          <button
            onClick={reloadReservations}
            className="mt-3 inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {userCountError && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-4">
          <p className="font-medium">{userCountError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="stat-card animate-slide-in-up"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-600 mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${getStatGradient(stat.color)} shadow-md`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-neutral-100/50 p-6 hover:shadow-lg transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Acciones Rápidas</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => onViewChange('spaces')}
              className="action-card group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-md group-hover:shadow-lg transition-shadow">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">Ver Espacios</h3>
                    <p className="text-sm text-neutral-600">Explora los espacios disponibles</p>
                  </div>
                </div>
                <div className="text-primary-600 group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </button>

            <button
              onClick={() => onViewChange('calendar')}
              className="action-card group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-md group-hover:shadow-lg transition-shadow">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">Calendario de reservas</h3>
                    <p className="text-sm text-neutral-600">Visualiza disponibilidad mensual y semanal</p>
                  </div>
                </div>
                <div className="text-primary-600 group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </button>

            <button
              onClick={() => onViewChange(user.role === 'admin' ? 'all-reservations' : 'my-reservations')}
              className="action-card group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-success-500 to-success-600 shadow-md group-hover:shadow-lg transition-shadow">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">
                      {user.role === 'admin' ? 'Gestionar Reservas' : 'Mis Reservas'}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {user.role === 'admin' ? 'Ver todas las reservas del sistema' : 'Administra tus reservas'}
                    </p>
                  </div>
                </div>
                <div className="text-primary-600 group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </button>

            <button
              onClick={() => onViewChange('profile')}
              className="action-card group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-md group-hover:shadow-lg transition-shadow">
                    <UserCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">Mi Perfil</h3>
                    <p className="text-sm text-neutral-600">Actualiza tus datos personales y de contacto</p>
                  </div>
                </div>
                <div className="text-primary-600 group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </button>

            {user.role === 'admin' && (
              <button
                onClick={() => onViewChange('admin-panel')}
                className="action-card group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-md group-hover:shadow-lg transition-shadow">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">Panel Administrativo</h3>
                      <p className="text-sm text-neutral-600">Gestionar espacios y configuración</p>
                    </div>
                  </div>
                  <div className="text-primary-600 group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-neutral-100/50 p-6 hover:shadow-lg transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '350ms' }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center shadow-md">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">
              {user.role === 'admin' ? 'Actividad Reciente' : 'Próximas Reservas'}
            </h2>
          </div>
          
          {user.role === 'admin' ? (
            <div className="space-y-4">
              {todayReservations.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-4 bg-gradient-to-br from-neutral-50 to-white rounded-xl border border-neutral-200/50 hover:shadow-md transition-all duration-300 hover:border-primary-300">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">{reservation.spaceName}</h3>
                    <p className="text-sm text-neutral-600 mt-1">
                      {reservation.userName} • {reservation.startTime} - {reservation.endTime}
                    </p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                    reservation.status === 'confirmed' ? 'bg-gradient-to-r from-success-100 to-success-200 text-success-800 border border-success-300' :
                    reservation.status === 'upcoming' ? 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 border border-primary-300' :
                    'bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-800 border border-neutral-300'
                  }`}>
                    {reservation.status === 'confirmed' ? 'Confirmada' :
                     reservation.status === 'upcoming' ? 'Próxima' : 'En progreso'}
                  </span>
                </div>
              ))}
              {todayReservations.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-600 font-medium">
                    No hay reservas para hoy
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="p-4 bg-gradient-to-br from-neutral-50 to-white rounded-xl border border-neutral-200/50 hover:shadow-md transition-all duration-300 hover:border-primary-300">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-neutral-900 flex-1">{reservation.spaceName}</h3>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                      isToday(reservation.date) ? 'bg-gradient-to-r from-error-100 to-error-200 text-error-800 border border-error-300' :
                      isTomorrow(reservation.date) ? 'bg-gradient-to-r from-warning-100 to-warning-200 text-warning-800 border border-warning-300' :
                      'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 border border-primary-300'
                    }`}>
                      {isToday(reservation.date) ? 'Hoy' :
                       isTomorrow(reservation.date) ? 'Mañana' :
                       formatDate(reservation.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                    <Clock className="h-4 w-4" />
                    <span>{reservation.startTime} - {reservation.endTime}</span>
                  </div>
                  <p className="text-sm text-neutral-700 font-medium">{reservation.event}</p>
                </div>
              ))}
              {upcomingReservations.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-600 mb-4 font-medium">No tienes reservas próximas</p>
                  <button
                    onClick={() => onViewChange('spaces')}
                    className="btn btn-primary"
                  >
                    Hacer una reserva
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;