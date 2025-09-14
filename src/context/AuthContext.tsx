import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterData } from '../types';
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    // Initialize with admin user if no users exist
    const existingUsers = storage.get<User[]>(STORAGE_KEYS.USERS) || [];
    if (existingUsers.length === 0) {
      storage.set(STORAGE_KEYS.USERS, [initialAdminUser]);
    }

    // Check for existing session
    const savedUser = storage.get<User>(STORAGE_KEYS.USER);
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    const users = storage.get<User[]>(STORAGE_KEYS.USERS) || [];
    
    // Simple password check (in real app, use proper hashing)
    let foundUser: User | undefined;
    
    if (username === 'admin' && password === 'admin123') {
      foundUser = users.find(u => u.username === 'admin') || initialAdminUser;
    } else {
      foundUser = users.find(u => u.username === username && u.username === password);
    }

    if (foundUser) {
      setUser(foundUser);
      storage.set(STORAGE_KEYS.USER, foundUser);
      return true;
    }
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    const users = storage.get<User[]>(STORAGE_KEYS.USERS) || [];
    
    // Check if username or email already exists
    if (users.some(u => u.username === userData.username || u.email === userData.email)) {
      return false;
    }

    const newUser: User = {
      id: generateId(),
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      phone: userData.phone,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    storage.set(STORAGE_KEYS.USERS, users);
    
    setUser(newUser);
    storage.set(STORAGE_KEYS.USER, newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    storage.remove(STORAGE_KEYS.USER);
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