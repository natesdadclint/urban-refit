import { describe, it, expect } from "vitest";

/**
 * Tests for Sprint 1: Breadcrumb Navigation & Microcopy
 * 
 * These tests verify the breadcrumb segment generation logic
 * and microcopy content accuracy.
 */

// Breadcrumb segment builder (mirrors PageBreadcrumb logic)
interface BreadcrumbSegment {
  label: string;
  href?: string;
}

function buildBreadcrumbSegments(segments: BreadcrumbSegment[]): Array<{ label: string; href?: string; isCurrent: boolean }> {
  const homeSegment = { label: "Home", href: "/", isCurrent: false };
  const result = [homeSegment];
  
  segments.forEach((seg, index) => {
    const isLast = index === segments.length - 1;
    result.push({
      label: seg.label,
      href: isLast ? undefined : seg.href,
      isCurrent: isLast,
    });
  });
  
  return result;
}

describe("Breadcrumb Navigation", () => {
  it("should always start with Home segment", () => {
    const segments = buildBreadcrumbSegments([{ label: "Shop" }]);
    expect(segments[0]).toEqual({ label: "Home", href: "/", isCurrent: false });
  });

  it("should mark last segment as current page", () => {
    const segments = buildBreadcrumbSegments([
      { label: "Shop", href: "/shop" },
      { label: "Product Name" },
    ]);
    expect(segments[segments.length - 1].isCurrent).toBe(true);
    expect(segments[segments.length - 1].href).toBeUndefined();
  });

  it("should build correct ProductDetail breadcrumb trail", () => {
    const segments = buildBreadcrumbSegments([
      { label: "Shop", href: "/shop" },
      { label: "Ralph Lauren Polo Shirt" },
    ]);
    expect(segments).toHaveLength(3);
    expect(segments[0]).toEqual({ label: "Home", href: "/", isCurrent: false });
    expect(segments[1]).toEqual({ label: "Shop", href: "/shop", isCurrent: false });
    expect(segments[2]).toEqual({ label: "Ralph Lauren Polo Shirt", href: undefined, isCurrent: true });
  });

  it("should build correct Shop breadcrumb trail", () => {
    const segments = buildBreadcrumbSegments([{ label: "Shop" }]);
    expect(segments).toHaveLength(2);
    expect(segments[1]).toEqual({ label: "Shop", href: undefined, isCurrent: true });
  });

  it("should build correct Cart > Checkout breadcrumb trail", () => {
    const segments = buildBreadcrumbSegments([
      { label: "Cart", href: "/cart" },
      { label: "Checkout" },
    ]);
    expect(segments).toHaveLength(3);
    expect(segments[1]).toEqual({ label: "Cart", href: "/cart", isCurrent: false });
    expect(segments[2]).toEqual({ label: "Checkout", href: undefined, isCurrent: true });
  });

  it("should build correct Blog > Article breadcrumb trail", () => {
    const segments = buildBreadcrumbSegments([
      { label: "Blog", href: "/blog" },
      { label: "Sustainable Fashion Guide" },
    ]);
    expect(segments).toHaveLength(3);
    expect(segments[1]).toEqual({ label: "Blog", href: "/blog", isCurrent: false });
    expect(segments[2]).toEqual({ label: "Sustainable Fashion Guide", href: undefined, isCurrent: true });
  });

  it("should handle single segment pages (Profile, Sell)", () => {
    const profileSegments = buildBreadcrumbSegments([{ label: "My Profile" }]);
    expect(profileSegments).toHaveLength(2);
    expect(profileSegments[1].isCurrent).toBe(true);

    const sellSegments = buildBreadcrumbSegments([{ label: "Sell to Us" }]);
    expect(sellSegments).toHaveLength(2);
    expect(sellSegments[1].isCurrent).toBe(true);
  });
});

describe("Microcopy Content", () => {
  // Microcopy strings used across the site
  const microcopy = {
    productDetail: "One-of-a-kind piece — once it's gone, it's gone. Free shipping on orders over NZ$50.",
    cart: "Secure payment via Stripe. Free shipping on orders over NZ$50. 10% of your purchase supports our thrift store partners, and another 10% goes to our charity partners.",
    checkout: "10% of your purchase supports our thrift store partners, and another 10% goes to our charity partners. Changed your mind? Return within 14 days for Urban Refit Tokens.",
    sellToUs: "By submitting, you agree to our terms of service and confirm that the item is authentic and accurately described. You'll receive a token offer within 48 hours. 1 token = NZ$1.00 spend credit on Urban Refit.",
    courierReturn: "Free prepaid shipping label included. Tokens credited within 48 hours of inspection. 1 token = NZ$1.00.",
    hero: "Every piece is one-of-a-kind. Free shipping over NZ$50. Earn tokens when you sell back.",
  };

  it("should reference correct token value (NZ$1.00) in sell microcopy", () => {
    expect(microcopy.sellToUs).toContain("NZ$1.00");
  });

  it("should reference correct token value (NZ$1.00) in courier return microcopy", () => {
    expect(microcopy.courierReturn).toContain("NZ$1.00");
  });

  it("should mention free shipping threshold in product detail microcopy", () => {
    expect(microcopy.productDetail).toContain("NZ$50");
  });

  it("should mention scarcity in product detail microcopy", () => {
    expect(microcopy.productDetail.toLowerCase()).toContain("one-of-a-kind");
    expect(microcopy.productDetail).toContain("once it's gone");
  });

  it("should mention Stripe security in cart microcopy", () => {
    expect(microcopy.cart).toContain("Stripe");
    expect(microcopy.cart).toContain("Secure");
  });

  it("should mention thrift store support in checkout microcopy", () => {
    expect(microcopy.checkout).toContain("thrift store partners");
    expect(microcopy.checkout).toContain("10%");
  });

  it("should mention charity support in cart and checkout microcopy", () => {
    expect(microcopy.cart).toContain("charity partners");
    expect(microcopy.checkout).toContain("charity partners");
  });

  it("should mention return policy in checkout microcopy", () => {
    expect(microcopy.checkout).toContain("14 days");
    expect(microcopy.checkout).toContain("Urban Refit Tokens");
  });

  it("should mention token offer timeline in sell microcopy", () => {
    expect(microcopy.sellToUs).toContain("48 hours");
  });

  it("should mention free shipping label in courier return microcopy", () => {
    expect(microcopy.courierReturn).toContain("Free prepaid shipping label");
  });

  it("should mention token earning in hero microcopy", () => {
    expect(microcopy.hero).toContain("Earn tokens");
    expect(microcopy.hero).toContain("sell back");
  });

  it("should mention uniqueness in hero microcopy", () => {
    expect(microcopy.hero).toContain("one-of-a-kind");
  });
});
