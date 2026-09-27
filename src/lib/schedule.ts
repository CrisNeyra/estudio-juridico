/**
 * Agenda del estudio. Argentina no aplica horario de verano, por eso el offset es fijo.
 * Todas las funciones son puras (reciben `now`) para poder testearlas.
 */
export const TZ_OFFSET = "-03:00";
export const SLOT_MINUTES = 60;
export const BOOKING_DAYS_AHEAD = 30;
export const MIN_LEAD_HOURS = 12;
export const WORKING_DAYS = [1, 2, 3, 4, 5] as const;
export const SLOT_TIMES = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
] as const;

export type Slot = { time: string; startsAt: string; available: boolean };

export function toStartsAt(date: string, time: string): Date {
  return new Date(`${date}T${time}:00${TZ_OFFSET}`);
}

/** YYYY-MM-DD of `d` in Argentina time. */
export function localDate(d: Date): string {
  const shifted = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 10);
}

function weekday(date: string): number {
  return new Date(`${date}T12:00:00${TZ_OFFSET}`).getUTCDay();
}

export function bookingRange(now: Date): { min: string; max: string } {
  const max = new Date(now.getTime() + BOOKING_DAYS_AHEAD * 24 * 60 * 60 * 1000);
  return { min: localDate(now), max: localDate(max) };
}

export function isWorkingDay(date: string): boolean {
  return (WORKING_DAYS as readonly number[]).includes(weekday(date));
}

export function isValidSlot(date: string, time: string, now: Date): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  if (!(SLOT_TIMES as readonly string[]).includes(time)) return false;
  if (!isWorkingDay(date)) return false;
  const { min, max } = bookingRange(now);
  if (date < min || date > max) return false;
  const start = toStartsAt(date, time);
  return start.getTime() - now.getTime() >= MIN_LEAD_HOURS * 60 * 60 * 1000;
}

export function daySlots(date: string, now: Date, booked: ReadonlySet<number>): Slot[] {
  if (!isWorkingDay(date)) return [];
  return SLOT_TIMES.map((time) => {
    const start = toStartsAt(date, time);
    return {
      time,
      startsAt: start.toISOString(),
      available: isValidSlot(date, time, now) && !booked.has(start.getTime()),
    };
  });
}

export function formatSlot(date: string, time: string): string {
  const d = toStartsAt(date, time);
  const day = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(d);
  return `${day} a las ${time} h`;
}
