import { expect, test } from "@playwright/test";

test.describe("sitio institucional", () => {
  test("la home prioriza los servicios y el buscador sugiere un área", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page).toHaveTitle(/Arce & Valdés/);

    await page
      .getByRole("searchbox", { name: "Contanos qué necesitás resolver" })
      .fill("me despidieron");
    const suggestion = page.getByRole("link", { name: /Laboral/ }).first();
    await expect(suggestion).toBeVisible();
    await suggestion.click();
    await expect(page).toHaveURL(/\/servicios\/laboral$/);
    await expect(page.getByRole("heading", { level: 1, name: "Laboral" })).toBeVisible();
  });

  test("las 10 áreas tienen página propia con FAQ", async ({ page }) => {
    await page.goto("/servicios");
    const links = page
      .getByRole("region", { name: "Listado de áreas" })
      .locator('a[href^="/servicios/"]');
    await expect(links).toHaveCount(10);

    await page.goto("/servicios/defensa-del-consumidor");
    await expect(page.getByRole("navigation", { name: "Migas de pan" })).toBeVisible();
    const faq = page.getByRole("main").getByRole("button", { expanded: false }).first();
    await faq.click();
    await expect(
      page.getByRole("main").getByRole("button", { expanded: true }).first(),
    ).toBeVisible();
  });

  test("navegación principal", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) {
      await page.getByRole("button", { name: "Abrir menú" }).click();
      await page
        .getByRole("navigation", { name: "Móvil" })
        .getByRole("link", { name: "Estudio" })
        .click();
    } else {
      await page
        .getByRole("navigation", { name: "Principal" })
        .getByRole("link", { name: "Estudio" })
        .click();
    }
    await expect(page).toHaveURL(/\/estudio$/);
  });

  test("404 amigable", async ({ page }) => {
    const res = await page.goto("/no-existe");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("link", { name: /inicio/i }).first()).toBeVisible();
  });

  test("SEO: sitemap, robots y JSON-LD", async ({ page, request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain("/servicios/laboral");

    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /portal");

    await page.goto("/servicios/laboral");
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.join()).toContain('"FAQPage"');
  });

  test("headers de seguridad", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-powered-by"]).toBeUndefined();
  });
});
