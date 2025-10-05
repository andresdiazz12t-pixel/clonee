import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Reservation, ReservationContextType } from '../types';
import { supabase } from '../lib/supabase';
import { timeToMinutes } from '../utils/dateUtils';
import { useAuth } from './AuthContext';

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
  const [reservationsError, setReservationsError] = useState<string | null>(null);
  const { user, isLoading: isAuthLoading } = useAuth();

  const loadReservations = useCallback(async () => {
    if (!user) {
      setReservations([]);
      return;
    }

    let query = supabase
      .from('reservations')
      .select(`
        *,
        spaces(name),
        profiles(full_name, phone, identification_number, email)
      `);

    if (user.role !== 'admin') {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading reservations:', error);
      setReservationsError('No se pudieron cargar las reservas. Por favor, intenta nuevamente.');
      return;
    }

    if (data) {
      const formattedReservations: Reservation[] = data.map(reservation => ({
        id: reservation.id,
        spaceId: reservation.space_id,
        spaceName: (reservation.spaces as any)?.name || '',
        userId: reservation.user_id,
        userName: (reservation.profiles as any)?.full_name || '',
        userContact: (reservation.profiles as any)?.phone || '',
        date: reservation.date,
        startTime: reservation.start_time,
        endTime: reservation.end_time,
        event: reservation.event,
        status: reservation.status as any,
        createdAt: reservation.created_at
      }));
      setReservations(formattedReservations);
      setReservationsError(null);
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

    const channel = supabase
      .channel('reservations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
        loadReservations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthLoading, loadReservations, user]);

  const addReservation = async (reservationData: Omit<Reservation, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
    if (!await isTimeSlotAvailable(reservationData.spaceId, reservationData.date, reservationData.startTime, reservationData.endTime)) {
      return false;
    }

    const { error } = await supabase
      .from('reservations')
      .insert({
        space_id: reservationData.spaceId,
        user_id: reservationData.userId,
        date: reservationData.date,
        start_time: reservationData.startTime,
        end_time: reservationData.endTime,
        event: reservationData.event,
        status: 'confirmed'
      });

    if (!error) {
      await loadReservations();
      return true;
    }
    
    console.error('Error adding reservation:', error);
    setReservationsError('No se pudo crear la reserva. Intenta nuevamente.');
    return false;
  };

  const cancelReservation = async (id: string) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (!error) {
      await loadReservations();
      return;
    }

    console.error('Error cancelling reservation:', error);
    setReservationsError('No se pudo cancelar la reserva. Por favor, intenta nuevamente.');
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

  const isTimeSlotAvailable = async (spaceId: string, date: string, startTime: string, endTime: string): Promise<boolean> => {
    const { data } = await supabase
      .from('reservations')
      .select('start_time, end_time')
      .eq('space_id', spaceId)
      .eq('date', date)
      .neq('status', 'cancelled');

    if (!data || data.length === 0) return true;

    const requestStartMinutes = timeToMinutes(startTime);
    const requestEndMinutes = timeToMinutes(endTime);

    return !data.some(reservation => {
      const reservationStartMinutes = timeToMinutes(reservation.start_time);
      const reservationEndMinutes = timeToMinutes(reservation.end_time);

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
    isTimeSlotAvailable
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
};