import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.goto("http://localhost:5173/login");
  await page.getByPlaceholder("Login").click();
  await page.getByPlaceholder("Login").fill("kropel");
  await page.getByPlaceholder("Hasło").click();
  await page.getByPlaceholder("Hasło").fill("kropla");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByText("jakas tresc posta").click();
  await expect(page.getByText("jakas tresc posta")).toBeVisible();
  await expect(page.getByText("Wpis")).toBeVisible();
});
