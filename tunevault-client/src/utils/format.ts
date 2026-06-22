export const formatDuration = (timeString: string | undefined | null) => {
  if (!timeString) return "0:00";
  try {
    const parts = timeString.split(':');
    if (parts.length === 3) {
      const minutes = parseInt(parts[1], 10);
      const seconds = Math.floor(parseFloat(parts[2]));
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return timeString;
  } catch (error) {
    return "0:00";
  }
};
