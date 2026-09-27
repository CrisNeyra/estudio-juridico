import { expect, test } from "@playwright/test";

// Sin Supabase configurado el portal debe degradar de forma segura: sin errores,
// sin exponer datos y fuera del índice de buscadores.
test.describe("portal de clientes", () => {
  for (const path of ["/portal", "/portal/login", "/admin"]) {
    test(`${path} responde sin errores y no se indexa`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBeLessThan(500);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    });
  }

  test("el acceso a clientes está enlazado desde el sitio", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Portal de clientes" }).click();
    await expect(page).toHaveURL(/\/portal/);
  });
});
