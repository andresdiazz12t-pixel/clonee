import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Space, SpaceContextType } from '../types';
import { useAuth } from './AuthContext';
import { storage, STORAGE_KEYS, generateId } from '../utils/storage';
import { initialSpaces } from '../data/initialData';

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export const useSpaces = () => {
  const context = useContext(SpaceContext);
  if (context === undefined) {
    throw new Error('useSpaces must be used within a SpaceProvider');
  }
  return context;
};

interface SpaceProviderProps {
  children: ReactNode;
}

export const SpaceProvider: React.FC<SpaceProviderProps> = ({ children }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesError, setSpacesError] = useState<string | null>(null);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState<boolean>(false);
  const { user, isLoading } = useAuth();

  const loadSpaces = useCallback(async () => {
    if (!user) {
      setSpaces([]);
      setSpacesError(null);
      setIsLoadingSpaces(false);
      return;
    }

    setIsLoadingSpaces(true);

    try {
      let storedSpaces = storage.get<Space[]>(STORAGE_KEYS.SPACES);

      if (!storedSpaces || storedSpaces.length === 0) {
        storage.set(STORAGE_KEYS.SPACES, initialSpaces);
        storedSpaces = initialSpaces;
      }

      setSpaces(storedSpaces);
      setSpacesError(null);
    } catch (err) {
      console.error('Error loading spaces:', err);
      setSpacesError('Ocurrió un error inesperado al cargar los espacios.');
    } finally {
      setIsLoadingSpaces(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      setSpaces([]);
      setSpacesError(null);
      setIsLoadingSpaces(false);
      return;
    }

    void loadSpaces();
  }, [user, isLoading, loadSpaces]);

  const addSpace = async (spaceData: Omit<Space, 'id'>): Promise<boolean> => {
    try {
      const spaces = storage.get<Space[]>(STORAGE_KEYS.SPACES) || [];
      const newSpace: Space = {
        ...spaceData,
        id: generateId()
      };

      spaces.push(newSpace);
      storage.set(STORAGE_KEYS.SPACES, spaces);
      await loadSpaces();
      return true;
    } catch (error) {
      console.error('Error adding space:', error);
      throw new Error('No se pudo crear el espacio.');
    }
  };

  const updateSpace = async (id: string, spaceData: Partial<Space>): Promise<boolean> => {
    try {
      const spaces = storage.get<Space[]>(STORAGE_KEYS.SPACES) || [];
      const spaceIndex = spaces.findIndex(s => s.id === id);

      if (spaceIndex === -1) {
        throw new Error('Espacio no encontrado.');
      }

      spaces[spaceIndex] = { ...spaces[spaceIndex], ...spaceData };
      storage.set(STORAGE_KEYS.SPACES, spaces);
      await loadSpaces();
      return true;
    } catch (error) {
      console.error('Error updating space:', error);
      throw new Error('No se pudo actualizar el espacio.');
    }
  };

  const deleteSpace = async (id: string) => {
    try {
      const spaces = storage.get<Space[]>(STORAGE_KEYS.SPACES) || [];
      const filteredSpaces = spaces.filter(s => s.id !== id);
      storage.set(STORAGE_KEYS.SPACES, filteredSpaces);
      await loadSpaces();
    } catch (error) {
      console.error('Error deleting space:', error);
    }
  };

  const getSpace = (id: string): Space | undefined => {
    return spaces.find(space => space.id === id);
  };

  const value: SpaceContextType = {
    spaces,
    spacesError,
    loadSpaces,
    addSpace,
    updateSpace,
    deleteSpace,
    getSpace,
    isLoadingSpaces
  };

  return (
    <SpaceContext.Provider value={value}>
      {children}
    </SpaceContext.Provider>
  );
};
