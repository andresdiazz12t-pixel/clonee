import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback
} from 'react';
import { User, AuthContextType, RegisterData } from '../types';
import type { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const cleanupRef = useRef<(() => void) | null>(null);

  type ProfileRow = Database['public']['Tables']['profiles']['Row'];

  const loadUserProfile = useCallback(
    async (userId: string) => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, phone, role, is_active, created_at')
        .eq('id', userId)
        .maybeSingle<ProfileRow>();

      if (error) {
        console.error('Error loading profile:', error);
        setIsLoading(false);
        return;
      }

      if (profile) {
        setUser({
          id: profile.id,
          username: profile.username,
          email: profile.email,
          fullName: profile.full_name,
          phone: profile.phone,
          role: profile.role,
          createdAt: profile.created_at,
          isActive: profile.is_active
        };

        const { data: authUser, error: authError } = await supabase.auth.getUser();

        if (authError) {
          console.error('Error loading auth user:', authError);
        } else if (authUser.user?.email) {
          userData.email = authUser.user.email;
        }

        setUser(userData);
      }

      setIsLoading(false);
    },
    []
  );

  const initializeAuth = useCallback((): (() => void) => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    const cleanup = () => {
      subscription.unsubscribe();
      if (cleanupRef.current === cleanup) {
        cleanupRef.current = null;
      }
    };

    cleanupRef.current = cleanup;

    return cleanup;
  }, [loadUserProfile]);

  useEffect(() => {
    const cleanup = initializeAuth();
    return cleanup;
  }, [initializeAuth]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      });

      if (authError) throw authError;
      if (!authData.user) return false;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: userData.username,
          full_name: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          role: 'user',
          is_active: true
        });

      if (profileError) throw profileError;

      await loadUserProfile(authData.user.id);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

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
