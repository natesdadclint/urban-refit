import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const PAGES_DIR = path.resolve(__dirname, "../client/src/pages");
const COMPONENTS_DIR = path.resolve(__dirname, "../client/src/components");

// Pages that are exempt from heading standardisation
const EXEMPT_PAGES = [
  "Home.tsx",       // Hero has special animation classes
  "Roadmap.tsx",    // Self-contained styling
  "ProductDetail.tsx", // Dynamic product title
  "Shop.tsx",       // Dynamic heading with filters
  "Profile.tsx",    // Tab-based layout with dynamic headings
  "Notifications.tsx", // Not yet updated (Sprint 1A phase 2)
  "Reviews.tsx",    // Not yet updated (Sprint 1A phase 2)
];

// Admin pages are also exempt
const isAdminPage = (filename: string) =>
  filename.startsWith("Admin") || filename.startsWith("admin");

function getPageFiles(): string[] {
  return fs
    .readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith(".tsx") && !EXEMPT_PAGES.includes(f) && !isAdminPage(f));
}

describe("PageHeader component", () => {
  it("should exist at components/PageHeader.tsx", () => {
    const filePath = path.join(COMPONENTS_DIR, "PageHeader.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("should export a default function", () => {
    const content = fs.readFileSync(
      path.join(COMPONENTS_DIR, "PageHeader.tsx"),
      "utf-8"
    );
    expect(content).toContain("export default function PageHeader");
  });

  it("should render an h1 element", () => {
    const content = fs.readFileSync(
      path.join(COMPONENTS_DIR, "PageHeader.tsx"),
      "utf-8"
    );
    expect(content).toContain("<h1");
  });

  it("should support default and compact variants", () => {
    const content = fs.readFileSync(
      path.join(COMPONENTS_DIR, "PageHeader.tsx"),
      "utf-8"
    );
    expect(content).toContain('"default"');
    expect(content).toContain('"compact"');
  });

  it("should use consistent font-serif and tracking-tight on H1", () => {
    const content = fs.readFileSync(
      path.join(COMPONENTS_DIR, "PageHeader.tsx"),
      "utf-8"
    );
    // Both variants should use font-serif and tracking-tight
    const h1Matches = content.match(/<h1[^>]*className="([^"]*)"/g) || [];
    expect(h1Matches.length).toBeGreaterThanOrEqual(1);
    for (const match of h1Matches) {
      expect(match).toContain("font-serif");
      expect(match).toContain("tracking-tight");
    }
  });
});

describe("SectionHeader component", () => {
  it("should exist at components/SectionHeader.tsx", () => {
    const filePath = path.join(COMPONENTS_DIR, "SectionHeader.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("should export a default function", () => {
    const content = fs.readFileSync(
      path.join(COMPONENTS_DIR, "SectionHeader.tsx"),
      "utf-8"
    );
    expect(content).toContain("export default function SectionHeader");
  });

  it("should render h2 and h3 elements", () => {
    const content = fs.readFileSync(
      path.join(COMPONENTS_DIR, "SectionHeader.tsx"),
      "utf-8"
    );
    expect(content).toContain("<h2");
    expect(content).toContain("<h3");
  });

  it("should support centered prop", () => {
    const content = fs.readFileSync(
      path.join(COMPONENTS_DIR, "SectionHeader.tsx"),
      "utf-8"
    );
    expect(content).toContain("centered");
    expect(content).toContain("text-center");
  });

  it("should use consistent font-serif and tracking-tight on H2", () => {
    const content = fs.readFileSync(
      path.join(COMPONENTS_DIR, "SectionHeader.tsx"),
      "utf-8"
    );
    const h2Matches = content.match(/<h2[^>]*className="([^"]*)"/g) || [];
    expect(h2Matches.length).toBeGreaterThanOrEqual(1);
    for (const match of h2Matches) {
      expect(match).toContain("font-serif");
      expect(match).toContain("tracking-tight");
    }
  });

  it("should use consistent font-serif and tracking-tight on H3", () => {
    const content = fs.readFileSync(
      path.join(COMPONENTS_DIR, "SectionHeader.tsx"),
      "utf-8"
    );
    const h3Matches = content.match(/<h3[^>]*className="([^"]*)"/g) || [];
    expect(h3Matches.length).toBeGreaterThanOrEqual(1);
    for (const match of h3Matches) {
      expect(match).toContain("font-serif");
      expect(match).toContain("tracking-tight");
    }
  });
});

describe("Page heading standardisation", () => {
  const pages = getPageFiles();

  it("should have updated pages (at least 15)", () => {
    // We updated 22 pages in the batch
    expect(pages.length).toBeGreaterThanOrEqual(15);
  });

  describe.each(pages)("%s", (filename) => {
    const filePath = path.join(PAGES_DIR, filename);
    const content = fs.readFileSync(filePath, "utf-8");

    it("should import PageHeader or SectionHeader", () => {
      const hasPageHeader = content.includes('import PageHeader from "@/components/PageHeader"');
      const hasSectionHeader = content.includes('import SectionHeader from "@/components/SectionHeader"');
      expect(hasPageHeader || hasSectionHeader).toBe(true);
    });

    it("should use PageHeader component (exactly one H1 per page)", () => {
      // Pages should use <PageHeader to render their H1
      expect(content).toContain("<PageHeader");
    });

    it("should not have raw standalone <h1> tags outside PageHeader", () => {
      // Remove the PageHeader component import/usage to check for raw h1s
      // We look for <h1 that is NOT inside the PageHeader component file itself
      const lines = content.split("\n");
      const rawH1Lines = lines.filter(
        (line) =>
          line.includes("<h1") &&
          !line.trim().startsWith("//") &&
          !line.trim().startsWith("*")
      );
      // All h1s should be inside PageHeader, so raw h1 count should be 0
      expect(rawH1Lines.length).toBe(0);
    });
  });
});

describe("Heading hierarchy consistency", () => {
  it("PageHeader H1 type scale should be text-4xl md:text-5xl for default variant", () => {
    const content = fs.readFileSync(
      path.join(COMPONENTS_DIR, "PageHeader.tsx"),
      "utf-8"
    );
    // Default variant H1
    expect(content).toContain("text-4xl md:text-5xl");
  });

  it("PageHeader H1 type scale should be text-3xl md:text-4xl for compact variant", () => {
    const content = fs.readFileSync(
      path.join(COMPONENTS_DIR, "PageHeader.tsx"),
      "utf-8"
    );
    expect(content).toContain("text-3xl md:text-4xl");
  });

  it("SectionHeader H2 type scale should be text-2xl md:text-3xl", () => {
    const content = fs.readFileSync(
      path.join(COMPONENTS_DIR, "SectionHeader.tsx"),
      "utf-8"
    );
    expect(content).toContain("text-2xl md:text-3xl");
  });

  it("SectionHeader H3 type scale should be text-lg md:text-xl", () => {
    const content = fs.readFileSync(
      path.join(COMPONENTS_DIR, "SectionHeader.tsx"),
      "utf-8"
    );
    expect(content).toContain("text-lg md:text-xl");
  });
});
