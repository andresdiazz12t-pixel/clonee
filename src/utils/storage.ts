export const STORAGE_KEYS = {
  USER: 'community_spaces_user',
  SPACES: 'community_spaces_spaces',
  RESERVATIONS: 'community_spaces_reservations',
  USERS: 'community_spaces_users'
};

export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    localStorage.removeItem(key);
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};