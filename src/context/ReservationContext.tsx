import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Reservation, ReservationContextType } from '../types';
import { timeToMinutes } from '../utils/dateUtils';
import { useAuth } from './AuthContext';
import { storage, STORAGE_KEYS, generateId } from '../utils/storage';
import { sampleReservations } from '../data/initialData';

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const useReservations = () => {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservations must be used within a ReservationProvider');
  }
  return context;
};

interface ReservationProviderProps {
  children: ReactNode;
}

interface SystemSettings {
  maxAdvanceDays: number;
  maxConcurrentReservations: number;
}

export const ReservationProvider: React.FC<ReservationProviderProps> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationsError, setReservationsError] = useState<string | null>(null);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState<number | null>(30);
  const [maxConcurrentReservations, setMaxConcurrentReservations] = useState<number | null>(3);
  const [isSettingsLoading, setIsSettingsLoading] = useState<boolean>(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      setMaxAdvanceDays(null);
      setMaxConcurrentReservations(null);
      setSettingsError(null);
      setIsSettingsLoading(false);
      return;
    }

    const settings = storage.get<SystemSettings>('community_spaces_settings');
    if (!settings) {
      const defaultSettings: SystemSettings = {
        maxAdvanceDays: 30,
        maxConcurrentReservations: 3
      };
      storage.set('community_spaces_settings', defaultSettings);
      setMaxAdvanceDays(defaultSettings.maxAdvanceDays);
      setMaxConcurrentReservations(defaultSettings.maxConcurrentReservations);
    } else {
      setMaxAdvanceDays(settings.maxAdvanceDays);
      setMaxConcurrentReservations(settings.maxConcurrentReservations);
    }
    setIsSettingsLoading(false);
  }, [isAuthLoading, user]);

  const loadReservations = useCallback(async () => {
    if (!user) {
      setReservations([]);
      return;
    }

    try {
      let storedReservations = storage.get<Reservation[]>(STORAGE_KEYS.RESERVATIONS);

      if (!storedReservations || storedReservations.length === 0) {
        storage.set(STORAGE_KEYS.RESERVATIONS, sampleReservations);
        storedReservations = sampleReservations;
      }

      setReservations(storedReservations);
      setReservationsError(null);
    } catch (error) {
      console.error('Error loading reservations:', error);
      setReservationsError('No se pudieron cargar las reservas. Por favor, intenta nuevamente.');
    }
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      setReservations([]);
      setReservationsError(null);
      return;
    }

    loadReservations();
  }, [isAuthLoading, loadReservations, user]);

  const addReservation = async (reservationData: Omit<Reservation, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
    if (!await isTimeSlotAvailable(reservationData.spaceId, reservationData.date, reservationData.startTime, reservationData.endTime)) {
      return false;
    }

    try {
      const reservations = storage.get<Reservation[]>(STORAGE_KEYS.RESERVATIONS) || [];
      const newReservation: Reservation = {
        ...reservationData,
        id: generateId(),
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };

      reservations.push(newReservation);
      storage.set(STORAGE_KEYS.RESERVATIONS, reservations);
      await loadReservations();
      return true;
    } catch (error) {
      console.error('Error adding reservation:', error);
      setReservationsError('No se pudo crear la reserva. Intenta nuevamente.');
      return false;
    }
  };

  const cancelReservation = async (id: string) => {
    try {
      const reservations = storage.get<Reservation[]>(STORAGE_KEYS.RESERVATIONS) || [];
      const reservationIndex = reservations.findIndex(r => r.id === id);

      if (reservationIndex !== -1) {
        reservations[reservationIndex].status = 'cancelled';
        storage.set(STORAGE_KEYS.RESERVATIONS, reservations);
        await loadReservations();
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      setReservationsError('No se pudo cancelar la reserva. Por favor, intenta nuevamente.');
    }
  };

  const getUserReservations = (userId: string): Reservation[] => {
    return reservations.filter(reservation =>
      reservation.userId === userId && reservation.status !== 'cancelled'
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getSpaceReservations = (spaceId: string, date?: string): Reservation[] => {
    return reservations.filter(reservation => {
      const matchesSpace = reservation.spaceId === spaceId;
      const matchesDate = date ? reservation.date === date : true;
      const isActive = reservation.status !== 'cancelled';
      return matchesSpace && matchesDate && isActive;
    });
  };

  const fetchSpaceSchedule = useCallback(async (spaceId: string, date: string): Promise<Reservation[]> => {
    const reservations = storage.get<Reservation[]>(STORAGE_KEYS.RESERVATIONS) || [];

    return reservations
      .filter(r =>
        r.spaceId === spaceId &&
        r.date === date &&
        r.status !== 'cancelled'
      )
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, []);

  const isTimeSlotAvailable = async (spaceId: string, date: string, startTime: string, endTime: string): Promise<boolean> => {
    const reservations = storage.get<Reservation[]>(STORAGE_KEYS.RESERVATIONS) || [];
    const spaceReservations = reservations.filter(r =>
      r.spaceId === spaceId &&
      r.date === date &&
      r.status !== 'cancelled'
    );

    if (spaceReservations.length === 0) return true;

    const requestStartMinutes = timeToMinutes(startTime);
    const requestEndMinutes = timeToMinutes(endTime);

    return !spaceReservations.some(reservation => {
      const reservationStartMinutes = timeToMinutes(reservation.startTime);
      const reservationEndMinutes = timeToMinutes(reservation.endTime);

      return (
        (requestStartMinutes >= reservationStartMinutes && requestStartMinutes < reservationEndMinutes) ||
        (requestEndMinutes > reservationStartMinutes && requestEndMinutes <= reservationEndMinutes) ||
        (requestStartMinutes <= reservationStartMinutes && requestEndMinutes >= reservationEndMinutes)
      );
    });
  };

  const value: ReservationContextType = {
    reservations,
    reservationsError,
    reloadReservations: loadReservations,
    addReservation,
    cancelReservation,
    getUserReservations,
    getSpaceReservations,
    fetchSpaceSchedule,
    isTimeSlotAvailable,
    maxAdvanceDays,
    maxConcurrentReservations,
    isSettingsLoading,
    settingsError
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
};
