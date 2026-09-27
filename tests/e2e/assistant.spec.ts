import { expect, test } from "@playwright/test";

test.describe("asistente IA (modo mock)", () => {
  test("responde en streaming, sugiere un área y muestra el disclaimer", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Abrir asistente virtual" }).click();

    const dialog = page.getByRole("dialog", { name: "Asistente virtual" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/no constituye asesoramiento/i)).toBeVisible();

    await dialog.getByPlaceholder("Escribí tu consulta…").fill("Me despidieron sin causa ayer");
    await dialog.getByRole("button", { name: "Enviar" }).click();

    await expect(dialog.getByText(/corresponde al área de Laboral/)).toBeVisible();
    await expect(dialog.getByRole("link", { name: "pedir turno", exact: true })).toHaveAttribute(
      "href",
      "/turnos",
    );

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("la API rechaza entradas inválidas", async ({ request }) => {
    const res = await request.post("/api/chat", { data: { messages: [] } });
    expect(res.status()).toBe(400);
  });
});
