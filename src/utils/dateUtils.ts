const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parseLocalDate = (date: string | Date): Date => {
  if (date instanceof Date) {
    return new Date(date.getTime());
  }

  if (typeof date === 'string') {
    const trimmedDate = date.trim();
    const match = DATE_ONLY_REGEX.exec(trimmedDate);

    if (match) {
      const [, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    return new Date(trimmedDate);
  }

  return new Date(date);
};

export const formatDate = (date: string | Date): string => {
  const d = parseLocalDate(date);
  return d.toLocaleDateString('es-ES');
};

export const formatTime = (time: string): string => {
  return time;
};

export const isToday = (date: string): boolean => {
  const today = new Date();
  const targetDate = parseLocalDate(date);

  return today.toDateString() === targetDate.toDateString();
};

export const isTomorrow = (date: string): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const targetDate = parseLocalDate(date);

  return tomorrow.toDateString() === targetDate.toDateString();
};

export const isWithin24Hours = (date: string, time: string): boolean => {
  const now = new Date();
  const targetDateTime = parseLocalDate(date);
  const [hours, minutes] = time.split(':').map(Number);

  if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
    targetDateTime.setHours(hours, minutes, 0, 0);
  }

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

export const getTodayLocalISO = (): string => {
  return new Date().toLocaleDateString('en-CA');
};
