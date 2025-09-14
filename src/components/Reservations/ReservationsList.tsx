import React, { useState } from 'react';
import { Calendar, Clock, MapPin, X, Filter, Search, User } from 'lucide-react';
import { useReservations } from '../../context/ReservationContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, isToday, isTomorrow, isWithin24Hours } from '../../utils/dateUtils';

interface ReservationsListProps {
  isAdminView?: boolean;
}

const ReservationsList: React.FC<ReservationsListProps> = ({ isAdminView = false }) => {
  const { user } = useAuth();
  const { reservations, cancelReservation, getUserReservations } = useReservations();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  if (!user) return null;

  const userReservations = isAdminView ? reservations : getUserReservations(user.id);

  const filteredReservations = userReservations
    .filter(reservation => {
      const matchesSearch = !searchTerm || 
        reservation.spaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (isAdminView && reservation.userName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = !statusFilter || reservation.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      upcoming: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      confirmed: 'Confirmada',
      upcoming: 'Próxima',
      'in-progress': 'En progreso',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const canCancelReservation = (reservation: any) => {
    if (reservation.status === 'cancelled' || reservation.status === 'completed') {
      return false;
    }
    
    // Can't cancel if within 24 hours
    return !isWithin24Hours(reservation.date, reservation.startTime);
  };

  const handleCancelReservation = (reservationId: string) => {
    if (window.confirm('¿Está seguro de que desea cancelar esta reserva?')) {
      cancelReservation(reservationId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isAdminView ? 'Todas las Reservas' : 'Mis Reservas'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isAdminView 
            ? 'Gestiona todas las reservas del sistema'
            : 'Administra tus reservas de espacios comunitarios'
          }
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={isAdminView ? "Buscar por espacio, evento o usuario..." : "Buscar reservas..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Todos los estados</option>
              <option value="confirmed">Confirmada</option>
              <option value="upcoming">Próxima</option>
              <option value="in-progress">En progreso</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredReservations.length} de {userReservations.length} reservas
        </div>
      </div>

      {/* Reservations List */}
      {filteredReservations.length > 0 ? (
        <div className="space-y-4">
          {filteredReservations.map(reservation => (
            <div key={reservation.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {reservation.spaceName}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isToday(reservation.date) ? 'bg-red-100 text-red-800' :
                        isTomorrow(reservation.date) ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {isToday(reservation.date) ? 'Hoy' :
                         isTomorrow(reservation.date) ? 'Mañana' :
                         formatDate(reservation.date)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                        {getStatusLabel(reservation.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(reservation.date)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{reservation.startTime} - {reservation.endTime}</span>
                    </div>

                    {isAdminView && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>{reservation.userName}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{reservation.event}</span>
                    </div>
                  </div>

                  {isAdminView && (
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Contacto:</strong> {reservation.userContact}
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Reservado el {formatDate(reservation.createdAt)}
                  </div>
                </div>

                {canCancelReservation(reservation) && (
                  <button
                    onClick={() => handleCancelReservation(reservation.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Cancelar reserva"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {isWithin24Hours(reservation.date, reservation.startTime) && 
               reservation.status !== 'cancelled' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Esta reserva está dentro de las próximas 24 horas y no puede ser cancelada.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter ? 'No se encontraron reservas' : 'No hay reservas'}
            </h3>
            <p className="text-gray-600 mb-4">
              {isAdminView 
                ? searchTerm || statusFilter 
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : 'No hay reservas registradas en el sistema'
                : searchTerm || statusFilter
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : 'No has hecho ninguna reserva aún'
              }
            </p>
            {(searchTerm || statusFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsList;