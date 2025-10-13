import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from 'react';
import { User, AuthContextType, RegisterData, UpdateProfilePayload } from '../types';
import type { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const mapProfileToUser = (profile: ProfileRow): User => ({
  id: profile.id,
  email: profile.email ?? '',
  identificationNumber: profile.identification_number,
  fullName: profile.full_name ?? '',
  phone: profile.phone ?? '',
  role: profile.role === 'admin' ? 'admin' : 'user',
  createdAt: profile.created_at ?? new Date().toISOString(),
  isActive: profile.is_active
});

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

  const loadUserProfile = useCallback(async (profileId: string): Promise<ProfileRow | null> => {
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
        setUser(null);
        return null;
      }

      if (!profile || profile.is_active === false) {
        setUser(null);
        return null;
      }

      setUser(mapProfileToUser(profile));
      return profile;
    } catch (error) {
      console.error('Error loading profile:', error);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      setIsLoading(true);
      const {
        data: { user: currentUser },
        error
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error('Error initializing auth session:', error);
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (currentUser) {
        await loadUserProfile(currentUser.id);
      } else {
        setUser(null);
      }

      setIsLoading(false);
    };

    void initialize();

    const { data } = supabase.auth.onAuthStateChange((_, session) => {
      if (!isMounted) {
        return;
      }

      if (session?.user) {
        setIsLoading(true);
        void loadUserProfile(session.user.id).finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const login = useCallback(
    async (identificationNumber: string, password: string) => {
      setIsLoading(true);
      try {
        const syntheticEmail = `${identificationNumber}@id.local`.toLowerCase();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: syntheticEmail,
          password
        });

        if (error) {
          console.error('Login error:', error);
          return { success: false, error: error.message };
        }

        const authenticatedUser = data.user;
        if (!authenticatedUser) {
          return {
            success: false,
            error: 'No se pudo iniciar sesión. Verifica la configuración de autenticación.'
          };
        }

        await loadUserProfile(authenticatedUser.id);
        return { success: true };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Ocurrió un error al iniciar sesión.' };
      } finally {
        setIsLoading(false);
      }
    },
    [loadUserProfile]
  );

  const register = useCallback(
    async (userData: RegisterData) => {
      setIsLoading(true);
      const trimmedFullName = userData.fullName.trim();
      const trimmedEmail = userData.email.trim();
      const trimmedPhone = userData.phone.trim();
      const trimmedIdentification = userData.identificationNumber.trim();

      try {
        const syntheticEmail = `${trimmedIdentification}@id.local`.toLowerCase();
        const { data, error } = await supabase.auth.signUp({
          email: syntheticEmail,
          password: userData.password,
          options: {
            data: {
              identification_number: trimmedIdentification
            }
          }
        });

        if (error) {
          console.error('Registration error:', error);
          return { success: false, error: error.message };
        }

        let session = data.session ?? null;

        if (!session) {
          const { data: currentSessionData, error: currentSessionError } =
            await supabase.auth.getSession();

          if (currentSessionError) {
            console.error('Session retrieval error:', currentSessionError);
          }

          session = currentSessionData?.session ?? null;
        }

        if (!session) {
          const {
            data: signInData,
            error: signInError
          } = await supabase.auth.signInWithPassword({
            email: syntheticEmail,
            password: userData.password
          });

          if (signInError) {
            console.error('Auto login error after registration:', signInError);
            return {
              success: false,
              error:
                'No se pudo iniciar sesión automáticamente. Si la verificación de correo está activada, revisa tu bandeja para confirmar la cuenta.'
            };
          }

          session = signInData.session ?? null;
        }

        if (!session) {
          return {
            success: false,
            error:
              'No se pudo iniciar sesión después del registro. Si la verificación de correo está activada, el alta quedará pendiente hasta que confirmes tu cuenta.'
          };
        }

        const newUser = data.user ?? session.user ?? null;
        if (!newUser) {
          return {
            success: false,
            error:
              'Supabase no devolvió un usuario activo. Si la verificación de correo está activada, el registro quedará pendiente hasta que confirmes tu cuenta.'
          };
        }

        const profilePayload: Database['public']['Tables']['profiles']['Insert'] = {
          id: newUser.id,
          full_name: trimmedFullName,
          email: trimmedEmail || null,
          phone: trimmedPhone || null,
          identification_number: trimmedIdentification,
          role: 'user',
          is_active: true
        };

        const { error: profileError } = await supabase.from('profiles').insert(profilePayload);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          await supabase.auth.signOut();
          return {
            success: false,
            error:
              'El alta no se completó correctamente. Vuelve a intentarlo una vez confirmada tu cuenta si aplica la verificación de correo.'
          };
        }

        await loadUserProfile(newUser.id);
        return { success: true };
      } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Ocurrió un error al registrar el usuario.' };
      } finally {
        setIsLoading(false);
      }
    },
    [loadUserProfile]
  );

  const logout = useCallback(() => {
    setIsLoading(true);
    supabase.auth
      .signOut()
      .catch((error) => {
        console.error('Logout error:', error);
      })
      .finally(() => {
        setUser(null);
        setIsLoading(false);
      });
  }, []);

  const updateProfile = useCallback(
    async (updates: UpdateProfilePayload): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: 'No hay un usuario autenticado.' };
      }

      setIsLoading(true);

      const trimmedFullName = updates.fullName.trim();
      const trimmedEmail = updates.email.trim();
      const trimmedPhone = updates.phone.trim();
      const trimmedIdentification = updates.identificationNumber?.trim();
      const trimmedPassword = updates.password?.trim();

      const profileUpdates: Database['public']['Tables']['profiles']['Update'] = {
        full_name: trimmedFullName,
        email: trimmedEmail || null,
        phone: trimmedPhone || null
      };

      if (trimmedIdentification && trimmedIdentification.length > 0) {
        profileUpdates.identification_number = trimmedIdentification;
      }

      const authUpdates: Parameters<typeof supabase.auth.updateUser>[0] = {};

      if (trimmedPassword && trimmedPassword.length > 0) {
        authUpdates.password = trimmedPassword;
        authUpdates.data = {
          identification_number: trimmedIdentification ?? user.identificationNumber
        };
      } else if (trimmedIdentification && trimmedIdentification !== user.identificationNumber) {
        authUpdates.data = { identification_number: trimmedIdentification };
      }

      if (trimmedIdentification && trimmedIdentification !== user.identificationNumber) {
        authUpdates.email = `${trimmedIdentification}@id.local`.toLowerCase();
      }

      try {
        if (Object.keys(authUpdates).length > 0) {
          const { error: authError } = await supabase.auth.updateUser(authUpdates);
          if (authError) {
            console.error('Auth update error:', authError);
            return {
              success: false,
              error: authError.message ?? 'No se pudo actualizar la información de autenticación.'
            };
          }
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          return { success: false, error: 'No se pudo actualizar el perfil. Inténtalo nuevamente.' };
        }

        await loadUserProfile(user.id);
        return { success: true };
      } catch (error) {
        console.error('Profile update error:', error);
        return { success: false, error: 'Ocurrió un error al actualizar el perfil.' };
      } finally {
        setIsLoading(false);
      }
    },
    [user, loadUserProfile]
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
