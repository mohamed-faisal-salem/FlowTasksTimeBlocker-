import { TimeBlock } from './types';

/**
 * Checks if the current hour falls within a block's range.
 * Handles the "wrap around" for midnight blocks (e.g. 23:00 to 05:00).
 */
export const isActiveBlock = (block: TimeBlock, currentHour: number): boolean => {
  if (block.startHour < block.endHour) {
    return currentHour >= block.startHour && currentHour < block.endHour;
  } else {
    // Night shift (e.g., 23 to 5)
    return currentHour >= block.startHour || currentHour < block.endHour;
  }
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const getHourString = (hour: number): string => {
  const h = hour % 12 || 12;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${h}${ampm}`;
};

// لا حاجة لهذا الجزء لأنه يسبب تصدير مزدوج
// export { 
//   isActiveBlock, 
//   formatTime, 
//   getHourString 
// };