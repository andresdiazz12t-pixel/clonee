import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from 'react';
import bcrypt from 'bcryptjs';
import { User, AuthContextType, RegisterData } from '../types';
import type { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

const AUTH_STORAGE_KEY = 'auth_profile_id';

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

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setUser(null);
  }, []);

  const loadUserProfile = useCallback(
    async (profileId: string): Promise<ProfileRow | null> => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select(
            'id, full_name, phone, role, is_active, created_at, email, identification_number'
          )
          .eq('id', profileId)
          .maybeSingle<ProfileRow>();

        if (error) {
          console.error('Error loading profile:', error);
          clearSession();
          return null;
        }

        if (!profile || profile.is_active === false) {
          clearSession();
          return null;
        }

        const role = profile.role === 'admin' ? 'admin' : 'user';

        const userData: User = {
          id: profile.id,
          email: profile.email ?? '',
          identificationNumber: profile.identification_number,
          fullName: profile.full_name ?? '',
          phone: profile.phone ?? '',
          role,
          createdAt: profile.created_at ?? new Date().toISOString(),
          isActive: profile.is_active
        };

        setUser(userData);

        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_STORAGE_KEY, profile.id);
        }

        return profile;
      } catch (error) {
        console.error('Error loading profile:', error);
        clearSession();
        return null;
      }
    },
    [clearSession]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const storedProfileId = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedProfileId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    loadUserProfile(storedProfileId).finally(() => {
      setIsLoading(false);
    });
  }, [loadUserProfile]);

  const login = useCallback(
    async (identificationNumber: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select(
            'id, full_name, phone, role, is_active, created_at, email, identification_number, password_hash'
          )
          .eq('identification_number', identificationNumber)
          .maybeSingle<ProfileRow>();

        if (error) {
          console.error('Login error:', error);
          clearSession();
          return false;
        }

        if (!profile || !profile.password_hash || profile.is_active === false) {
          clearSession();
          return false;
        }

        const passwordMatches = await bcrypt.compare(password, profile.password_hash);
        if (!passwordMatches) {
          clearSession();
          return false;
        }

        await loadUserProfile(profile.id);
        return true;
      } catch (error) {
        console.error('Login error:', error);
        clearSession();
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [clearSession, loadUserProfile]
  );

  const register = useCallback(
    async (userData: RegisterData): Promise<boolean> => {
      setIsLoading(true);
      try {
        const passwordHash = await bcrypt.hash(userData.password, 10);
        const profileId = typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);

        const { data, error } = await supabase
          .from('profiles')
          .insert({
            id: profileId,
            full_name: userData.fullName,
            email: userData.email,
            phone: userData.phone,
            identification_number: userData.identificationNumber,
            password_hash: passwordHash,
            role: 'user',
            is_active: true
          })
          .select('id')
          .maybeSingle<Pick<ProfileRow, 'id'>>();

        if (error) {
          console.error('Registration error:', error);
          clearSession();
          return false;
        }

        const newProfileId = data?.id ?? profileId;
        await loadUserProfile(newProfileId);
        return true;
      } catch (error) {
        console.error('Registration error:', error);
        clearSession();
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [clearSession, loadUserProfile]
  );

  const logout = useCallback(() => {
    clearSession();
    setIsLoading(false);
  }, [clearSession]);

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
