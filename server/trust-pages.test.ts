import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const PAGES_DIR = path.resolve(__dirname, "../client/src/pages");
const COMPONENTS_DIR = path.resolve(__dirname, "../client/src/components");
const APP_FILE = path.resolve(__dirname, "../client/src/App.tsx");
const LAYOUT_FILE = path.resolve(COMPONENTS_DIR, "Layout.tsx");

// ─── Helper ───────────────────────────────────────────────────────────
function readPage(filename: string): string {
  return fs.readFileSync(path.join(PAGES_DIR, filename), "utf-8");
}

// ─── Our Process page ─────────────────────────────────────────────────
describe("Our Process page", () => {
  const content = readPage("OurProcess.tsx");

  it("should exist", () => {
    expect(fs.existsSync(path.join(PAGES_DIR, "OurProcess.tsx"))).toBe(true);
  });

  it("should export a default function", () => {
    expect(content).toContain("export default function OurProcess");
  });

  it("should use PageHeader component", () => {
    expect(content).toContain("<PageHeader");
    expect(content).toContain('title="Our Process"');
  });

  it("should use PageBreadcrumb component", () => {
    expect(content).toContain("<PageBreadcrumb");
    expect(content).toContain('label: "About Us"');
    expect(content).toContain('label: "Our Process"');
  });

  it("should use Layout wrapper", () => {
    expect(content).toContain("import Layout");
    expect(content).toContain("<Layout>");
  });

  it("should contain all 7 process steps", () => {
    expect(content).toContain('title: "Sourcing"');
    expect(content).toContain('title: "Inspection"');
    expect(content).toContain('title: "Photography"');
    expect(content).toContain('title: "Measurement"');
    expect(content).toContain('title: "Listing"');
    expect(content).toContain('title: "Packaging"');
    expect(content).toContain('title: "Delivery"');
  });

  it("should use SectionHeader components", () => {
    expect(content).toContain("<SectionHeader");
  });

  it("should link to Quality Standards and Meet the Founder", () => {
    expect(content).toContain('href="/quality-standards"');
    expect(content).toContain('href="/founder"');
  });

  it("should link to Courier Return programme", () => {
    expect(content).toContain('href="/courier-return"');
  });

  it("should have a Shop CTA", () => {
    expect(content).toContain('href="/shop"');
  });
});

// ─── Quality Standards page ───────────────────────────────────────────
describe("Quality Standards page", () => {
  const content = readPage("QualityStandards.tsx");

  it("should exist", () => {
    expect(fs.existsSync(path.join(PAGES_DIR, "QualityStandards.tsx"))).toBe(true);
  });

  it("should export a default function", () => {
    expect(content).toContain("export default function QualityStandards");
  });

  it("should use PageHeader component", () => {
    expect(content).toContain("<PageHeader");
    expect(content).toContain('title="Quality Standards"');
  });

  it("should use PageBreadcrumb component", () => {
    expect(content).toContain("<PageBreadcrumb");
    expect(content).toContain('label: "Quality Standards"');
  });

  it("should use Layout wrapper", () => {
    expect(content).toContain("import Layout");
    expect(content).toContain("<Layout>");
  });

  it("should contain all 4 condition grades", () => {
    expect(content).toContain('grade: "Like New"');
    expect(content).toContain('grade: "Excellent"');
    expect(content).toContain('grade: "Good"');
    expect(content).toContain('grade: "Fair"');
  });

  it("should include star ratings for each grade", () => {
    expect(content).toContain("rating: 5");
    expect(content).toContain("rating: 4");
    expect(content).toContain("rating: 3");
    expect(content).toContain("rating: 2");
  });

  it("should include the inspection checklist", () => {
    expect(content).toContain("Labels & Tags");
    expect(content).toContain("Stitching");
    expect(content).toContain("Fabric");
    expect(content).toContain("Closures");
    expect(content).toContain("Stains & Marks");
    expect(content).toContain("Odour");
    expect(content).toContain("Shape & Fit");
  });

  it("should include photography standards section", () => {
    expect(content).toContain("Photography Standards");
    expect(content).toContain("Full View");
    expect(content).toContain("Detail Shot");
  });

  it("should include authenticity guarantee section", () => {
    expect(content).toContain("Authenticity Guarantee");
    expect(content).toContain('href="/terms"');
  });

  it("should link to Our Process and Refund Policy", () => {
    expect(content).toContain('href="/our-process"');
    expect(content).toContain('href="/refund-policy"');
  });
});

// ─── Meet the Founder page ────────────────────────────────────────────
describe("Meet the Founder page", () => {
  const content = readPage("Founder.tsx");

  it("should exist", () => {
    expect(fs.existsSync(path.join(PAGES_DIR, "Founder.tsx"))).toBe(true);
  });

  it("should export a default function", () => {
    expect(content).toContain("export default function Founder");
  });

  it("should use PageHeader component", () => {
    expect(content).toContain("<PageHeader");
    expect(content).toContain('title="Meet the Founder"');
  });

  it("should use PageBreadcrumb component", () => {
    expect(content).toContain("<PageBreadcrumb");
    expect(content).toContain('label: "Meet the Founder"');
  });

  it("should use Layout wrapper", () => {
    expect(content).toContain("import Layout");
    expect(content).toContain("<Layout>");
  });

  it("should contain Clint's introduction", () => {
    expect(content).toContain("Clint");
  });

  it("should include te reo Māori proverb", () => {
    expect(content).toContain("E ako ana au");
    expect(content).toContain("whakakotahi");
  });

  it("should include kaitiakitanga concept", () => {
    expect(content).toContain("kaitiakitanga");
    expect(content).toContain("Kaitiakitanga");
  });

  it("should include the brand promise", () => {
    expect(content).toContain("You don't need money to dress well");
    expect(content).toContain("You don't need to be complicit to survive");
  });

  it("should include the four driving values", () => {
    expect(content).toContain("Kaitiakitanga");
    expect(content).toContain("Community");
    expect(content).toContain("Honesty");
    expect(content).toContain("Technology");
  });

  it("should link to roadmap", () => {
    expect(content).toContain('href="/roadmap"');
  });

  it("should link to Our Process and Quality Standards", () => {
    expect(content).toContain('href="/our-process"');
    expect(content).toContain('href="/quality-standards"');
  });

  it("should include contact section", () => {
    expect(content).toContain('href="/contact"');
    expect(content).toContain("help@urbanrefit.store");
  });
});

// ─── Routing ──────────────────────────────────────────────────────────
describe("Trust pages routing", () => {
  const appContent = fs.readFileSync(APP_FILE, "utf-8");

  it("should have lazy import for OurProcess", () => {
    expect(appContent).toContain('import("./pages/OurProcess")');
  });

  it("should have lazy import for QualityStandards", () => {
    expect(appContent).toContain('import("./pages/QualityStandards")');
  });

  it("should have lazy import for Founder", () => {
    expect(appContent).toContain('import("./pages/Founder")');
  });

  it("should have route for /our-process", () => {
    expect(appContent).toContain('path="/our-process"');
  });

  it("should have route for /quality-standards", () => {
    expect(appContent).toContain('path="/quality-standards"');
  });

  it("should have route for /founder", () => {
    expect(appContent).toContain('path="/founder"');
  });
});

// ─── Footer links ─────────────────────────────────────────────────────
describe("Footer trust page links", () => {
  const layoutContent = fs.readFileSync(LAYOUT_FILE, "utf-8");

  it("should link to Our Process in footer", () => {
    expect(layoutContent).toContain('href="/our-process"');
    expect(layoutContent).toContain("Our Process");
  });

  it("should link to Quality Standards in footer", () => {
    expect(layoutContent).toContain('href="/quality-standards"');
    expect(layoutContent).toContain("Quality Standards");
  });

  it("should link to Meet the Founder in footer", () => {
    expect(layoutContent).toContain('href="/founder"');
    expect(layoutContent).toContain("Meet the Founder");
  });
});

// ─── About page cross-links ──────────────────────────────────────────
describe("About page trust page links", () => {
  const aboutContent = readPage("About.tsx");

  it("should link to Our Process", () => {
    expect(aboutContent).toContain('href="/our-process"');
  });

  it("should link to Quality Standards", () => {
    expect(aboutContent).toContain('href="/quality-standards"');
  });

  it("should link to Meet the Founder", () => {
    expect(aboutContent).toContain('href="/founder"');
  });
});

// ─── Sprint 1A compliance ─────────────────────────────────────────────
describe("Sprint 1A heading compliance for trust pages", () => {
  const pages = ["OurProcess.tsx", "QualityStandards.tsx", "Founder.tsx"];

  for (const filename of pages) {
    describe(filename, () => {
      const content = readPage(filename);

      it("should import PageHeader", () => {
        expect(content).toContain('import PageHeader from "@/components/PageHeader"');
      });

      it("should import SectionHeader", () => {
        expect(content).toContain('import SectionHeader from "@/components/SectionHeader"');
      });

      it("should use <PageHeader for H1", () => {
        expect(content).toContain("<PageHeader");
      });

      it("should not have raw <h1> tags", () => {
        const lines = content.split("\n");
        const rawH1Lines = lines.filter(
          (line) =>
            line.includes("<h1") &&
            !line.trim().startsWith("//") &&
            !line.trim().startsWith("*")
        );
        expect(rawH1Lines.length).toBe(0);
      });
    });
  }
});
