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

  it("should center the heading with flex justify-center", () => {
    const wrapperLine = homeContent.split("\n").find(l => l.includes("absolute") && l.includes("top-["));
    expect(wrapperLine).toContain("justify-center");
  });

  it("should center the subtitle with mx-auto", () => {
    const pLine = homeContent.split("\n").find(l => l.includes("hero-byline"));
    expect(pLine).toContain("mx-auto");
  });

  it("should still contain Shop Now and See What's New buttons", () => {
    expect(homeContent).toContain("Shop Now");
    expect(homeContent).toContain("See What's New");
  });

  it("should have the tagline centered with mx-auto and tracking-wide", () => {
    const taglineLine = homeContent.split("\n").find(l => l.includes("Every piece is one-of-a-kind"));
    expect(taglineLine).toBeDefined();
    // Check the className on the <p> wrapping the tagline
    const pLine = homeContent.split("\n").find(l => l.includes("mx-auto") && l.includes("tracking-wide") && l.includes("text-muted-foreground"));
    expect(pLine).toBeDefined();
  });

  it("should use flex spacer to separate heading from lower content", () => {
    expect(homeContent).toContain("flex-1");
    expect(homeContent).toContain("flex flex-col items-center text-center");
  });

  it("should position the heading with percentage-based absolute positioning", () => {
    // The heading uses absolute positioning with top-[12%] to sit between shelf and rack
    const lines = homeContent.split("\n");
    const headingWrapperIdx = lines.findIndex(l => l.includes("absolute") && l.includes("top-["));
    const headingIdx = lines.findIndex(l => l.includes("Premium Preloved"));
    expect(headingWrapperIdx).toBeGreaterThan(-1);
    expect(headingIdx).toBeGreaterThan(headingWrapperIdx);
    // The flex-1 spacer should still exist for bottom content
    const spacerIdx = lines.findIndex((l, i) => i > headingIdx && l.includes("flex-1"));
    expect(spacerIdx).toBeGreaterThan(headingIdx);
  });
});
