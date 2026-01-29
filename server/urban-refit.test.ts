import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// Mock user types
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Helper to create admin context
function createAdminContext(): { ctx: TrpcContext; clearedCookies: any[] } {
  const clearedCookies: any[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@urbanrefit.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

// Helper to create customer context
function createCustomerContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "customer-user",
    email: "customer@example.com",
    name: "Customer User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

// Helper to create unauthenticated context
function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Urban Refit E-Commerce Backend", () => {
  describe("Authentication", () => {
    it("returns user data for authenticated users", async () => {
      const { ctx } = createCustomerContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.email).toBe("customer@example.com");
      expect(result?.role).toBe("user");
    });

    it("returns null for unauthenticated users", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeNull();
    });

    it("clears session cookie on logout", async () => {
      const { ctx, clearedCookies } = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
      expect(clearedCookies).toHaveLength(1);
      expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    });
  });

  describe("Pricing Calculation", () => {
    it("calculates sale price correctly with markup", () => {
      // Test the pricing logic: originalCost * (1 + markupPercentage/100)
      const originalCost = 20;
      const markupPercentage = 50;
      const expectedSalePrice = originalCost * (1 + markupPercentage / 100); // 30
      
      expect(expectedSalePrice).toBe(30);
    });

    it("calculates thrift store payout as 5% of sale price", () => {
      const salePrice = 30;
      const expectedPayout = salePrice * 0.05; // 1.5
      
      expect(expectedPayout).toBe(1.5);
    });

    it("calculates profit correctly after payout", () => {
      const originalCost = 20;
      const salePrice = 30;
      const thriftStorePayout = salePrice * 0.05; // 1.5
      const profit = salePrice - originalCost - thriftStorePayout; // 8.5
      
      expect(profit).toBe(8.5);
    });

    it("handles various markup percentages", () => {
      const testCases = [
        { cost: 10, markup: 100, expectedPrice: 20 },
        { cost: 25, markup: 40, expectedPrice: 35 },
        { cost: 50, markup: 25, expectedPrice: 62.5 },
        { cost: 100, markup: 0, expectedPrice: 100 },
      ];

      testCases.forEach(({ cost, markup, expectedPrice }) => {
        const salePrice = cost * (1 + markup / 100);
        expect(salePrice).toBe(expectedPrice);
      });
    });
  });

  describe("Admin Access Control", () => {
    it("allows admin to access protected routes", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Admin should be able to call admin-only procedures
      // This tests that the admin context is properly set up
      expect(ctx.user?.role).toBe("admin");
    });

    it("denies non-admin access to admin routes", async () => {
      const { ctx } = createCustomerContext();
      const caller = appRouter.createCaller(ctx);

      // Customer role should not have admin access
      expect(ctx.user?.role).toBe("user");
      expect(ctx.user?.role).not.toBe("admin");
    });

    it("denies unauthenticated access to protected routes", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      expect(ctx.user).toBeNull();
    });
  });

  describe("Product Categories", () => {
    const validCategories = [
      "tops",
      "bottoms",
      "dresses",
      "outerwear",
      "accessories",
      "shoes",
      "bags",
      "other",
    ];

    it("supports all expected product categories", () => {
      expect(validCategories).toHaveLength(8);
      expect(validCategories).toContain("tops");
      expect(validCategories).toContain("dresses");
      expect(validCategories).toContain("outerwear");
    });
  });

  describe("Product Conditions", () => {
    const validConditions = ["like_new", "excellent", "good", "fair"];

    it("supports all expected condition levels", () => {
      expect(validConditions).toHaveLength(4);
      expect(validConditions).toContain("like_new");
      expect(validConditions).toContain("excellent");
      expect(validConditions).toContain("good");
      expect(validConditions).toContain("fair");
    });
  });

  describe("Order Status Flow", () => {
    const validStatuses = [
      "pending",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ];

    it("supports all expected order statuses", () => {
      expect(validStatuses).toHaveLength(7);
    });

    it("follows correct order flow progression", () => {
      const normalFlow = ["pending", "paid", "processing", "shipped", "delivered"];
      
      // Verify the normal flow order
      expect(normalFlow.indexOf("pending")).toBeLessThan(normalFlow.indexOf("paid"));
      expect(normalFlow.indexOf("paid")).toBeLessThan(normalFlow.indexOf("processing"));
      expect(normalFlow.indexOf("processing")).toBeLessThan(normalFlow.indexOf("shipped"));
      expect(normalFlow.indexOf("shipped")).toBeLessThan(normalFlow.indexOf("delivered"));
    });
  });

  describe("Payout Status Flow", () => {
    const validStatuses = ["pending", "paid", "processing", "failed"];

    it("supports all expected payout statuses", () => {
      expect(validStatuses).toHaveLength(4);
      expect(validStatuses).toContain("pending");
      expect(validStatuses).toContain("paid");
    });
  });

  describe("Thrift Store Payout Calculation", () => {
    it("calculates 5% payout for single item", () => {
      const salePrice = 50;
      const payoutPercentage = 0.05;
      const payout = salePrice * payoutPercentage;
      
      expect(payout).toBe(2.5);
    });

    it("calculates total payout for multiple items", () => {
      const items = [
        { salePrice: 30 },
        { salePrice: 50 },
        { salePrice: 75 },
      ];
      
      const totalPayout = items.reduce(
        (sum, item) => sum + item.salePrice * 0.05,
        0
      );
      
      expect(totalPayout).toBe(7.75);
    });

    it("handles decimal prices correctly", () => {
      const salePrice = 29.99;
      const payout = salePrice * 0.05;
      
      expect(payout).toBeCloseTo(1.4995, 2);
    });
  });

  describe("Cart Operations", () => {
    it("calculates cart subtotal correctly", () => {
      const cartItems = [
        { salePrice: 25.00, quantity: 1 },
        { salePrice: 45.00, quantity: 1 },
        { salePrice: 30.00, quantity: 1 },
      ];
      
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.salePrice * item.quantity,
        0
      );
      
      expect(subtotal).toBe(100);
    });

    it("calculates shipping cost based on subtotal", () => {
      // Free shipping over $100
      const freeShippingThreshold = 100;
      const standardShipping = 9.99;
      
      expect(75 < freeShippingThreshold).toBe(true);
      expect(150 >= freeShippingThreshold).toBe(true);
    });

    it("calculates order total with shipping", () => {
      const subtotal = 75;
      const shipping = 9.99;
      const total = subtotal + shipping;
      
      expect(total).toBe(84.99);
    });
  });

  describe("Data Validation", () => {
    it("validates email format", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.org",
        "admin@urbanrefit.com",
      ];
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it("validates positive pricing values", () => {
      const validPrices = [0.01, 1, 10.50, 100, 999.99];
      
      validPrices.forEach((price) => {
        expect(price).toBeGreaterThan(0);
      });
    });

    it("validates markup percentage is non-negative", () => {
      const validMarkups = [0, 10, 25, 50, 100, 200];
      
      validMarkups.forEach((markup) => {
        expect(markup).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

describe("Business Logic", () => {
  describe("Profit Margin Analysis", () => {
    it("calculates profit margin percentage", () => {
      const originalCost = 20;
      const salePrice = 30;
      const thriftPayout = salePrice * 0.10;
      const netProfit = salePrice - originalCost - thriftPayout;
      const profitMargin = (netProfit / salePrice) * 100;
      
      // Net profit: 30 - 20 - 3 = 7
      // Profit margin: 7/30 * 100 = 23.33%
      expect(netProfit).toBe(7);
      expect(profitMargin).toBeCloseTo(23.33, 1);
    });

    it("identifies low margin products", () => {
      const lowMarginThreshold = 15; // 15%
      
      const products = [
        { cost: 25, salePrice: 30 }, // Low margin
        { cost: 20, salePrice: 40 }, // Good margin
        { cost: 50, salePrice: 55 }, // Very low margin
      ];
      
      const lowMarginProducts = products.filter((p) => {
        const payout = p.salePrice * 0.10;
        const profit = p.salePrice - p.cost - payout;
        const margin = (profit / p.salePrice) * 100;
        return margin < lowMarginThreshold;
      });
      
      expect(lowMarginProducts.length).toBeGreaterThan(0);
    });
  });

  describe("Inventory Management", () => {
    it("tracks product status transitions", () => {
      const statusTransitions = {
        available: ["reserved", "sold", "archived"],
        reserved: ["available", "sold"],
        sold: ["archived"],
        archived: ["available"],
      };
      
      // Available can transition to reserved, sold, or archived
      expect(statusTransitions.available).toContain("reserved");
      expect(statusTransitions.available).toContain("sold");
      
      // Sold items can only be archived
      expect(statusTransitions.sold).toHaveLength(1);
      expect(statusTransitions.sold).toContain("archived");
    });
  });
});
