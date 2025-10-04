import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Space, SpaceContextType } from '../types';
import { supabase } from '../lib/supabase';

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
    loadSpaces();

    const channel = supabase
      .channel('spaces-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spaces' }, () => {
        loadSpaces();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSpaces = async () => {
    const { data } = await supabase
      .from('spaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      const formattedSpaces: Space[] = data.map(space => ({
        id: space.id,
        name: space.name,
        type: space.type as Space['type'],
        capacity: space.capacity,
        description: space.description,
        operatingHours: {
          start: space.operating_hours_start,
          end: space.operating_hours_end
        },
        rules: space.rules || [],
        isActive: space.is_active,
        imageUrl: space.image_url || undefined
      }));
      setSpaces(formattedSpaces);
    }
  };

  const addSpace = async (spaceData: Omit<Space, 'id'>): Promise<boolean> => {
    const { error } = await supabase
      .from('spaces')
      .insert({
        name: spaceData.name,
        type: spaceData.type,
        capacity: spaceData.capacity,
        description: spaceData.description,
        operating_hours_start: spaceData.operatingHours.start,
        operating_hours_end: spaceData.operatingHours.end,
        rules: spaceData.rules,
        is_active: spaceData.isActive,
        image_url: spaceData.imageUrl
      });

    if (error) {
      throw new Error(error.message || 'No se pudo crear el espacio.');
    }

    await loadSpaces();
    return true;
  };

  const updateSpace = async (id: string, spaceData: Partial<Space>): Promise<boolean> => {
    const updateData: Record<string, unknown> = {};

    if (spaceData.name !== undefined) updateData.name = spaceData.name;
    if (spaceData.type !== undefined) updateData.type = spaceData.type;
    if (spaceData.capacity !== undefined) updateData.capacity = spaceData.capacity;
    if (spaceData.description !== undefined) updateData.description = spaceData.description;
    if (spaceData.operatingHours !== undefined) {
      updateData.operating_hours_start = spaceData.operatingHours.start;
      updateData.operating_hours_end = spaceData.operatingHours.end;
    }
    if (spaceData.rules !== undefined) updateData.rules = spaceData.rules;
    if (spaceData.isActive !== undefined) updateData.is_active = spaceData.isActive;
    if (spaceData.imageUrl !== undefined) updateData.image_url = spaceData.imageUrl;

    const { error } = await supabase
      .from('spaces')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'No se pudo actualizar el espacio.');
    }

    await loadSpaces();
    return true;
  };

  const deleteSpace = async (id: string) => {
    const { error } = await supabase
      .from('spaces')
      .delete()
      .eq('id', id);

    if (!error) {
      await loadSpaces();
    }
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