import { test, expect } from "@playwright/test";

test("login should work", async ({ page }) => {
  // console.log(process.env.DB_CONNECTION_STRING);
  await page.goto("http://localhost:5173/login");
  await page.getByPlaceholder("Login").click();
  await page.getByPlaceholder("Login").fill("test");
  await page.getByPlaceholder("Hasło").click();
  await page.getByPlaceholder("Hasło").fill("test12345678");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByText("jakas tresc posta").click();
  await expect(page.getByText("jakas tresc posta")).toBeVisible();
  await expect(page.getByText("Wpis")).toBeVisible();
});
