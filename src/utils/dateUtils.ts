export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES');
};

export const formatTime = (time: string): string => {
  return time;
};

export const isToday = (date: string): boolean => {
  const today = new Date();
  const targetDate = new Date(date);
  
  return today.toDateString() === targetDate.toDateString();
};

export const isTomorrow = (date: string): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const targetDate = new Date(date);
  
  return tomorrow.toDateString() === targetDate.toDateString();
};

export const isWithin24Hours = (date: string, time: string): boolean => {
  const now = new Date();
  const targetDateTime = new Date(`${date} ${time}`);
  const diffInHours = (targetDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return diffInHours <= 24 && diffInHours > 0;
};

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const isTimeInRange = (time: string, start: string, end: string): boolean => {
  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
};