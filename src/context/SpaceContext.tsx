import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Space, SpaceContextType } from '../types';
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

  useEffect(() => {
    initializeSpaces();
  }, []);

  const initializeSpaces = () => {
    const savedSpaces = storage.get<Space[]>(STORAGE_KEYS.SPACES);
    if (savedSpaces) {
      setSpaces(savedSpaces);
    } else {
      setSpaces(initialSpaces);
      storage.set(STORAGE_KEYS.SPACES, initialSpaces);
    }
  };

  const addSpace = (spaceData: Omit<Space, 'id'>) => {
    const newSpace: Space = {
      ...spaceData,
      id: generateId()
    };
    
    const updatedSpaces = [...spaces, newSpace];
    setSpaces(updatedSpaces);
    storage.set(STORAGE_KEYS.SPACES, updatedSpaces);
  };

  const updateSpace = (id: string, spaceData: Partial<Space>) => {
    const updatedSpaces = spaces.map(space =>
      space.id === id ? { ...space, ...spaceData } : space
    );
    setSpaces(updatedSpaces);
    storage.set(STORAGE_KEYS.SPACES, updatedSpaces);
  };

  const deleteSpace = (id: string) => {
    const updatedSpaces = spaces.filter(space => space.id !== id);
    setSpaces(updatedSpaces);
    storage.set(STORAGE_KEYS.SPACES, updatedSpaces);
  };

  const getSpace = (id: string): Space | undefined => {
    return spaces.find(space => space.id === id);
  };

  const value: SpaceContextType = {
    spaces,
    addSpace,
    updateSpace,
    deleteSpace,
    getSpace
  };

  return (
    <SpaceContext.Provider value={value}>
      {children}
    </SpaceContext.Provider>
  );
};