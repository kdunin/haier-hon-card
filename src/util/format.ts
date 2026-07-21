/**
 * Formats the "Remaining Time" sensor's raw value (minutes, as reported by
 * pyhOn's remainingTimeMM key) as a short human string, e.g. "1 h 23 min".
 */
export function formatMinutes(value: string | number): string {
  const minutes = typeof value === "string" ? Number.parseInt(value, 10) : value;
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "Done";
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins} min`;
  }
  if (mins === 0) {
    return `${hours} h`;
  }
  return `${hours} h ${mins} min`;
}
