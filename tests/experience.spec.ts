import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function next(page: Page) {
  await page.getByRole("button", { name: "Continuar al siguiente evento" }).click();
}

test("la experiencia móvil completa sus nueve eventos", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Sé que llegué/i })).toBeVisible();
  await page.getByRole("button", { name: /abrir antes/i }).click();

  const wake = page.getByRole("button", { name: "Mantén pulsado para despertar a Naye" });
  await wake.hover();
  await page.mouse.down();
  await page.waitForTimeout(1950);
  await page.mouse.up();
  await expect(page.getByText("nivel 19 desbloqueado")).toBeVisible();
  await next(page);

  const lights = page.getByRole("button", { name: /Desliza o toca para encender luces/i });
  for (let index = 0; index < 10; index += 1) await lights.click();
  await expect(page.getByText("19 años. horario de sueño aún pendiente.")).toBeVisible();
  await next(page);

  for (let index = 1; index <= 3; index += 1) {
    await page.getByRole("button", { name: `Revelar recuerdo ${index}` }).click();
  }
  await expect(page.getByText("3 de 3 fragmentos encontrados")).toBeVisible();
  await next(page);

  for (let index = 0; index < 4; index += 1) {
    await page.getByRole("button", { name: "seguir hablando" }).click();
  }
  await expect(page.getByText("Supongo que algunas cosas nunca cambian.")).toBeVisible();
  await next(page);

  await page.getByRole("button", { name: "Elegir ojo 3" }).click();
  await expect(page.getByText(/MIRA/)).toBeVisible();
  await next(page);

  for (let index = 0; index < 5; index += 1) {
    await page.getByRole("button", { name: "Fotografía siguiente" }).click();
  }
  await expect(page.getByText("una nueva etapa")).toBeVisible();
  await next(page);

  for (let index = 0; index < 4; index += 1) {
    await page.getByRole("button", { name: /seguir leyendo/i }).click();
  }
  await expect(page.getByText("— Fetuchini")).toBeVisible();
  await next(page);

  await expect(page.getByRole("heading", { name: /Feliz cumpleaños/i })).toBeVisible();
  await expect(page.getByText(/cariño fraternal/i)).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test("cabe en una pantalla Android y no tiene infracciones serias iniciales", async ({ page }) => {
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyOverflow: getComputedStyle(document.body).overflow,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport);
  expect(dimensions.bodyOverflow).toBe("hidden");

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
  expect(serious).toEqual([]);
});

test("la apertura sigue utilizable en un Android compacto", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/");
  const action = page.getByRole("button", { name: /abrir antes/i });
  await expect(action).toBeVisible();
  const box = await action.boundingBox();
  expect(box).not.toBeNull();
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(640);
});
