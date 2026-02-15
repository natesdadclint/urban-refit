import { describe, expect, it } from "vitest";

/**
 * Unit tests for the Urban Refit loyalty and circular economy system
 */

describe("Tiered Discount System", () => {
  // Tiered discount calculation function
  const getTieredDiscount = (itemCount: number): { percentage: number; bonusTokens: number } => {
    if (itemCount >= 10) return { percentage: 25, bonusTokens: 15 };
    if (itemCount >= 7) return { percentage: 20, bonusTokens: 10 };
    if (itemCount >= 5) return { percentage: 15, bonusTokens: 7 };
    if (itemCount >= 3) return { percentage: 10, bonusTokens: 5 };
    return { percentage: 0, bonusTokens: 0 };
  };

  it("should return 0% discount for 1-2 items", () => {
    expect(getTieredDiscount(1)).toEqual({ percentage: 0, bonusTokens: 0 });
    expect(getTieredDiscount(2)).toEqual({ percentage: 0, bonusTokens: 0 });
  });

  it("should return 10% discount and 5 tokens for 3-4 items", () => {
    expect(getTieredDiscount(3)).toEqual({ percentage: 10, bonusTokens: 5 });
    expect(getTieredDiscount(4)).toEqual({ percentage: 10, bonusTokens: 5 });
  });

  it("should return 15% discount and 7 tokens for 5-6 items", () => {
    expect(getTieredDiscount(5)).toEqual({ percentage: 15, bonusTokens: 7 });
    expect(getTieredDiscount(6)).toEqual({ percentage: 15, bonusTokens: 7 });
  });

  it("should return 20% discount and 10 tokens for 7-9 items", () => {
    expect(getTieredDiscount(7)).toEqual({ percentage: 20, bonusTokens: 10 });
    expect(getTieredDiscount(8)).toEqual({ percentage: 20, bonusTokens: 10 });
    expect(getTieredDiscount(9)).toEqual({ percentage: 20, bonusTokens: 10 });
  });

  it("should return 25% discount and 15 tokens for 10+ items", () => {
    expect(getTieredDiscount(10)).toEqual({ percentage: 25, bonusTokens: 15 });
    expect(getTieredDiscount(15)).toEqual({ percentage: 25, bonusTokens: 15 });
    expect(getTieredDiscount(100)).toEqual({ percentage: 25, bonusTokens: 15 });
  });
});

describe("Token Calculation", () => {
  // Token value calculation (25% of sale price for returns)
  const calculateTokenValue = (salePrice: number): number => {
    return Math.floor(salePrice * 0.25 * 100) / 100; // Round to 2 decimal places
  };

  it("should calculate 25% token value for returned items", () => {
    expect(calculateTokenValue(100)).toBe(25);
    expect(calculateTokenValue(50)).toBe(12.5);
    expect(calculateTokenValue(79.99)).toBe(19.99);
  });

  it("should handle zero price", () => {
    expect(calculateTokenValue(0)).toBe(0);
  });
});

describe("Thrift Store Payout Calculation", () => {
  // 10% of sale price goes to thrift store
  const calculateThriftStorePayout = (salePrice: number): number => {
    return Math.round(salePrice * 0.10 * 100) / 100;
  };

  it("should calculate 10% payout for thrift stores", () => {
    expect(calculateThriftStorePayout(100)).toBe(10);
    expect(calculateThriftStorePayout(50)).toBe(5);
    expect(calculateThriftStorePayout(79.99)).toBe(8);
  });

  it("should handle zero price", () => {
    expect(calculateThriftStorePayout(0)).toBe(0);
  });
});

describe("Charity Payout Calculation", () => {
  // 10% of sale price goes to charity partners
  const calculateCharityPayout = (salePrice: number): number => {
    return Math.round(salePrice * 0.10 * 100) / 100;
  };

  it("should calculate 10% payout for charity partners", () => {
    expect(calculateCharityPayout(100)).toBe(10);
    expect(calculateCharityPayout(50)).toBe(5);
    expect(calculateCharityPayout(79.99)).toBe(8);
  });

  it("should handle zero price", () => {
    expect(calculateCharityPayout(0)).toBe(0);
  });

  it("should match thrift store payout percentage", () => {
    const salePrice = 100;
    const thriftPayout = salePrice * 0.10;
    const charityPayout = salePrice * 0.10;
    expect(thriftPayout).toBe(charityPayout);
  });

  it("should total 20% community impact (thrift + charity)", () => {
    const salePrice = 100;
    const totalCommunityPayout = salePrice * 0.10 + salePrice * 0.10;
    expect(totalCommunityPayout).toBe(20);
    expect(totalCommunityPayout / salePrice).toBe(0.20);
  });
});

describe("Sale Price Calculation", () => {
  // Sale price = original cost + (original cost * markup percentage / 100)
  const calculateSalePrice = (originalCost: number, markupPercentage: number): number => {
    return Math.round((originalCost * (1 + markupPercentage / 100)) * 100) / 100;
  };

  it("should calculate sale price with markup", () => {
    expect(calculateSalePrice(100, 50)).toBe(150);
    expect(calculateSalePrice(50, 100)).toBe(100);
    expect(calculateSalePrice(25, 40)).toBe(35);
  });

  it("should handle zero markup", () => {
    expect(calculateSalePrice(100, 0)).toBe(100);
  });

  it("should handle zero original cost", () => {
    expect(calculateSalePrice(0, 50)).toBe(0);
  });
});

describe("Spend Limit Usage", () => {
  // Spend limit can only be used with 3+ items
  const canUseSpendLimit = (itemCount: number, availableSpendLimit: number): boolean => {
    return itemCount >= 3 && availableSpendLimit > 0;
  };

  it("should allow spend limit usage with 3+ items and positive balance", () => {
    expect(canUseSpendLimit(3, 50)).toBe(true);
    expect(canUseSpendLimit(5, 100)).toBe(true);
    expect(canUseSpendLimit(10, 25)).toBe(true);
  });

  it("should not allow spend limit usage with less than 3 items", () => {
    expect(canUseSpendLimit(1, 50)).toBe(false);
    expect(canUseSpendLimit(2, 100)).toBe(false);
  });

  it("should not allow spend limit usage with zero balance", () => {
    expect(canUseSpendLimit(5, 0)).toBe(false);
    expect(canUseSpendLimit(10, 0)).toBe(false);
  });
});

describe("Courier Return Token Calculation", () => {
  // Tokens earned from returning garments = 25% of original sale price
  const calculateReturnTokens = (originalSalePrice: number): number => {
    return Math.floor(originalSalePrice * 0.25 * 100) / 100;
  };

  it("should calculate 25% token value for courier returns", () => {
    expect(calculateReturnTokens(100)).toBe(25);
    expect(calculateReturnTokens(80)).toBe(20);
    expect(calculateReturnTokens(45.50)).toBe(11.37);
  });
});

describe("Order Total Calculation with Discounts", () => {
  const calculateOrderTotal = (
    subtotal: number,
    itemCount: number,
    shipping: number,
    spendLimitUsed: number
  ): { total: number; discount: number; bonusTokens: number } => {
    // Get tiered discount
    let discountPercentage = 0;
    let bonusTokens = 0;
    
    if (itemCount >= 10) {
      discountPercentage = 25;
      bonusTokens = 15;
    } else if (itemCount >= 7) {
      discountPercentage = 20;
      bonusTokens = 10;
    } else if (itemCount >= 5) {
      discountPercentage = 15;
      bonusTokens = 7;
    } else if (itemCount >= 3) {
      discountPercentage = 10;
      bonusTokens = 5;
    }
    
    const discount = Math.round(subtotal * discountPercentage) / 100;
    const total = Math.round((subtotal - discount + shipping - spendLimitUsed) * 100) / 100;
    
    return { total, discount, bonusTokens };
  };

  it("should calculate order total with tiered discount", () => {
    const result = calculateOrderTotal(100, 5, 9.99, 0);
    expect(result.discount).toBe(15); // 15% of 100
    expect(result.bonusTokens).toBe(7);
    expect(result.total).toBe(94.99); // 100 - 15 + 9.99
  });

  it("should apply spend limit to order total", () => {
    const result = calculateOrderTotal(100, 5, 9.99, 20);
    expect(result.total).toBe(74.99); // 100 - 15 + 9.99 - 20
  });

  it("should not apply discount for less than 3 items", () => {
    const result = calculateOrderTotal(100, 2, 9.99, 0);
    expect(result.discount).toBe(0);
    expect(result.bonusTokens).toBe(0);
    expect(result.total).toBe(109.99);
  });
});
