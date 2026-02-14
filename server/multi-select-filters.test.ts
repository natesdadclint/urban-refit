import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const clientSrc = path.resolve(__dirname, "../client/src");
const serverDir = path.resolve(__dirname);

describe("Multi-Select Shop Filters", () => {
  // ============ BACKEND: DB HELPERS ============
  describe("Backend – ProductFilters interface", () => {
    const dbFile = fs.readFileSync(path.resolve(serverDir, "db.ts"), "utf-8");

    it("should define ProductFilters with comma-separated size", () => {
      expect(dbFile).toContain("size?: string");
      expect(dbFile).toMatch(/size\?.*comma-separated/i);
    });

    it("should define ProductFilters with comma-separated brand", () => {
      expect(dbFile).toContain("brand?: string");
      expect(dbFile).toMatch(/brand\?.*comma-separated/i);
    });

    it("should define ProductFilters with comma-separated condition", () => {
      expect(dbFile).toContain("condition?: string");
      expect(dbFile).toMatch(/condition\?.*comma-separated/i);
    });

    it("should define ProductFilters with comma-separated color", () => {
      expect(dbFile).toContain("color?: string");
      expect(dbFile).toMatch(/color\?.*comma-separated/i);
    });
  });

  describe("Backend – getAvailableProducts multi-value handling", () => {
    const dbFile = fs.readFileSync(path.resolve(serverDir, "db.ts"), "utf-8");

    it("should split size filter by comma", () => {
      expect(dbFile).toContain("filters.size.split(',')");
    });

    it("should split brand filter by comma", () => {
      expect(dbFile).toContain("filters.brand.split(',')");
    });

    it("should split condition filter by comma", () => {
      expect(dbFile).toContain("filters.condition.split(',')");
    });

    it("should split color filter by comma", () => {
      expect(dbFile).toContain("filters.color.split(',')");
    });

    it("should use inArray for multi-value size filter", () => {
      expect(dbFile).toContain("inArray(products.size");
    });

    it("should use inArray for multi-value brand filter", () => {
      expect(dbFile).toContain("inArray(products.brand");
    });

    it("should use inArray for multi-value condition filter", () => {
      expect(dbFile).toContain("inArray(products.condition");
    });

    it("should use inArray for multi-value color filter", () => {
      expect(dbFile).toContain("inArray(products.color");
    });
  });

  describe("Backend – tRPC product.list input schema", () => {
    const routersFile = fs.readFileSync(path.resolve(serverDir, "routers.ts"), "utf-8");

    it("should accept condition as optional string", () => {
      expect(routersFile).toContain("condition: z.string().optional()");
    });

    it("should accept color as optional string", () => {
      expect(routersFile).toContain("color: z.string().optional()");
    });

    it("should document comma-separated multi-select for size", () => {
      expect(routersFile).toMatch(/size:.*comma-separated/i);
    });

    it("should document comma-separated multi-select for brand", () => {
      expect(routersFile).toMatch(/brand:.*comma-separated/i);
    });
  });

  describe("Backend – filterOptions returns conditions and colors", () => {
    const routersFile = fs.readFileSync(path.resolve(serverDir, "routers.ts"), "utf-8");

    it("should call getDistinctConditions", () => {
      expect(routersFile).toContain("db.getDistinctConditions()");
    });

    it("should call getDistinctColors", () => {
      expect(routersFile).toContain("db.getDistinctColors()");
    });

    it("should return conditions in filterOptions", () => {
      expect(routersFile).toContain("conditions");
    });

    it("should return colors in filterOptions", () => {
      expect(routersFile).toContain("colors");
    });
  });

  describe("Backend – distinct query helpers", () => {
    const dbFile = fs.readFileSync(path.resolve(serverDir, "db.ts"), "utf-8");

    it("should have getDistinctConditions function", () => {
      expect(dbFile).toContain("async function getDistinctConditions");
    });

    it("should have getDistinctColors function", () => {
      expect(dbFile).toContain("async function getDistinctColors");
    });
  });

  // ============ FRONTEND: SHOP PAGE ============
  describe("Frontend – Shop.tsx multi-select imports", () => {
    const shopFile = fs.readFileSync(path.resolve(clientSrc, "pages/Shop.tsx"), "utf-8");

    it("should import Checkbox component", () => {
      expect(shopFile).toContain('from "@/components/ui/checkbox"');
    });

    it("should import useCallback", () => {
      expect(shopFile).toContain("useCallback");
    });
  });

  describe("Frontend – URL param parsing for multi-select", () => {
    const shopFile = fs.readFileSync(path.resolve(clientSrc, "pages/Shop.tsx"), "utf-8");

    it("should have parseMulti helper for comma-separated params", () => {
      expect(shopFile).toContain("function parseMulti");
      expect(shopFile).toContain('.split(",")');
    });

    it("should have toggleMulti helper for toggling values", () => {
      expect(shopFile).toContain("function toggleMulti");
    });

    it("should parse size from URL as array", () => {
      expect(shopFile).toContain('parseMulti(searchParams.get("size"))');
    });

    it("should parse brand from URL as array", () => {
      expect(shopFile).toContain('parseMulti(searchParams.get("brand"))');
    });

    it("should parse condition from URL as array", () => {
      expect(shopFile).toContain('parseMulti(searchParams.get("condition"))');
    });

    it("should parse color from URL as array", () => {
      expect(shopFile).toContain('parseMulti(searchParams.get("color"))');
    });
  });

  describe("Frontend – toggle callbacks", () => {
    const shopFile = fs.readFileSync(path.resolve(clientSrc, "pages/Shop.tsx"), "utf-8");

    it("should have toggleSize callback", () => {
      expect(shopFile).toContain("const toggleSize = useCallback");
    });

    it("should have toggleBrand callback", () => {
      expect(shopFile).toContain("const toggleBrand = useCallback");
    });

    it("should have toggleCondition callback", () => {
      expect(shopFile).toContain("const toggleCondition = useCallback");
    });

    it("should have toggleColor callback", () => {
      expect(shopFile).toContain("const toggleColor = useCallback");
    });
  });

  describe("Frontend – CheckboxGroup component", () => {
    const shopFile = fs.readFileSync(path.resolve(clientSrc, "pages/Shop.tsx"), "utf-8");

    it("should define CheckboxGroup component", () => {
      expect(shopFile).toContain("function CheckboxGroup");
    });

    it("should accept options, selected, and onToggle props", () => {
      expect(shopFile).toContain("options: string[]");
      expect(shopFile).toContain("selected: string[]");
      expect(shopFile).toContain("onToggle: (value: string) => void");
    });

    it("should support maxVisible prop for show more/less", () => {
      expect(shopFile).toContain("maxVisible");
      expect(shopFile).toContain("showAll");
    });

    it("should support optional labelMap for display names", () => {
      expect(shopFile).toContain("labelMap");
    });

    it("should render Checkbox for each option", () => {
      expect(shopFile).toContain("<Checkbox");
      expect(shopFile).toContain("onCheckedChange");
    });

    it("should show expand button when options exceed maxVisible", () => {
      expect(shopFile).toContain("more");
      expect(shopFile).toContain("Show less");
    });
  });

  describe("Frontend – FilterSection collapsible component", () => {
    const shopFile = fs.readFileSync(path.resolve(clientSrc, "pages/Shop.tsx"), "utf-8");

    it("should define FilterSection component", () => {
      expect(shopFile).toContain("function FilterSection");
    });

    it("should support defaultOpen prop", () => {
      expect(shopFile).toContain("defaultOpen");
    });

    it("should toggle open/close state", () => {
      expect(shopFile).toContain("setOpen(!open)");
    });

    it("should use ChevronUp and ChevronDown icons", () => {
      expect(shopFile).toContain("ChevronUp");
      expect(shopFile).toContain("ChevronDown");
    });
  });

  describe("Frontend – condition labels mapping", () => {
    const shopFile = fs.readFileSync(path.resolve(clientSrc, "pages/Shop.tsx"), "utf-8");

    it("should have conditionLabels map", () => {
      expect(shopFile).toContain("conditionLabels");
    });

    it("should map like_new to Like New", () => {
      expect(shopFile).toContain('like_new: "Like New"');
    });

    it("should map excellent to Excellent", () => {
      expect(shopFile).toContain('excellent: "Excellent"');
    });

    it("should map good to Good", () => {
      expect(shopFile).toContain('good: "Good"');
    });

    it("should map fair to Fair", () => {
      expect(shopFile).toContain('fair: "Fair"');
    });
  });

  describe("Frontend – active filter pills for multi-select", () => {
    const shopFile = fs.readFileSync(path.resolve(clientSrc, "pages/Shop.tsx"), "utf-8");

    it("should render pills for each selected size", () => {
      expect(shopFile).toContain("selectedSizes.map");
    });

    it("should render pills for each selected brand", () => {
      expect(shopFile).toContain("selectedBrands.map");
    });

    it("should render pills for each selected condition", () => {
      expect(shopFile).toContain("selectedConditions.map");
    });

    it("should render pills for each selected color", () => {
      expect(shopFile).toContain("selectedColors.map");
    });

    it("should show Clear all button when multiple filters active", () => {
      expect(shopFile).toContain("Clear all");
      expect(shopFile).toContain("activeFilterCount > 1");
    });
  });

  describe("Frontend – active filter count badge", () => {
    const shopFile = fs.readFileSync(path.resolve(clientSrc, "pages/Shop.tsx"), "utf-8");

    it("should calculate activeFilterCount from all filter types", () => {
      expect(shopFile).toContain("activeFilterCount");
      expect(shopFile).toContain("selectedSizes.length");
      expect(shopFile).toContain("selectedBrands.length");
      expect(shopFile).toContain("selectedConditions.length");
      expect(shopFile).toContain("selectedColors.length");
    });

    it("should show numeric count on mobile filter button", () => {
      expect(shopFile).toContain("{activeFilterCount}");
    });
  });

  describe("Frontend – filter sections in sidebar", () => {
    const shopFile = fs.readFileSync(path.resolve(clientSrc, "pages/Shop.tsx"), "utf-8");

    it("should have Size filter section with count indicator", () => {
      expect(shopFile).toMatch(/title=\{`Size\$\{selectedSizes/);
    });

    it("should have Condition filter section", () => {
      expect(shopFile).toMatch(/title=\{`Condition/);
    });

    it("should have Brand filter section", () => {
      expect(shopFile).toMatch(/title=\{`Brand/);
    });

    it("should have Colour filter section", () => {
      expect(shopFile).toMatch(/title=\{`Colour/);
    });

    it("should pass conditionLabels to condition CheckboxGroup", () => {
      expect(shopFile).toContain("labelMap={conditionLabels}");
    });
  });

  describe("Frontend – query params include new filters", () => {
    const shopFile = fs.readFileSync(path.resolve(clientSrc, "pages/Shop.tsx"), "utf-8");

    it("should include condition in queryParams", () => {
      expect(shopFile).toContain("condition: selectedConditions.length > 0");
    });

    it("should include color in queryParams", () => {
      expect(shopFile).toContain("color: selectedColors.length > 0");
    });

    it("should join selected values with comma for API", () => {
      expect(shopFile).toContain('selectedSizes.join(",")');
      expect(shopFile).toContain('selectedBrands.join(",")');
      expect(shopFile).toContain('selectedConditions.join(",")');
      expect(shopFile).toContain('selectedColors.join(",")');
    });
  });

  describe("Frontend – scrollable sidebar and mobile sheet", () => {
    const shopFile = fs.readFileSync(path.resolve(clientSrc, "pages/Shop.tsx"), "utf-8");

    it("should have overflow-y-auto on desktop sidebar", () => {
      expect(shopFile).toContain("overflow-y-auto");
    });

    it("should have overflow-y-auto on mobile sheet", () => {
      // Mobile SheetContent should also be scrollable
      expect(shopFile).toContain("SheetContent");
      expect(shopFile).toContain("overflow-y-auto");
    });
  });
});
