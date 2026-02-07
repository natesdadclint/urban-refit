import { describe, expect, it } from "vitest";

/**
 * Tests for the chat product link parsing logic.
 * The backend parses [[PRODUCT:id]] tokens from LLM responses
 * and returns structured product data alongside the cleaned message.
 */

describe("chat product link parsing", () => {
  // Replicate the parsing logic from routers.ts
  function parseProductLinks(
    message: string,
    productMap: Map<number, { id: number; name: string; brand: string | null; salePrice: string; image1Url: string | null; category: string }>
  ) {
    const productLinkRegex = /\[\[PRODUCT:(\d+)\]\]/g;
    const referencedProducts: Array<{ id: number; name: string; brand: string | null; salePrice: string; image1Url: string | null; category: string }> = [];
    const seenIds = new Set<number>();
    let match;
    while ((match = productLinkRegex.exec(message)) !== null) {
      const pid = parseInt(match[1], 10);
      if (!seenIds.has(pid) && productMap.has(pid)) {
        seenIds.add(pid);
        referencedProducts.push(productMap.get(pid)!);
      }
    }
    const cleanMessage = message.replace(/\[\[PRODUCT:\d+\]\]/g, '').replace(/\s{2,}/g, ' ').trim();
    return { cleanMessage, referencedProducts };
  }

  const sampleProducts = new Map<number, { id: number; name: string; brand: string | null; salePrice: string; image1Url: string | null; category: string }>([
    [1, { id: 1, name: "Ralph Lauren Polo", brand: "Ralph Lauren", salePrice: "45.00", image1Url: "https://cdn.example.com/polo.jpg", category: "tops" }],
    [2, { id: 2, name: "Levi's 501 Jeans", brand: "Levi's", salePrice: "55.00", image1Url: "https://cdn.example.com/jeans.jpg", category: "bottoms" }],
    [3, { id: 3, name: "Doc Martens Boots", brand: "Doc Martens", salePrice: "89.00", image1Url: null, category: "shoes" }],
    [5, { id: 5, name: "Vintage Cap", brand: null, salePrice: "15.00", image1Url: "https://cdn.example.com/cap.jpg", category: "accessories" }],
  ]);

  it("extracts single product link from message", () => {
    const msg = "We have a great Ralph Lauren Polo [[PRODUCT:1]] available in size M.";
    const result = parseProductLinks(msg, sampleProducts);

    expect(result.referencedProducts).toHaveLength(1);
    expect(result.referencedProducts[0]?.id).toBe(1);
    expect(result.referencedProducts[0]?.name).toBe("Ralph Lauren Polo");
    expect(result.cleanMessage).not.toContain("[[PRODUCT:");
    expect(result.cleanMessage).toContain("Ralph Lauren Polo");
  });

  it("extracts multiple product links for outfit ensemble", () => {
    const msg = "Here is a complete outfit: Ralph Lauren Polo [[PRODUCT:1]], Levi's 501 Jeans [[PRODUCT:2]], Doc Martens Boots [[PRODUCT:3]], and a Vintage Cap [[PRODUCT:5]].";
    const result = parseProductLinks(msg, sampleProducts);

    expect(result.referencedProducts).toHaveLength(4);
    expect(result.referencedProducts.map(p => p.category)).toEqual(["tops", "bottoms", "shoes", "accessories"]);
    expect(result.cleanMessage).not.toContain("[[PRODUCT:");
  });

  it("deduplicates repeated product references", () => {
    const msg = "The Ralph Lauren Polo [[PRODUCT:1]] is great. I really recommend the Ralph Lauren Polo [[PRODUCT:1]] for you.";
    const result = parseProductLinks(msg, sampleProducts);

    expect(result.referencedProducts).toHaveLength(1);
  });

  it("ignores product IDs not in the inventory map", () => {
    const msg = "Check out this item [[PRODUCT:999]] which is amazing.";
    const result = parseProductLinks(msg, sampleProducts);

    expect(result.referencedProducts).toHaveLength(0);
    expect(result.cleanMessage).not.toContain("[[PRODUCT:");
  });

  it("handles messages with no product links", () => {
    const msg = "Thank you for your interest. How can I help you today?";
    const result = parseProductLinks(msg, sampleProducts);

    expect(result.referencedProducts).toHaveLength(0);
    expect(result.cleanMessage).toBe(msg);
  });

  it("cleans extra whitespace after removing product tokens", () => {
    const msg = "We have  [[PRODUCT:1]]  in stock right now.";
    const result = parseProductLinks(msg, sampleProducts);

    expect(result.cleanMessage).toBe("We have in stock right now.");
    expect(result.cleanMessage).not.toContain("  ");
  });

  it("handles products with null brand and image", () => {
    const msg = "Try this Vintage Cap [[PRODUCT:5]] for the finishing touch.";
    const result = parseProductLinks(msg, sampleProducts);

    expect(result.referencedProducts).toHaveLength(1);
    expect(result.referencedProducts[0]?.brand).toBeNull();
    expect(result.referencedProducts[0]?.image1Url).toContain("cap.jpg");
  });

  it("handles product with null image", () => {
    const msg = "The Doc Martens Boots [[PRODUCT:3]] are a classic choice.";
    const result = parseProductLinks(msg, sampleProducts);

    expect(result.referencedProducts).toHaveLength(1);
    expect(result.referencedProducts[0]?.image1Url).toBeNull();
  });
});
