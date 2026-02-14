import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const routersPath = resolve(__dirname, "routers.ts");
const routersSource = readFileSync(routersPath, "utf-8");
const dbPath = resolve(__dirname, "db.ts");
const dbSource = readFileSync(dbPath, "utf-8");
const schemaPath = resolve(__dirname, "../drizzle/schema.ts");
const schemaSource = readFileSync(schemaPath, "utf-8");
const adminLayoutPath = resolve(__dirname, "../client/src/components/AdminLayout.tsx");
const adminLayoutSource = readFileSync(adminLayoutPath, "utf-8");
const usersPagePath = resolve(__dirname, "../client/src/pages/admin/Users.tsx");
const usersPageSource = readFileSync(usersPagePath, "utf-8");
const appPath = resolve(__dirname, "../client/src/App.tsx");
const appSource = readFileSync(appPath, "utf-8");

describe("User Management - Database Layer", () => {
  it("has getAllUsers function in db.ts", () => {
    expect(dbSource).toContain("export async function getAllUsers()");
  });

  it("getAllUsers joins user data with customer profiles", () => {
    const fnStart = dbSource.indexOf("export async function getAllUsers()");
    const fnBlock = dbSource.substring(fnStart, fnStart + 800);
    expect(fnBlock).toContain("customerProfiles");
    expect(fnBlock).toContain("tokenBalance");
    expect(fnBlock).toContain("membershipTier");
  });

  it("has getAdminUserDetails function in db.ts", () => {
    expect(dbSource).toContain("export async function getAdminUserDetails(userId: number)");
  });

  it("getAdminUserDetails fetches orders, submissions, and token transactions", () => {
    const fnStart = dbSource.indexOf("export async function getAdminUserDetails");
    const fnBlock = dbSource.substring(fnStart, fnStart + 1000);
    expect(fnBlock).toContain("orders");
    expect(fnBlock).toContain("sellSubmissions");
    expect(fnBlock).toContain("tokenTransactions");
  });

  it("getAdminUserDetails uses withRetry for resilience", () => {
    const fnStart = dbSource.indexOf("export async function getAdminUserDetails");
    const fnBlock = dbSource.substring(fnStart, fnStart + 200);
    expect(fnBlock).toContain("withRetry");
  });
});

describe("User Management - tRPC Procedures", () => {
  it("has users.list admin procedure", () => {
    expect(routersSource).toContain("users: router({");
    const usersStart = routersSource.indexOf("users: router({");
    const usersBlock = routersSource.substring(usersStart, usersStart + 500);
    expect(usersBlock).toContain("list: adminProcedure");
    expect(usersBlock).toContain("getAllUsers");
  });

  it("has users.getById admin procedure with userId input", () => {
    const usersStart = routersSource.indexOf("users: router({");
    const usersBlock = routersSource.substring(usersStart, usersStart + 800);
    expect(usersBlock).toContain("getById: adminProcedure");
    expect(usersBlock).toContain("userId: z.number()");
    expect(usersBlock).toContain("getAdminUserDetails");
  });

  it("has users.updateRole admin procedure", () => {
    const usersStart = routersSource.indexOf("users: router({");
    const usersBlock = routersSource.substring(usersStart, usersStart + 1200);
    expect(usersBlock).toContain("updateRole: adminProcedure");
    expect(usersBlock).toContain('role: z.enum(["user", "admin"])');
  });

  it("updateRole prevents admin from changing their own role", () => {
    const usersStart = routersSource.indexOf("users: router({");
    const usersBlock = routersSource.substring(usersStart, usersStart + 1200);
    expect(usersBlock).toContain("ctx.user.id");
    expect(usersBlock).toContain("Cannot change your own role");
  });

  it("all user procedures require admin access", () => {
    const usersStart = routersSource.indexOf("users: router({");
    const usersBlock = routersSource.substring(usersStart, usersStart + 1200);
    const adminCount = (usersBlock.match(/adminProcedure/g) || []).length;
    expect(adminCount).toBeGreaterThanOrEqual(3);
  });
});

describe("User Management - Admin UI", () => {
  it("has Users link in admin sidebar navigation", () => {
    expect(adminLayoutSource).toContain("/admin/users");
    expect(adminLayoutSource).toContain('"Users"');
  });

  it("imports Users icon for sidebar", () => {
    expect(adminLayoutSource).toContain("Users");
  });

  it("admin Users page exists", () => {
    expect(usersPageSource).toContain("User Management");
  });

  it("Users page has search functionality", () => {
    expect(usersPageSource).toContain("Search by name, email, or ID");
  });

  it("Users page has role filter (All, Customers, Admins)", () => {
    expect(usersPageSource).toContain("roleFilter");
    expect(usersPageSource).toContain("Customers");
    expect(usersPageSource).toContain("Admins");
  });

  it("Users page shows user stats (total, customers, admins)", () => {
    expect(usersPageSource).toContain("Total Users");
    expect(usersPageSource).toContain("stats.total");
    expect(usersPageSource).toContain("stats.customers");
    expect(usersPageSource).toContain("stats.admins");
  });

  it("Users page has detail dialog with user info", () => {
    expect(usersPageSource).toContain("User Details");
    expect(usersPageSource).toContain("DialogContent");
    expect(usersPageSource).toContain("userDetails");
  });

  it("detail dialog shows token balance section", () => {
    expect(usersPageSource).toContain("Token Balance");
    expect(usersPageSource).toContain("tokenBalance");
    expect(usersPageSource).toContain("totalTokensEarned");
    expect(usersPageSource).toContain("totalTokensSpent");
    expect(usersPageSource).toContain("totalTokensDonated");
  });

  it("detail dialog shows orders section", () => {
    expect(usersPageSource).toContain("Orders");
    expect(usersPageSource).toContain("userDetails.orders");
  });

  it("detail dialog shows sell submissions section", () => {
    expect(usersPageSource).toContain("Sell Submissions");
    expect(usersPageSource).toContain("userDetails.sellSubmissions");
  });

  it("detail dialog shows recent token activity", () => {
    expect(usersPageSource).toContain("Recent Token Activity");
    expect(usersPageSource).toContain("recentTokenTransactions");
  });

  it("detail dialog has role management controls", () => {
    expect(usersPageSource).toContain("updateRole");
    expect(usersPageSource).toContain("Customer");
    expect(usersPageSource).toContain("Admin");
  });

  it("Users page displays membership tier badges", () => {
    expect(usersPageSource).toContain("membershipTier");
    expect(usersPageSource).toContain("tierColor");
  });
});

describe("User Management - Routing", () => {
  it("App.tsx has lazy import for AdminUsers", () => {
    expect(appSource).toContain('const AdminUsers = lazy(() => import("./pages/admin/Users"))');
  });

  it("App.tsx has route for /admin/users", () => {
    expect(appSource).toContain('/admin/users');
    expect(appSource).toContain("AdminUsers");
  });
});
