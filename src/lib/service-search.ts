import { services, type Service } from "@/content/services";

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOPWORDS = new Set([
  "de",
  "la",
  "el",
  "los",
  "las",
  "un",
  "una",
  "y",
  "o",
  "me",
  "mi",
  "mis",
  "que",
  "en",
  "por",
  "con",
  "para",
  "del",
  "al",
  "se",
  "es",
  "no",
  "tengo",
  "quiero",
  "necesito",
  "como",
  "hacer",
]);

type Scored = { service: Service; score: number };

/** Crude Spanish stemming: words share a root if their common prefix covers all but ~2 letters. */
function sharesRoot(a: string, b: string): boolean {
  if (a.length < 3 || b.length < 3) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i >= Math.max(4, Math.min(a.length, b.length) - 2);
}

/**
 * Ranks services against free text. Full keyword phrases weigh the most, then single-word
 * keywords, then words inside phrases, title or cases (root match tolerates plurals/conjugations).
 */
export function searchServices(query: string, limit = 3): Service[] {
  const q = normalize(query);
  if (q.length < 3) return [];

  const tokens = q.split(" ").filter((t) => t.length > 2 && !STOPWORDS.has(t));
  if (tokens.length === 0) return [];

  const scored: Scored[] = services.map((service) => {
    let score = 0;
    const keywords = service.keywords.map(normalize);
    const haystack = normalize([service.title, service.short, ...service.cases].join(" ")).split(
      " ",
    );

    for (const kw of keywords) {
      if (kw.includes(" ") && q.includes(kw)) score += 6;
    }
    for (const token of tokens) {
      for (const kw of keywords) {
        const words = kw.split(" ");
        const partial = words.length > 1;
        for (const word of words) {
          if (word === token) score += partial ? 2 : 4;
          else if (sharesRoot(word, token)) score += partial ? 1 : 3;
        }
      }
      if (haystack.some((w) => sharesRoot(w, token))) score += 1;
    }
    return { service, score };
  });

  return scored
    .filter((s) => s.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.service);
}
