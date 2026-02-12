import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const clientSrc = path.resolve(__dirname, "../client/src");
const serverDir = path.resolve(__dirname);

describe("Banner Notification System", () => {
  // ============ SCHEMA ============
  describe("Database Schema", () => {
    const schema = fs.readFileSync(path.resolve(__dirname, "../drizzle/schema.ts"), "utf-8");

    it("should have site_banners table", () => {
      expect(schema).toContain('mysqlTable("site_banners"');
    });

    it("should have required columns", () => {
      expect(schema).toContain("title:");
      expect(schema).toContain("message:");
      expect(schema).toContain("isActive:");
    });

    it("should have type enum with info, promo, warning, urgent", () => {
      expect(schema).toContain('"info"');
      expect(schema).toContain('"promo"');
      expect(schema).toContain('"warning"');
      expect(schema).toContain('"urgent"');
    });

    it("should have optional link fields", () => {
      expect(schema).toContain("linkUrl:");
      expect(schema).toContain("linkText:");
    });

    it("should have optional date range fields", () => {
      expect(schema).toContain("startDate:");
      expect(schema).toContain("endDate:");
    });

    it("should export SiteBanner types", () => {
      expect(schema).toContain("export type SiteBanner");
      expect(schema).toContain("export type InsertSiteBanner");
    });
  });

  // ============ DB HELPERS ============
  describe("Database Helpers", () => {
    const dbFile = fs.readFileSync(path.resolve(serverDir, "db.ts"), "utf-8");

    it("should import siteBanners from schema", () => {
      expect(dbFile).toContain("siteBanners");
    });

    it("should have getActiveBanners helper", () => {
      expect(dbFile).toContain("async function getActiveBanners");
    });

    it("should have getAllBanners helper", () => {
      expect(dbFile).toContain("async function getAllBanners");
    });

    it("should have createBanner helper", () => {
      expect(dbFile).toContain("async function createBanner");
    });

    it("should have updateBanner helper", () => {
      expect(dbFile).toContain("async function updateBanner");
    });

    it("should have deleteBanner helper", () => {
      expect(dbFile).toContain("async function deleteBanner");
    });

    it("should have toggleBannerActive helper", () => {
      expect(dbFile).toContain("async function toggleBannerActive");
    });

    it("should filter active banners by date range", () => {
      expect(dbFile).toContain("b.startDate");
      expect(dbFile).toContain("b.endDate");
    });
  });

  // ============ tRPC PROCEDURES ============
  describe("tRPC Procedures", () => {
    const routers = fs.readFileSync(path.resolve(serverDir, "routers.ts"), "utf-8");

    it("should have banners router", () => {
      expect(routers).toContain("banners: router(");
    });

    it("should have public getActive procedure", () => {
      expect(routers).toContain("getActive: publicProcedure");
    });

    it("should have admin getAll procedure", () => {
      expect(routers).toContain("getAll: adminProcedure");
    });

    it("should have admin create procedure", () => {
      expect(routers).toContain("create: adminProcedure");
    });

    it("should have admin update procedure with id input", () => {
      expect(routers).toContain("update: adminProcedure");
    });

    it("should have admin toggleActive procedure", () => {
      expect(routers).toContain("toggleActive: adminProcedure");
    });

    it("should have admin delete procedure", () => {
      expect(routers).toContain("delete: adminProcedure");
    });
  });

  // ============ FRONTEND COMPONENT ============
  describe("AnnouncementBanner Component", () => {
    const component = fs.readFileSync(
      path.resolve(clientSrc, "components/AnnouncementBanner.tsx"),
      "utf-8"
    );

    it("should exist", () => {
      expect(component).toBeDefined();
    });

    it("should query active banners via trpc", () => {
      expect(component).toContain("trpc.banners.getActive.useQuery");
    });

    it("should support dismissing banners", () => {
      expect(component).toContain("dismissBanner");
      expect(component).toContain("localStorage");
    });

    it("should have type-specific styling for info", () => {
      expect(component).toContain("bg-sky-600");
    });

    it("should have type-specific styling for promo", () => {
      expect(component).toContain("bg-emerald-600");
    });

    it("should have type-specific styling for warning", () => {
      expect(component).toContain("bg-amber-500");
    });

    it("should have type-specific styling for urgent", () => {
      expect(component).toContain("bg-red-600");
    });

    it("should have dismiss button with X icon", () => {
      expect(component).toContain("Dismiss banner");
      expect(component).toContain("<X");
    });

    it("should support optional link rendering", () => {
      expect(component).toContain("banner.linkUrl");
      expect(component).toContain("banner.linkText");
    });

    it("should filter out dismissed banners", () => {
      expect(component).toContain("dismissedIds");
      expect(component).toContain("getDismissedIds");
    });
  });

  // ============ LAYOUT INTEGRATION ============
  describe("Layout Integration", () => {
    const layout = fs.readFileSync(
      path.resolve(clientSrc, "components/Layout.tsx"),
      "utf-8"
    );

    it("should import AnnouncementBanner", () => {
      expect(layout).toContain("import AnnouncementBanner");
    });

    it("should render AnnouncementBanner above the header", () => {
      const bannerIndex = layout.indexOf("<AnnouncementBanner");
      const headerIndex = layout.indexOf("<header");
      expect(bannerIndex).toBeGreaterThan(-1);
      expect(headerIndex).toBeGreaterThan(-1);
      expect(bannerIndex).toBeLessThan(headerIndex);
    });
  });

  // ============ ADMIN PAGE ============
  describe("Admin Banners Page", () => {
    const adminPage = fs.readFileSync(
      path.resolve(clientSrc, "pages/admin/Banners.tsx"),
      "utf-8"
    );

    it("should exist", () => {
      expect(adminPage).toBeDefined();
    });

    it("should use AdminLayout", () => {
      expect(adminPage).toContain("AdminLayout");
    });

    it("should query all banners", () => {
      expect(adminPage).toContain("trpc.banners.getAll.useQuery");
    });

    it("should have create mutation", () => {
      expect(adminPage).toContain("trpc.banners.create.useMutation");
    });

    it("should have update mutation", () => {
      expect(adminPage).toContain("trpc.banners.update.useMutation");
    });

    it("should have toggle mutation", () => {
      expect(adminPage).toContain("trpc.banners.toggleActive.useMutation");
    });

    it("should have delete mutation", () => {
      expect(adminPage).toContain("trpc.banners.delete.useMutation");
    });

    it("should have a New Banner button", () => {
      expect(adminPage).toContain("New Banner");
    });

    it("should have a form dialog with title and message fields", () => {
      expect(adminPage).toContain('id="title"');
      expect(adminPage).toContain('id="message"');
    });

    it("should have type selector with all four types", () => {
      expect(adminPage).toContain('"info"');
      expect(adminPage).toContain('"promo"');
      expect(adminPage).toContain('"warning"');
      expect(adminPage).toContain('"urgent"');
    });

    it("should have date range inputs", () => {
      expect(adminPage).toContain('type="datetime-local"');
      expect(adminPage).toContain("startDate");
      expect(adminPage).toContain("endDate");
    });

    it("should have a live preview section", () => {
      expect(adminPage).toContain("Preview");
    });

    it("should show empty state when no banners", () => {
      expect(adminPage).toContain("No banners yet");
    });
  });

  // ============ ADMIN NAV ============
  describe("Admin Navigation", () => {
    const adminLayout = fs.readFileSync(
      path.resolve(clientSrc, "components/AdminLayout.tsx"),
      "utf-8"
    );

    it("should have Site Banners nav item", () => {
      expect(adminLayout).toContain('"Site Banners"');
    });

    it("should link to /admin/banners", () => {
      expect(adminLayout).toContain('"/admin/banners"');
    });

    it("should use Megaphone icon", () => {
      expect(adminLayout).toContain("Megaphone");
    });
  });

  // ============ APP ROUTES ============
  describe("App Routes", () => {
    const appFile = fs.readFileSync(path.resolve(clientSrc, "App.tsx"), "utf-8");

    it("should lazy load AdminBanners", () => {
      expect(appFile).toContain('import("./pages/admin/Banners")');
    });

    it("should have /admin/banners route", () => {
      expect(appFile).toContain('path="/admin/banners"');
    });
  });
});
