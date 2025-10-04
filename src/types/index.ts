export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Space {
  id: string;
  name: string;
  type: 'deportivo' | 'social' | 'cultural' | 'bbq' | 'auditorio' | 'salon';
  capacity: number;
  description: string;
  operatingHours: {
    start: string;
    end: string;
  };
  rules: string[];
  isActive: boolean;
  imageUrl?: string;
}

export interface Reservation {
  id: string;
  spaceId: string;
  spaceName: string;
  userId: string;
  userName: string;
  userContact: string;
  date: string;
  startTime: string;
  endTime: string;
  event: string;
  status: 'confirmed' | 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  fullName: string;
  phone: string;
  password: string;
}

export interface SpaceContextType {
  spaces: Space[];
  addSpace: (space: Omit<Space, 'id'>) => Promise<boolean>;
  updateSpace: (id: string, space: Partial<Space>) => Promise<boolean>;
  deleteSpace: (id: string) => void;
  getSpace: (id: string) => Space | undefined;
}

export interface ReservationContextType {
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
  cancelReservation: (id: string) => void;
  getUserReservations: (userId: string) => Reservation[];
  getSpaceReservations: (spaceId: string, date?: string) => Reservation[];
  isTimeSlotAvailable: (spaceId: string, date: string, startTime: string, endTime: string) => Promise<boolean>;
}