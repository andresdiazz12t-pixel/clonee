import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from 'react';
import { User, AuthContextType, RegisterData, UpdateProfilePayload } from '../types';
import { storage, STORAGE_KEYS, generateId } from '../utils/storage';
import { initialAdminUser } from '../data/initialData';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

interface StoredUser extends User {
  password: string;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUsers = storage.get<StoredUser[]>(STORAGE_KEYS.USERS) || [];

    if (storedUsers.length === 0) {
      const adminWithPassword: StoredUser = {
        ...initialAdminUser,
        password: 'admin123'
      };
      storage.set(STORAGE_KEYS.USERS, [adminWithPassword]);
    }

    const currentUser = storage.get<User>(STORAGE_KEYS.USER);
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (identificationNumber: string, password: string) => {
      setIsLoading(true);
      try {
        const users = storage.get<StoredUser[]>(STORAGE_KEYS.USERS) || [];
        const foundUser = users.find(
          u => u.identificationNumber === identificationNumber &&
               u.password === password &&
               u.isActive
        );

        if (!foundUser) {
          return { success: false, error: 'Credenciales incorrectas' };
        }

        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        storage.set(STORAGE_KEYS.USER, userWithoutPassword);
        return { success: true };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Ocurrió un error al iniciar sesión.' };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (userData: RegisterData) => {
      setIsLoading(true);
      try {
        const users = storage.get<StoredUser[]>(STORAGE_KEYS.USERS) || [];

        const existingUser = users.find(
          u => u.identificationNumber === userData.identificationNumber ||
               u.email === userData.email
        );

        if (existingUser) {
          return { success: false, error: 'El usuario ya existe' };
        }

        const newUser: StoredUser = {
          id: generateId(),
          email: userData.email,
          identificationNumber: userData.identificationNumber,
          fullName: userData.fullName,
          phone: userData.phone,
          role: 'user',
          createdAt: new Date().toISOString(),
          isActive: true,
          password: userData.password
        };

        users.push(newUser);
        storage.set(STORAGE_KEYS.USERS, users);

        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        storage.set(STORAGE_KEYS.USER, userWithoutPassword);
        return { success: true };
      } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Ocurrió un error al registrar el usuario.' };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    storage.remove(STORAGE_KEYS.USER);
  }, []);

  const updateProfile = useCallback(
    async (updates: UpdateProfilePayload): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: 'No hay un usuario autenticado.' };
      }

      setIsLoading(true);

      try {
        const users = storage.get<StoredUser[]>(STORAGE_KEYS.USERS) || [];
        const userIndex = users.findIndex(u => u.id === user.id);

        if (userIndex === -1) {
          return { success: false, error: 'Usuario no encontrado.' };
        }

        const updatedStoredUser: StoredUser = {
          ...users[userIndex],
          fullName: updates.fullName,
          email: updates.email,
          phone: updates.phone,
          identificationNumber: updates.identificationNumber || users[userIndex].identificationNumber,
          ...(updates.password && { password: updates.password })
        };

        users[userIndex] = updatedStoredUser;
        storage.set(STORAGE_KEYS.USERS, users);

        const { password: _, ...userWithoutPassword } = updatedStoredUser;
        setUser(userWithoutPassword);
        storage.set(STORAGE_KEYS.USER, userWithoutPassword);

        return { success: true };
      } catch (error) {
        console.error('Profile update error:', error);
        return { success: false, error: 'Ocurrió un error al actualizar el perfil.' };
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
