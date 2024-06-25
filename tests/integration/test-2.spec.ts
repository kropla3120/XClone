import { test, expect } from "@playwright/test";
import { createMockDb } from "../utils";

// test.beforeAll(async () => {
//   // const db = await createMockDb();
// });

// test("test", async ({ page }) => {
//   await page.goto("http://localhost:5173/login");
//   await page.getByPlaceholder("Login").click();
//   await page.getByPlaceholder("Login").fill("kropla");
//   await page.getByPlaceholder("Login").press("Tab");
//   await page.getByPlaceholder("Hasło").fill("kropla");
//   await page.getByRole("button", { name: "Login" }).click();
//   await expect(page.getByRole("heading", { name: "Zaloguj się" })).toBeVisible();
// });
