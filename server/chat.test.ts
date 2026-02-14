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

describe("chat cart context building", () => {
  // Replicate the cart context building logic from routers.ts
  function buildCartContext(
    userId: number | undefined,
    cartItems: Array<{ cartItem: { quantity: number }; product: { id: number; name: string; brand: string | null; size: string | null; category: string; color: string | null; salePrice: string } }>
  ): string {
    if (!userId) {
      return '\n\nCUSTOMER\'S CURRENT CART: Customer is not logged in. Encourage them to sign in for a personalised experience.';
    }
    if (cartItems.length === 0) {
      return '\n\nCUSTOMER\'S CURRENT CART: Empty (no items added yet).';
    }
    return `\n\nCUSTOMER'S CURRENT CART (${cartItems.length} items):\n${cartItems.map(ci => `- [ID:${ci.product.id}] ${ci.product.name} (${ci.product.brand || 'Unbranded'}) | Size: ${ci.product.size || 'One Size'} | Category: ${ci.product.category} | Color: ${ci.product.color || 'N/A'} | Price: $${ci.product.salePrice} | Qty: ${ci.cartItem.quantity}`).join('\n')}\nTotal items in cart: ${cartItems.reduce((sum, ci) => sum + ci.cartItem.quantity, 0)}`;
  }

  it("returns not-logged-in message when userId is undefined", () => {
    const result = buildCartContext(undefined, []);
    expect(result).toContain("not logged in");
    expect(result).toContain("sign in");
  });

  it("returns empty cart message when user has no items", () => {
    const result = buildCartContext(1, []);
    expect(result).toContain("Empty");
    expect(result).toContain("no items added yet");
  });

  it("includes cart item details when user has items", () => {
    const cartItems = [
      { cartItem: { quantity: 1 }, product: { id: 1, name: "Ralph Lauren Polo", brand: "Ralph Lauren", size: "M", category: "tops", color: "Navy", salePrice: "45.00" } },
      { cartItem: { quantity: 2 }, product: { id: 2, name: "Levi's 501 Jeans", brand: "Levi's", size: "32", category: "bottoms", color: "Blue", salePrice: "55.00" } },
    ];
    const result = buildCartContext(1, cartItems);
    expect(result).toContain("CUSTOMER'S CURRENT CART (2 items)");
    expect(result).toContain("Ralph Lauren Polo");
    expect(result).toContain("Levi's 501 Jeans");
    expect(result).toContain("Total items in cart: 3");
  });

  it("handles items with null brand and color", () => {
    const cartItems = [
      { cartItem: { quantity: 1 }, product: { id: 5, name: "Vintage Cap", brand: null, size: null, category: "accessories", color: null, salePrice: "15.00" } },
    ];
    const result = buildCartContext(1, cartItems);
    expect(result).toContain("Unbranded");
    expect(result).toContain("One Size");
    expect(result).toContain("N/A");
  });

  it("calculates total quantity across multiple items", () => {
    const cartItems = [
      { cartItem: { quantity: 3 }, product: { id: 1, name: "Polo", brand: "RL", size: "M", category: "tops", color: "Navy", salePrice: "45.00" } },
      { cartItem: { quantity: 2 }, product: { id: 2, name: "Jeans", brand: "Levi's", size: "32", category: "bottoms", color: "Blue", salePrice: "55.00" } },
    ];
    const result = buildCartContext(1, cartItems);
    expect(result).toContain("Total items in cart: 5");
  });
});

describe("chat system prompt enhancements", () => {
  // Read the system prompt from routers.ts to verify key sections exist
  const fs = require('fs');
  const routersContent = fs.readFileSync('server/routers.ts', 'utf-8');
  const chatSection = routersContent.substring(
    routersContent.indexOf('// ============ CHAT/HELPDESK ROUTES'),
    routersContent.indexOf('// ============ ANALYTICS ROUTES')
  );

  it("includes cart-aware advice section in system prompt", () => {
    expect(chatSection).toContain('CART-AWARE ADVICE');
    expect(chatSection).toContain('Reference their cart items naturally');
    expect(chatSection).toContain('complementary items from inventory');
  });

  it("includes fashion knowledge directives in system prompt", () => {
    expect(chatSection).toContain('OUTFIT STYLING & FASHION KNOWLEDGE');
    expect(chatSection).toContain('current menswear trends');
    expect(chatSection).toContain('brand heritage');
    expect(chatSection).toContain('colour theory');
    expect(chatSection).toContain('seasonal styling');
  });

  it("includes internet knowledge directive in rules", () => {
    expect(chatSection).toContain('broad fashion and internet knowledge');
    expect(chatSection).toContain('informed style recommendations');
  });

  it("includes cart access directive in rules", () => {
    expect(chatSection).toContain('access to the customer\'s shopping cart');
    expect(chatSection).toContain('personalised advice');
  });

  it("fetches cart items for logged-in users", () => {
    expect(chatSection).toContain('getCartItems');
    expect(chatSection).toContain('ctx.user?.id');
  });

  it("appends cartContext to the system prompt", () => {
    expect(chatSection).toContain('${inventoryContext}${cartContext}');
  });

  it("includes occasion-based styling advice", () => {
    expect(chatSection).toContain('casual, smart-casual, streetwear, outdoor');
  });

  it("includes celebrity/style icon references", () => {
    expect(chatSection).toContain('celebrities or style icons');
  });
});
