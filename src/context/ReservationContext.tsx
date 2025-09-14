import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Reservation, ReservationContextType } from '../types';
import { storage, STORAGE_KEYS, generateId } from '../utils/storage';
import { timeToMinutes } from '../utils/dateUtils';
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

export const ReservationProvider: React.FC<ReservationProviderProps> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    initializeReservations();
  }, []);

  const initializeReservations = () => {
    const savedReservations = storage.get<Reservation[]>(STORAGE_KEYS.RESERVATIONS);
    if (savedReservations) {
      setReservations(savedReservations);
    } else {
      setReservations(sampleReservations);
      storage.set(STORAGE_KEYS.RESERVATIONS, sampleReservations);
    }
  };

  const addReservation = (reservationData: Omit<Reservation, 'id' | 'createdAt' | 'status'>): boolean => {
    // Check if time slot is available
    if (!isTimeSlotAvailable(reservationData.spaceId, reservationData.date, reservationData.startTime, reservationData.endTime)) {
      return false;
    }

    const newReservation: Reservation = {
      ...reservationData,
      id: generateId(),
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    const updatedReservations = [...reservations, newReservation];
    setReservations(updatedReservations);
    storage.set(STORAGE_KEYS.RESERVATIONS, updatedReservations);
    return true;
  };

  const cancelReservation = (id: string) => {
    const updatedReservations = reservations.map(reservation =>
      reservation.id === id ? { ...reservation, status: 'cancelled' as const } : reservation
    );
    setReservations(updatedReservations);
    storage.set(STORAGE_KEYS.RESERVATIONS, updatedReservations);
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

  const isTimeSlotAvailable = (spaceId: string, date: string, startTime: string, endTime: string): boolean => {
    const spaceReservations = getSpaceReservations(spaceId, date);
    
    const requestStartMinutes = timeToMinutes(startTime);
    const requestEndMinutes = timeToMinutes(endTime);

    return !spaceReservations.some(reservation => {
      const reservationStartMinutes = timeToMinutes(reservation.startTime);
      const reservationEndMinutes = timeToMinutes(reservation.endTime);

      // Check for any overlap
      return (
        (requestStartMinutes >= reservationStartMinutes && requestStartMinutes < reservationEndMinutes) ||
        (requestEndMinutes > reservationStartMinutes && requestEndMinutes <= reservationEndMinutes) ||
        (requestStartMinutes <= reservationStartMinutes && requestEndMinutes >= reservationEndMinutes)
      );
    });
  };

  const value: ReservationContextType = {
    reservations,
    addReservation,
    cancelReservation,
    getUserReservations,
    getSpaceReservations,
    isTimeSlotAvailable
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
};