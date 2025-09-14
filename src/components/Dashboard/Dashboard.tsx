import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSpaces } from '../../context/SpaceContext';
import { useReservations } from '../../context/ReservationContext';
import { formatDate, isToday, isTomorrow } from '../../utils/dateUtils';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const { user } = useAuth();
  const { spaces } = useSpaces();
  const { reservations, getUserReservations } = useReservations();

  if (!user) return null;

  const activeSpaces = spaces.filter(space => space.isActive);
  const userReservations = getUserReservations(user.id);
  const todayReservations = reservations.filter(res => isToday(res.date) && res.status !== 'cancelled');
  const upcomingReservations = userReservations.filter(res => 
    new Date(res.date) >= new Date() && res.status !== 'cancelled'
  ).slice(0, 3);

  const stats = user.role === 'admin' 
    ? [
        { label: 'Espacios Activos', value: activeSpaces.length, icon: MapPin, color: 'blue' },
        { label: 'Reservas Hoy', value: todayReservations.length, icon: Calendar, color: 'green' },
        { label: 'Total Reservas', value: reservations.filter(r => r.status !== 'cancelled').length, icon: Users, color: 'purple' },
        { label: 'Usuarios Registrados', value: 25, icon: Users, color: 'orange' },
      ]
    : [
        { label: 'Mis Reservas', value: userReservations.length, icon: Calendar, color: 'blue' },
        { label: 'Próximas', value: upcomingReservations.length, icon: Clock, color: 'green' },
        { label: 'Espacios Disponibles', value: activeSpaces.length, icon: MapPin, color: 'purple' },
      ];

  const getStatColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user.fullName}
        </h1>
        <p className="text-gray-600 mt-2">
          {user.role === 'admin' 
            ? 'Panel de administración de espacios comunitarios' 
            : 'Gestiona tus reservas de espacios comunitarios'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${getStatColor(stat.color)}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <button
              onClick={() => onViewChange('spaces')}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Ver Espacios</h3>
                  <p className="text-sm text-gray-500">Explora los espacios disponibles</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onViewChange(user.role === 'admin' ? 'all-reservations' : 'my-reservations')}
              className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {user.role === 'admin' ? 'Gestionar Reservas' : 'Mis Reservas'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {user.role === 'admin' ? 'Ver todas las reservas del sistema' : 'Administra tus reservas'}
                  </p>
                </div>
              </div>
            </button>

            {user.role === 'admin' && (
              <button
                onClick={() => onViewChange('admin-panel')}
                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Panel Administrativo</h3>
                    <p className="text-sm text-gray-500">Gestionar espacios y configuración</p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {user.role === 'admin' ? 'Actividad Reciente' : 'Próximas Reservas'}
          </h2>
          
          {user.role === 'admin' ? (
            <div className="space-y-4">
              {todayReservations.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{reservation.spaceName}</h3>
                    <p className="text-sm text-gray-500">
                      {reservation.userName} - {reservation.startTime} - {reservation.endTime}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    reservation.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {reservation.status === 'confirmed' ? 'Confirmada' :
                     reservation.status === 'upcoming' ? 'Próxima' : 'En progreso'}
                  </span>
                </div>
              ))}
              {todayReservations.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No hay reservas para hoy
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{reservation.spaceName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isToday(reservation.date) ? 'bg-red-100 text-red-800' :
                      isTomorrow(reservation.date) ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {isToday(reservation.date) ? 'Hoy' :
                       isTomorrow(reservation.date) ? 'Mañana' :
                       formatDate(reservation.date)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {reservation.startTime} - {reservation.endTime}
                  </p>
                  <p className="text-sm text-gray-500">{reservation.event}</p>
                </div>
              ))}
              {upcomingReservations.length === 0 && (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No tienes reservas próximas</p>
                  <button
                    onClick={() => onViewChange('spaces')}
                    className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
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