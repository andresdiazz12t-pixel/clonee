import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useReservations } from '../context/ReservationContext';
import { useSpaces } from '../context/SpaceContext';
import { useAuth } from '../context/AuthContext';
import ReservationModal from '../components/Reservations/ReservationModal';
import { timeToMinutes } from '../utils/dateUtils';

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

type ViewMode = 'month' | 'week';

type SelectedSlot = {
  spaceId: string;
  date: string;
  startTime: string;
  endTime: string;
};

const startOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Start week on Monday
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfWeek = (date: Date): Date => {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  return result;
};

const addDays = (date: Date, amount: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};

const formatMonthLabel = (date: Date) => {
  return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
};

const toISODate = (date: Date) => {
  return date.toLocaleDateString('en-CA');
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const addMinutesToTime = (time: string, minutesToAdd: number): string => {
  const minutes = timeToMinutes(time) + minutesToAdd;
  return minutesToTime(minutes);
};

const isSameDay = (dateA: Date, dateB: Date): boolean => {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

const isBeforeToday = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

const CalendarView: React.FC = () => {
  const { reservations } = useReservations();
  const { spaces } = useSpaces();
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const initial = new Date();
    initial.setHours(0, 0, 0, 0);
    return initial;
  });
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);

  const selectedSpace = useMemo(
    () => spaces.find(space => space.id === selectedSpaceId),
    [spaces, selectedSpaceId]
  );

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setCurrentDate(prev => {
      const reference = new Date(prev);
      return mode === 'week'
        ? startOfWeek(reference)
        : new Date(reference.getFullYear(), reference.getMonth(), 1);
    });
  };

  const handleRangeChange = (direction: number) => {
    setCurrentDate(prev => {
      if (viewMode === 'month') {
        return new Date(prev.getFullYear(), prev.getMonth() + direction, 1);
      }
      return addDays(prev, direction * 7);
    });
  };

  const activeReservations = useMemo(
    () => reservations.filter(reservation => reservation.status !== 'cancelled'),
    [reservations]
  );

  const filteredReservations = useMemo(() => {
    if (!selectedSpaceId) {
      return activeReservations;
    }
    return activeReservations.filter(reservation => reservation.spaceId === selectedSpaceId);
  }, [activeReservations, selectedSpaceId]);

  const monthlyDays = useMemo(() => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = new Date(calendarStart);

    while (day <= calendarEnd) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }

    return { days, monthStart };
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [currentDate]);

  const timeSlots = useMemo(() => {
    if (!selectedSpace) {
      return [] as string[];
    }

    const startMinutes = timeToMinutes(selectedSpace.operatingHours.start);
    const endMinutes = timeToMinutes(selectedSpace.operatingHours.end);
    const slots: string[] = [];

    for (let minutes = startMinutes; minutes < endMinutes; minutes += 60) {
      slots.push(minutesToTime(minutes));
    }

    return slots;
  }, [selectedSpace]);

  const handleCreateFromMonth = (date: string) => {
    if (!selectedSpace) {
      return;
    }

    const defaultStart = selectedSpace.operatingHours.start;
    const defaultEnd = addMinutesToTime(defaultStart, 60);

    setSelectedSlot({
      spaceId: selectedSpace.id,
      date,
      startTime: defaultStart,
      endTime: defaultEnd,
    });
  };

  const handleSlotSelection = (slot: SelectedSlot) => {
    setSelectedSlot(slot);
  };

  const getReservationsForDate = (isoDate: string) => {
    return filteredReservations
      .filter(reservation => reservation.date === isoDate)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  };

  const now = new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendario de Reservas</h1>
          <p className="text-gray-600">Consulta la disponibilidad de los espacios y crea nuevas reservas.</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => handleViewModeChange('month')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Vista mensual
            </button>
            <button
              onClick={() => handleViewModeChange('week')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Vista semanal
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleRangeChange(-1)}
              className="p-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
              aria-label="Periodo anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="min-w-[160px] text-center">
              <span className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                {viewMode === 'month'
                  ? formatMonthLabel(currentDate)
                  : `${weekDays[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${weekDays[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`}
              </span>
            </div>
            <button
              onClick={() => handleRangeChange(1)}
              className="p-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
              aria-label="Periodo siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <select
            value={selectedSpaceId}
            onChange={(event) => setSelectedSpaceId(event.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los espacios</option>
            {spaces
              .filter(space => space.isActive)
              .map(space => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-t-xl overflow-hidden">
            {WEEK_DAYS.map(day => (
              <div
                key={day}
                className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-center py-2 text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-b-xl overflow-hidden">
            {monthlyDays.days.map((day, index) => {
              const isoDate = toISODate(day);
              const isCurrentMonth = day.getMonth() === monthlyDays.monthStart.getMonth();
              const isCurrentDay = isSameDay(day, new Date());
              const reservationsForDay = getReservationsForDate(isoDate);
              const isPastDay = isBeforeToday(day);

              return (
                <div
                  key={`${isoDate}-${index}`}
                  className={`min-h-[120px] bg-white p-3 flex flex-col ${
                    isCurrentMonth ? '' : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`text-sm font-semibold ${isCurrentDay ? 'text-blue-600' : ''}`}>
                      {day.getDate()}
                    </div>
                    {selectedSpace && !isPastDay && isCurrentMonth && (
                      <button
                        onClick={() => handleCreateFromMonth(isoDate)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Reservar
                      </button>
                    )}
                  </div>
                  <div className="mt-2 space-y-2 overflow-hidden">
                    {reservationsForDay.slice(0, 3).map(reservation => (
                      <div
                        key={reservation.id}
                        className="bg-blue-50 border border-blue-100 text-blue-800 rounded-md px-2 py-1 text-xs"
                      >
                        <div className="font-semibold truncate">
                          {reservation.event || 'Reserva'}
                        </div>
                        <div className="flex items-center text-[11px] text-blue-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {reservation.startTime} - {reservation.endTime}
                        </div>
                        {!selectedSpaceId && (
                          <div className="flex items-center text-[11px] text-blue-600 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{reservation.spaceName}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {reservationsForDay.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{reservationsForDay.length - 3} reservas más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {!selectedSpace ? (
            <div className="p-8 text-center">
              <CalendarIcon className="h-10 w-10 text-blue-500 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Selecciona un espacio</h2>
              <p className="text-gray-600">
                Elige un espacio activo para revisar la disponibilidad detallada por franjas horarias y crear nuevas reservas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Hora
                    </th>
                    {weekDays.map(day => (
                      <th
                        key={day.toISOString()}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        <div className="flex flex-col">
                          <span>{day.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                          <span className="text-gray-400 text-[11px]">
                            {day.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {timeSlots.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-sm">
                        El espacio seleccionado no tiene horario configurado.
                      </td>
                    </tr>
                  ) : (
                    timeSlots.map(slot => {
                      const slotStartMinutes = timeToMinutes(slot);
                      const slotEndMinutes = slotStartMinutes + 60;
                      const slotEndTime = minutesToTime(slotEndMinutes);

                      return (
                        <tr key={slot} className="hover:bg-gray-50">
                          <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-600 border-r border-gray-100">
                            {slot} - {slotEndTime}
                          </td>
                          {weekDays.map(day => {
                            const isoDate = toISODate(day);
                            const reservationsForDay = getReservationsForDate(isoDate).filter(reservation => reservation.spaceId === selectedSpace.id);
                            const reservationsInSlot = reservationsForDay.filter(reservation => {
                              const reservationStart = timeToMinutes(reservation.startTime);
                              const reservationEnd = timeToMinutes(reservation.endTime);
                              return reservationStart < slotEndMinutes && reservationEnd > slotStartMinutes;
                            });

                            const slotDateTime = new Date(day);
                            const [hours, minutes] = slot.split(':').map(Number);
                            slotDateTime.setHours(hours, minutes, 0, 0);
                            const isPast = slotDateTime < now;

                            return (
                              <td key={`${isoDate}-${slot}`} className="px-4 py-2 align-top">
                                {reservationsInSlot.length > 0 ? (
                                  <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-md px-2 py-1 text-xs">
                                    <div className="font-semibold truncate">
                                      {reservationsInSlot[0].event || 'Reserva'}
                                    </div>
                                    <div className="text-[11px] text-blue-600">
                                      {reservationsInSlot[0].startTime} - {reservationsInSlot[0].endTime}
                                    </div>
                                    {user?.role === 'admin' && (
                                      <div className="text-[11px] text-blue-600 truncate mt-1">
                                        {reservationsInSlot[0].userName || 'Reservado'}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleSlotSelection({
                                      spaceId: selectedSpace.id,
                                      date: isoDate,
                                      startTime: slot,
                                      endTime: slotEndTime,
                                    })}
                                    disabled={isPast}
                                    className={`w-full h-20 rounded-md border border-dashed text-xs font-medium transition-colors ${
                                      isPast
                                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                        : 'border-green-300 text-green-600 hover:bg-green-50'
                                    }`}
                                  >
                                    {isPast ? 'No disponible' : 'Disponible'}
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedSlot && (
        <ReservationModal
          spaceId={selectedSlot.spaceId}
          initialDate={selectedSlot.date}
          initialStartTime={selectedSlot.startTime}
          initialEndTime={selectedSlot.endTime}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
};

export default CalendarView;
