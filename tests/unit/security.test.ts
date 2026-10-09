import { beforeEach, describe, expect, it, vi } from "vitest";
import { signMfaCookie, verifyMfaCookie } from "@/lib/mfa-cookie";
import { safeNext } from "@/lib/safe-next";
import { sanitizeFileName } from "@/lib/portal";
import { __test } from "@/lib/rate-limit";
import { serializeJsonLd } from "@/lib/seo";
import { credentialsInvalidateJwt } from "@/lib/domain/session";

describe("MFA cookie HMAC", () => {
  const secret = "test-auth-secret-at-least-16";
  const userId = "11111111-1111-1111-1111-111111111111";

  it("acepta un valor firmado vigente", () => {
    const token = signMfaCookie(userId, secret, 1_700_000_000_000);
    expect(verifyMfaCookie(token, userId, secret, 1_700_000_000_000)).toBe(true);
  });

  it("rechaza el userId crudo (bypass anterior)", () => {
    expect(verifyMfaCookie(userId, userId, secret)).toBe(false);
  });

  it("rechaza otro usuario o firma alterada", () => {
    const token = signMfaCookie(userId, secret);
    expect(verifyMfaCookie(token, "22222222-2222-2222-2222-222222222222", secret)).toBe(false);
    expect(verifyMfaCookie(`${token}x`, userId, secret)).toBe(false);
  });

  it("rechaza un token vencido", () => {
    const now = 1_700_000_000_000;
    const token = signMfaCookie(userId, secret, now);
    expect(verifyMfaCookie(token, userId, secret, now + 13 * 60 * 60 * 1000)).toBe(false);
  });
});

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

describe("credentialsInvalidateJwt", () => {
  it("invalida un JWT emitido antes del cambio de contraseña", () => {
    const iat = 1_700_000_000;
    const changedAt = new Date((iat + 60) * 1000);
    expect(credentialsInvalidateJwt(iat, changedAt)).toBe(true);
  });

  it("conserva un JWT posterior al cambio", () => {
    const iat = 1_700_000_060;
    const changedAt = new Date(1_700_000_000 * 1000);
    expect(credentialsInvalidateJwt(iat, changedAt)).toBe(false);
  });

  it("no invalida si nunca se cambió la contraseña", () => {
    expect(credentialsInvalidateJwt(1_700_000_000, null)).toBe(false);
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
