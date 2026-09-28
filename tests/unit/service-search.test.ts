import { describe, expect, it } from "vitest";
import { services } from "@/content/services";
import { normalize, searchServices } from "@/lib/service-search";

describe("normalize", () => {
  it("quita acentos, signos y espacios repetidos", () => {
    expect(normalize("  ¡Jubilación!   Pensión ")).toBe("jubilacion pension");
  });
});

describe("searchServices", () => {
  const top = (q: string) => searchServices(q)[0]?.slug;

  it.each([
    ["me despidieron del trabajo", "laboral"],
    ["me despidieron sin causa ayer", "laboral"],
    ["causa penal por estafa", "penal"],
    ["choqué con el auto", "civil-y-danos"],
    ["quiero divorciarme", "familia"],
    ["tuve un accidente de tránsito", "civil-y-danos"],
    ["declaratoria de herederos", "sucesiones"],
    ["me hicieron una denuncia", "penal"],
  ])("'%s' sugiere %s", (query, slug) => {
    expect(top(query)).toBe(slug);
  });

  it("devuelve vacío para consultas cortas o sin contenido", () => {
    expect(searchServices("ab")).toEqual([]);
    expect(searchServices("que me")).toEqual([]);
  });

  it("respeta el límite", () => {
    expect(searchServices("contrato sociedad despido divorcio", 2).length).toBeLessThanOrEqual(2);
  });
});

describe("services content", () => {
  it("tiene 5 áreas con slugs únicos y contenido completo", () => {
    expect(services).toHaveLength(5);
    expect(new Set(services.map((s) => s.slug)).size).toBe(5);
    for (const s of services) {
      expect(s.slug).toMatch(/^[a-z0-9-]+$/);
      expect(s.keywords.length).toBeGreaterThan(3);
      expect(s.cases.length).toBeGreaterThan(0);
      expect(s.faqs.length).toBeGreaterThan(0);
    }
  });
});
