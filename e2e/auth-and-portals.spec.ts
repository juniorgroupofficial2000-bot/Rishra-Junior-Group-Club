import { expect, test } from "@playwright/test";

const memberEmail = process.env.E2E_MEMBER_EMAIL ?? "member@rjgc.local";
const memberPassword = process.env.E2E_MEMBER_PASSWORD ?? "MemberDemo1!";
const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@rjgc.local";
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "AdminDemo1!";

async function login(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
  expectPath: RegExp,
) {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /^sign in$/i })).toBeVisible();
  // Prefer stable ids — label queries can race hydration on this form.
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await expect(page.locator("#email")).toHaveValue(email);
  await expect(page.locator("#password")).toHaveValue(password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(expectPath, { timeout: 30_000 });
}

test.describe("member portal e2e", () => {
  test("member login reaches dashboard", async ({ page }) => {
    await login(page, memberEmail, memberPassword, /\/member\/dashboard/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("member cannot open admin dashboard", async ({ page }) => {
    await login(page, memberEmail, memberPassword, /\/member\/dashboard/);
    await page.goto("/admin/dashboard");
    await expect(page).not.toHaveURL(/\/admin\/dashboard$/);
  });

  test("invalid credentials show an error (failure path)", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill(memberEmail);
    await page.locator("#password").fill("WrongPassword1!");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("admin portal e2e", () => {
  test("admin login reaches admin dashboard", async ({ page }) => {
    await login(page, adminEmail, adminPassword, /\/admin\/dashboard/);
  });

  test("admin can open member management", async ({ page }) => {
    await login(page, adminEmail, adminPassword, /\/admin\/dashboard/);
    await page.goto("/admin/members");
    await expect(page).toHaveURL(/\/admin\/members/);
    await expect(
      page.getByRole("heading", { name: /^members$/i }),
    ).toBeVisible();
  });
});

test.describe("payment sandbox surface", () => {
  test("member mandate / payments pages load without exposing other members", async ({
    page,
  }) => {
    await login(page, memberEmail, memberPassword, /\/member\/dashboard/);
    await page.goto("/member/payments");
    await expect(page).toHaveURL(/\/member\/payments/);
    await page.goto("/member/mandate");
    await expect(page).toHaveURL(/\/member\/mandate/);
    await page.goto("/member/payments?memberId=someone-else");
    await expect(page).toHaveURL(/\/member\/payments/);
    await expect(page.locator("body")).not.toContainText("someone-else");
  });
});

test.describe("events surface", () => {
  test("public events page is reachable; member events page requires session", async ({
    page,
  }) => {
    await page.goto("/events");
    await expect(
      page.getByRole("heading", { name: "Events", exact: true }),
    ).toBeVisible();

    await page.goto("/member/events");
    await expect(page).toHaveURL(/\/login/);
  });
});
