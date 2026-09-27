import { expect, test } from "@playwright/test";

test.describe("formularios", () => {
  test("contacto: valida en el servidor y muestra errores accesibles", async ({ page }) => {
    await page.goto("/contacto");
    await page.getByLabel("Nombre y apellido").fill("A");
    await page.getByLabel("Email").fill("no-es-un-email");
    await page.getByRole("button", { name: "Enviar consulta" }).click();

    await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("Ingresá un email válido.")).toBeVisible();
    await expect(page.getByText(/consentimiento/).first()).toBeVisible();
  });

  test("contacto: preselecciona el área desde la URL", async ({ page }) => {
    await page.goto("/contacto?area=penal");
    await expect(page.getByLabel("Área de consulta")).toHaveValue("penal");
  });

  test("turnos: muestra horarios solo en días hábiles", async ({ page }) => {
    await page.goto("/turnos", { waitUntil: "networkidle" });
    const date = page.getByLabel("Fecha");
    const min = await date.getAttribute("min");
    expect(min).toBeTruthy();

    const next = nextWeekday(new Date(`${min}T12:00:00-03:00`), 3);
    await date.fill(next);
    const slots = page.getByRole("radiogroup", { name: "Horario" }).getByRole("radio");
    await expect(slots).toHaveCount(8);

    await date.fill(nextSaturday(new Date(`${min}T12:00:00-03:00`)));
    await expect(page.getByText("No atendemos ese día.", { exact: false })).toBeVisible();
  });
});

function toIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function nextWeekday(from: Date, skip: number) {
  const d = new Date(from);
  let count = 0;
  while (count < skip) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) count++;
  }
  return toIso(d);
}

function nextSaturday(from: Date) {
  const d = new Date(from);
  do d.setUTCDate(d.getUTCDate() + 1);
  while (d.getUTCDay() !== 6);
  return toIso(d);
}
