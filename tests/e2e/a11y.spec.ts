import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  "/",
  "/servicios",
  "/servicios/laboral",
  "/estudio",
  "/equipo",
  "/contacto",
  "/turnos",
  "/blog",
  "/portal/login",
];

test.describe("accesibilidad WCAG 2.2 AA", () => {
  for (const path of pages) {
    test(`${path} sin violaciones de axe`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} nodos`)).toEqual([]);
    });
  }

  test("el skip link lleva al contenido", async ({ page, isMobile }) => {
    test.skip(isMobile, "Sin teclado en mobile");
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /saltar/i });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page).toHaveURL(/#contenido$/);
  });
});
