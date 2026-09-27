import { describe, expect, it } from "vitest";
import {
  bookingRange,
  daySlots,
  isValidSlot,
  isWorkingDay,
  localDate,
  toStartsAt,
} from "@/lib/schedule";

// Lunes 28/09/2026 08:00 en Buenos Aires (11:00 UTC).
const now = new Date("2026-09-28T11:00:00Z");

describe("schedule", () => {
  it("convierte fecha y hora local a UTC con offset -03:00", () => {
    expect(toStartsAt("2026-10-01", "09:00").toISOString()).toBe("2026-10-01T12:00:00.000Z");
  });

  it("calcula la fecha local en Argentina", () => {
    expect(localDate(new Date("2026-09-29T02:00:00Z"))).toBe("2026-09-28");
  });

  it("solo trabaja de lunes a viernes", () => {
    expect(isWorkingDay("2026-10-02")).toBe(true); // viernes
    expect(isWorkingDay("2026-10-03")).toBe(false); // sábado
    expect(isWorkingDay("2026-10-04")).toBe(false); // domingo
  });

  it("exige 12 h de anticipación", () => {
    expect(isValidSlot("2026-09-28", "17:00", now)).toBe(false); // 9 h
    expect(isValidSlot("2026-09-29", "09:00", now)).toBe(true); // 25 h
  });

  it("rechaza horarios fuera de agenda o del rango", () => {
    expect(isValidSlot("2026-09-29", "13:00", now)).toBe(false);
    expect(isValidSlot("2026-09-29", "09:30", now)).toBe(false);
    expect(isValidSlot("2026-12-01", "09:00", now)).toBe(false);
    expect(isValidSlot("not-a-date", "09:00", now)).toBe(false);
  });

  it("el rango de reserva es de 30 días", () => {
    expect(bookingRange(now)).toEqual({ min: "2026-09-28", max: "2026-10-28" });
  });

  it("marca como no disponibles los horarios ocupados", () => {
    const booked = new Set([toStartsAt("2026-09-29", "10:00").getTime()]);
    const slots = daySlots("2026-09-29", now, booked);
    expect(slots).toHaveLength(8);
    expect(slots.find((s) => s.time === "10:00")?.available).toBe(false);
    expect(slots.find((s) => s.time === "11:00")?.available).toBe(true);
  });

  it("no devuelve horarios en fin de semana", () => {
    expect(daySlots("2026-10-03", now, new Set())).toEqual([]);
  });
});
