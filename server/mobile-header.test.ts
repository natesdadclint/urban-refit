import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * Mobile Header Navigation Tests
 * Verifies the two-row header layout:
 * - Row 1: Logo + actions (desktop nav hidden below xl)
 * - Row 2: Scrollable horizontal nav (visible below xl, hidden on xl+)
 */

const layoutPath = path.resolve(__dirname, "../client/src/components/Layout.tsx");
const layoutContent = fs.readFileSync(layoutPath, "utf-8");

const cssPath = path.resolve(__dirname, "../client/src/index.css");
const cssContent = fs.readFileSync(cssPath, "utf-8");

describe("Mobile Header: Two-Row Layout", () => {
  describe("Row 1: Logo + Actions", () => {
    it("should have a responsive header height on mobile (h-16) and taller on xl (xl:h-20)", () => {
      expect(layoutContent).toContain("h-16");
      expect(layoutContent).toContain("xl:h-20");
    });

    it("should have the Urban Refit logo", () => {
      expect(layoutContent).toContain("Urban Refit");
    });

    it("should have a responsive logo text size", () => {
      expect(layoutContent).toMatch(/text-3xl\s+sm:text-4xl\s+md:text-5xl/);
    });
  });

  describe("Desktop Navigation (Row 1 inline)", () => {
    it("should hide desktop nav below xl breakpoint", () => {
      expect(layoutContent).toContain('hidden xl:flex');
    });

    it("should include all main nav links in desktop nav", () => {
      const desktopNavLinks = ["Shop", "Blog", "About Us", "Charities", "Sell", "Tokens"];
      for (const link of desktopNavLinks) {
        expect(layoutContent).toContain(link);
      }
    });
  });

  describe("Row 2: Scrollable Mobile Nav", () => {
    it("should have a mobile nav that is hidden on xl+", () => {
      expect(layoutContent).toContain("xl:hidden");
    });

    it("should have overflow-x-auto for horizontal scrolling", () => {
      expect(layoutContent).toContain("overflow-x-auto");
    });

    it("should use scrollbar-hide class for clean appearance", () => {
      expect(layoutContent).toContain("scrollbar-hide");
    });

    it("should have all navigation links in the mobile scrollable nav", () => {
      const mobileNavLabels = ["Shop", "Tops", "Bottoms", "Outerwear", "Shoes", "Blog", "About", "Charities", "Sell", "Tokens"];
      for (const label of mobileNavLabels) {
        expect(layoutContent).toContain(`label: "${label}"`);
      }
    });

    it("should use shrink-0 on links to prevent text wrapping", () => {
      expect(layoutContent).toContain("shrink-0");
    });

    it("should use whitespace-nowrap on links", () => {
      expect(layoutContent).toContain("whitespace-nowrap");
    });

    it("should have proper touch target height (py-2.5 = 10px padding = ~40px+ total)", () => {
      expect(layoutContent).toContain("py-2.5");
    });

    it("should use border-b-2 for active link indicator", () => {
      expect(layoutContent).toContain("border-b-2");
    });

    it("should highlight active link with border-primary", () => {
      expect(layoutContent).toContain("border-primary text-primary");
    });

    it("should use border-transparent for inactive links", () => {
      expect(layoutContent).toContain("border-transparent text-muted-foreground");
    });
  });

  describe("Scroll Direction Arrows", () => {
    it("should have a left scroll arrow button with aria-label", () => {
      expect(layoutContent).toContain('aria-label="Scroll navigation left"');
    });

    it("should have a right scroll arrow button with aria-label", () => {
      expect(layoutContent).toContain('aria-label="Scroll navigation right"');
    });

    it("should use ChevronLeft and ChevronRight icons", () => {
      expect(layoutContent).toContain("ChevronLeft");
      expect(layoutContent).toContain("ChevronRight");
    });

    it("should conditionally show left arrow based on canScrollLeft state", () => {
      expect(layoutContent).toContain("canScrollLeft");
    });

    it("should conditionally show right arrow based on canScrollRight state", () => {
      expect(layoutContent).toContain("canScrollRight");
    });

    it("should have fade gradient on left arrow (bg-gradient-to-r from-background)", () => {
      expect(layoutContent).toContain("bg-gradient-to-r from-background");
    });

    it("should have fade gradient on right arrow (bg-gradient-to-l from-background)", () => {
      expect(layoutContent).toContain("bg-gradient-to-l from-background");
    });

    it("should use a ref for scroll tracking", () => {
      expect(layoutContent).toContain("navScrollRef");
    });

    it("should have a scrollNav function for smooth scrolling", () => {
      expect(layoutContent).toContain("scrollNav");
      expect(layoutContent).toContain('behavior: "smooth"');
    });

    it("should use ResizeObserver to update arrows on resize", () => {
      expect(layoutContent).toContain("ResizeObserver");
    });

    it("should have data-testid attributes for testing", () => {
      expect(layoutContent).toContain('data-testid="mobile-nav"');
      expect(layoutContent).toContain('data-testid="nav-arrow-left"');
      expect(layoutContent).toContain('data-testid="nav-arrow-right"');
    });
  });

  describe("No Hamburger Menu", () => {
    it("should NOT have a hamburger menu button (no mobileMenuOpen state)", () => {
      expect(layoutContent).not.toContain("mobileMenuOpen");
    });

    it("should NOT import Menu or X icons from lucide-react", () => {
      // Check the import line specifically
      const importLine = layoutContent.split("\n").find(l => l.includes("lucide-react"));
      expect(importLine).not.toContain(" Menu");
      expect(importLine).not.toContain(" X,");
      expect(importLine).not.toContain(" X }");
    });
  });

  describe("Auth Actions on Mobile", () => {
    it("should show Join and Sign In buttons on all screen sizes", () => {
      // Should NOT have hidden sm:flex (which would hide on mobile)
      // Instead should use flex items-center
      const joinSignInSection = layoutContent.includes('flex items-center gap-1 sm:gap-2');
      expect(joinSignInSection).toBe(true);
    });

    it("should have responsive button sizing for mobile", () => {
      expect(layoutContent).toContain("h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm");
    });
  });
});

describe("Scrollbar Hide CSS Utility", () => {
  it("should define .scrollbar-hide class in index.css", () => {
    expect(cssContent).toContain(".scrollbar-hide");
  });

  it("should hide webkit scrollbar", () => {
    expect(cssContent).toContain(".scrollbar-hide::-webkit-scrollbar");
    expect(cssContent).toContain("display: none");
  });

  it("should hide Firefox scrollbar", () => {
    expect(cssContent).toContain("scrollbar-width: none");
  });

  it("should hide IE/Edge scrollbar", () => {
    expect(cssContent).toContain("-ms-overflow-style: none");
  });
});
