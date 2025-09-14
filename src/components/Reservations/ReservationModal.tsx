import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Save } from 'lucide-react';
import { useSpaces } from '../../context/SpaceContext';
import { useReservations } from '../../context/ReservationContext';
import { useAuth } from '../../context/AuthContext';
import { timeToMinutes, isTimeInRange } from '../../utils/dateUtils';

interface ReservationModalProps {
  spaceId: string;
  onClose: () => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ spaceId, onClose }) => {
  const { user } = useAuth();
  const { getSpace } = useSpaces();
  const { addReservation, getSpaceReservations, isTimeSlotAvailable } = useReservations();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const space = getSpace(spaceId);

  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    event: '',
  });

  const [existingReservations, setExistingReservations] = useState<any[]>([]);

  useEffect(() => {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: today }));
  }, []);

  useEffect(() => {
    if (formData.date) {
      const reservations = getSpaceReservations(spaceId, formData.date);
      setExistingReservations(reservations);
    }
  }, [formData.date, spaceId]);

  if (!space || !user) return null;

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

  const validateTimeSlot = () => {
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

    if (!isTimeSlotAvailable(spaceId, formData.date, formData.startTime, formData.endTime)) {
      return 'El horario seleccionado no está disponible';
    }
    
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validationError = validateTimeSlot();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    // Check if date is not in the past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('No se pueden hacer reservas para fechas pasadas');
      setLoading(false);
      return;
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

    const success = addReservation(reservationData);
    
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¡Reserva Confirmada!
          </h3>
          <p className="text-gray-600 mb-4">
            Tu reserva para {space.name} ha sido confirmada exitosamente.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p><strong>Fecha:</strong> {new Date(formData.date).toLocaleDateString('es-ES')}</p>
            <p><strong>Horario:</strong> {formData.startTime} - {formData.endTime}</p>
            <p><strong>Evento:</strong> {formData.event}</p>
          </div>
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
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
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
              min={new Date().toISOString().split('T')[0]}
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
          {formData.date && existingReservations.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="font-medium text-yellow-800 mb-2">
                Reservas existentes para {new Date(formData.date).toLocaleDateString('es-ES')}:
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