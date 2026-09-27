import { describe, expect, it } from "vitest";
import { buildIcs, escapeIcs } from "@/lib/ics";

describe("ics", () => {
  it("escapa caracteres especiales de RFC 5545", () => {
    expect(escapeIcs("a,b;c\\d\ne")).toBe("a\\,b\\;c\\\\d\\ne");
  });

  const ics = buildIcs(
    {
      uid: "abc@estudio",
      start: new Date("2026-10-01T12:00:00Z"),
      durationMinutes: 60,
      summary: "Consulta: Laboral",
      description: "Una descripción larga ".repeat(10),
      location: "Av. Corrientes 1234, CABA",
    },
    new Date("2026-09-27T10:00:00Z"),
  );

  it("genera fechas en UTC y la duración correcta", () => {
    expect(ics).toContain("DTSTART:20261001T120000Z");
    expect(ics).toContain("DTEND:20261001T130000Z");
    expect(ics).toContain("DTSTAMP:20260927T100000Z");
  });

  it("usa CRLF y pliega líneas largas", () => {
    const lines = ics.split("\r\n");
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    for (const line of lines) expect(line.length).toBeLessThanOrEqual(75);
    expect(lines.some((l) => l.startsWith(" "))).toBe(true);
  });
});
