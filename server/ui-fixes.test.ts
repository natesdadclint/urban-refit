import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * UI Fixes Tests
 * 1. Admin sidebar: Notifications is the first item after Dashboard
 * 2. Hero CTA buttons: centered on the page
 */

const adminLayoutPath = path.resolve(__dirname, "../client/src/components/AdminLayout.tsx");
const adminLayoutContent = fs.readFileSync(adminLayoutPath, "utf-8");

const homePath = path.resolve(__dirname, "../client/src/pages/Home.tsx");
const homeContent = fs.readFileSync(homePath, "utf-8");

describe("Admin Sidebar: Notifications First", () => {
  it("should have Notifications as the second navItem (right after Dashboard)", () => {
    // Extract the navItems array order
    const dashboardIndex = adminLayoutContent.indexOf('label: "Dashboard"');
    const notificationsIndex = adminLayoutContent.indexOf('label: "Notifications"');
    const productsIndex = adminLayoutContent.indexOf('label: "Products"');

    expect(dashboardIndex).toBeGreaterThan(-1);
    expect(notificationsIndex).toBeGreaterThan(-1);
    expect(productsIndex).toBeGreaterThan(-1);

    // Notifications should come after Dashboard but before Products
    expect(notificationsIndex).toBeGreaterThan(dashboardIndex);
    expect(notificationsIndex).toBeLessThan(productsIndex);
  });

  it("should have Notifications linking to /admin/notifications", () => {
    const notifLine = adminLayoutContent.split("\n").find(l =>
      l.includes('label: "Notifications"')
    );
    expect(notifLine).toContain('/admin/notifications');
  });

  it("should use the Bell icon for Notifications", () => {
    expect(adminLayoutContent).toContain("icon: Bell, label: \"Notifications\"");
  });
});

describe("Hero CTA Buttons: Centered", () => {
  it("should center the hero content container with items-center and text-center", () => {
    expect(homeContent).toContain("items-center text-center");
  });

  it("should center the CTA buttons with justify-center", () => {
    expect(homeContent).toContain("justify-center items-center");
  });

  it("should center the heading with mx-auto", () => {
    const h1Line = homeContent.split("\n").find(l => l.includes("hero-header"));
    expect(h1Line).toContain("mx-auto");
  });

  it("should center the subtitle with mx-auto", () => {
    const pLine = homeContent.split("\n").find(l => l.includes("hero-byline"));
    expect(pLine).toContain("mx-auto");
  });

  it("should still contain Shop Now and See What's New buttons", () => {
    expect(homeContent).toContain("Shop Now");
    expect(homeContent).toContain("See What's New");
  });
});
