import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Save, CheckCircle } from 'lucide-react';
import { useSpaces } from '../../context/SpaceContext';
import { useReservations } from '../../context/ReservationContext';
import { useAuth } from '../../context/AuthContext';
import { Reservation } from '../../types';
import { timeToMinutes, getTodayLocalISO, parseLocalDate } from '../../utils/dateUtils';

interface ReservationModalProps {
  spaceId: string;
  onClose: () => void;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ spaceId, onClose, initialDate, initialStartTime, initialEndTime }) => {
  const { user } = useAuth();
  const { getSpace } = useSpaces();
  const {
    addReservation,
    fetchSpaceSchedule,
    isTimeSlotAvailable,
    reservations,
    maxAdvanceDays,
    maxConcurrentReservations,
    getUserReservations,
    isSettingsLoading,
    settingsError,
  } = useReservations();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const space = getSpace(spaceId);

  const [formData, setFormData] = useState({
    date: initialDate ?? '',
    startTime: initialStartTime ?? '',
    endTime: initialEndTime ?? '',
    event: '',
  });

  const [existingReservations, setExistingReservations] = useState<Reservation[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  useEffect(() => {
    const today = getTodayLocalISO();
    setFormData(prev => ({
      ...prev,
      date: (() => {
        const candidate = initialDate ?? prev.date;
        return candidate && candidate.trim() !== '' ? candidate : today;
      })(),
      startTime: initialStartTime ?? prev.startTime,
      endTime: initialEndTime ?? prev.endTime,
    }));
  }, [initialDate, initialStartTime, initialEndTime, spaceId]);

  useEffect(() => {
    let isSubscribed = true;

    const loadSchedule = async () => {
      if (!formData.date) {
        setExistingReservations([]);
        return;
      }

      setScheduleLoading(true);
      setScheduleError(null);

      try {
        const reservations = await fetchSpaceSchedule(spaceId, formData.date);
        if (isSubscribed) {
          setExistingReservations(reservations);
        }
      } catch (err) {
        console.error(err);
        if (isSubscribed) {
          setExistingReservations([]);
          setScheduleError('No se pudieron cargar las reservas existentes.');
        }
      } finally {
        if (isSubscribed) {
          setScheduleLoading(false);
        }
      }
    };

    loadSchedule();

    return () => {
      isSubscribed = false;
    };
  }, [fetchSpaceSchedule, formData.date, reservations, spaceId]);

  if (!space || !user) return null;

  if (isSettingsLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Cargando configuraciones
          </h3>
          <p className="text-gray-600">
            Estamos obteniendo las configuraciones del sistema para crear tu reserva.
          </p>
          <div className="mt-4 flex justify-center gap-1">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
          <button
            onClick={onClose}
            className="mt-6 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No se pudo cargar la configuración
          </h3>
          <p className="text-gray-600">
            {settingsError}
          </p>
          <button
            onClick={onClose}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const generateTimeOptions = () => {
    const options = [];
    const start = timeToMinutes(space.operatingHours.start);
    const end = timeToMinutes(space.operatingHours.end);
    
    for (let minutes = start; minutes < end; minutes += 30) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      options.push(timeString);
    }
    
    return options;
  };

  const timeOptions = generateTimeOptions();

  const validateTimeSlot = async () => {
    if (!formData.startTime || !formData.endTime) return '';

    const startMinutes = timeToMinutes(formData.startTime);
    const endMinutes = timeToMinutes(formData.endTime);

    if (startMinutes >= endMinutes) {
      return 'La hora de fin debe ser posterior a la hora de inicio';
    }

    if (endMinutes - startMinutes > 4 * 60) {
      return 'La reserva no puede exceder 4 horas';
    }

    if (endMinutes - startMinutes < 60) {
      return 'La reserva mínima es de 1 hora';
    }

    const available = await isTimeSlotAvailable(spaceId, formData.date, formData.startTime, formData.endTime);
    if (!available) {
      return 'El horario seleccionado no está disponible';
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validationError = await validateTimeSlot();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    // Check if date is not in the past
    const selectedDate = parseLocalDate(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('No se pueden hacer reservas para fechas pasadas');
      setLoading(false);
      return;
    }

    if (maxAdvanceDays !== null) {
      const maxAllowedDate = new Date(today);
      maxAllowedDate.setDate(maxAllowedDate.getDate() + maxAdvanceDays);

      if (selectedDate > maxAllowedDate) {
        setError(`No puedes reservar con más de ${maxAdvanceDays} días de anticipación.`);
        setLoading(false);
        return;
      }
    }

    if (maxConcurrentReservations !== null) {
      const activeReservations = getUserReservations(user.id).filter((reservation) => {
        const reservationDate = parseLocalDate(reservation.date);
        reservationDate.setHours(0, 0, 0, 0);
        return reservationDate >= today;
      });

      if (activeReservations.length >= maxConcurrentReservations) {
        setError(`Has alcanzado el máximo de ${maxConcurrentReservations} reservas activas permitidas.`);
        setLoading(false);
        return;
      }
    }

    const reservationData = {
      spaceId: space.id,
      spaceName: space.name,
      userId: user.id,
      userName: user.fullName,
      userContact: user.phone,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      event: formData.event,
    };

    const success = await addReservation(reservationData);

    if (success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setError('No se pudo crear la reserva. El horario puede estar ocupado.');
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center animate-slide-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¡Reserva Confirmada!
          </h3>
          <p className="text-gray-600 mb-4">
            Tu reserva para {space.name} ha sido confirmada exitosamente.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span><strong>Fecha:</strong> {parseLocalDate(formData.date).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span><strong>Horario:</strong> {formData.startTime} - {formData.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                <span><strong>Evento:</strong> {formData.event}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Cerrando automáticamente...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Reservar {space.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Horario: {space.operatingHours.start} - {space.operatingHours.end}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-slide-in" role="alert">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="h-4 w-4 inline mr-1" />
              Fecha *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={getTodayLocalISO()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="h-4 w-4 inline mr-1" />
                Hora de Inicio *
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar</option>
                {timeOptions.slice(0, -1).map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="h-4 w-4 inline mr-1" />
                Hora de Fin *
              </label>
              <select
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar</option>
                {timeOptions.slice(1).map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="h-4 w-4 inline mr-1" />
              Nombre del Evento *
            </label>
            <input
              type="text"
              value={formData.event}
              onChange={(e) => setFormData({ ...formData, event: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Reunión familiar, Práctica de fútbol, etc."
              required
            />
          </div>

          {/* Show existing reservations for selected date */}
          {formData.date && (
            <div className="space-y-2">
              {scheduleLoading && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
                  Cargando reservas existentes...
                </div>
              )}

              {scheduleError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {scheduleError}
                </div>
              )}

              {!scheduleLoading && !scheduleError && existingReservations.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">
                    Reservas existentes para {parseLocalDate(formData.date).toLocaleDateString('es-ES')}:
                  </h4>
                  <div className="space-y-1">
                    {existingReservations.map(reservation => (
                      <div key={reservation.id} className="text-sm text-yellow-700">
                        {reservation.startTime} - {reservation.endTime}: {reservation.event}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Space rules */}
          {space.rules.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-medium text-blue-800 mb-2">Reglas del espacio:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {space.rules.map((rule, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-1 h-1 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Reservando...' : 'Confirmar Reserva'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;