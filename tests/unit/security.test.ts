import { beforeEach, describe, expect, it, vi } from "vitest";
import { safeNext } from "@/lib/auth";
import { sanitizeFileName } from "@/lib/portal";
import { __test } from "@/lib/rate-limit";
import { serializeJsonLd } from "@/lib/seo";

describe("safeNext (open redirect)", () => {
  it.each([
    ["/portal/casos/1", "/portal/casos/1"],
    ["https://evil.com", "/portal"],
    ["//evil.com", "/portal"],
    ["/\\evil.com", "/portal"],
    ["javascript:alert(1)", "/portal"],
    [undefined, "/portal"],
  ])("%s → %s", (input, expected) => {
    expect(safeNext(input)).toBe(expected);
  });
});

describe("sanitizeFileName", () => {
  it("quita acentos, espacios y caracteres peligrosos", () => {
    expect(sanitizeFileName("Poder Notarial ñandú.pdf")).toBe("Poder-Notarial-nandu.pdf");
  });

  it("evita path traversal y archivos ocultos", () => {
    const out = sanitizeFileName("../../etc/passwd");
    expect(out).not.toContain("/");
    expect(out.startsWith(".")).toBe(false);
  });

  it("nunca devuelve vacío", () => {
    expect(sanitizeFileName("///")).toBe("documento");
  });
});

describe("serializeJsonLd", () => {
  it("escapa < para evitar cerrar el <script>", () => {
    const out = serializeJsonLd({ "@type": "Thing", name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
  });
});

describe("memoryLimit", () => {
  beforeEach(() => __test.memory.clear());

  it("bloquea al superar el límite y se libera al vencer la ventana", () => {
    vi.useFakeTimers();
    const policy = { limit: 2, windowSeconds: 60 };
    expect(__test.memoryLimit("k", policy).success).toBe(true);
    expect(__test.memoryLimit("k", policy).success).toBe(true);
    const blocked = __test.memoryLimit("k", policy);
    expect(blocked).toMatchObject({ success: false, remaining: 0 });
    expect(__test.memoryLimit("otra", policy).success).toBe(true);
    vi.advanceTimersByTime(61_000);
    expect(__test.memoryLimit("k", policy).success).toBe(true);
    vi.useRealTimers();
  });
});
