import { describe, it, expect } from "vitest";

/**
 * GST Calculation Tests
 * 
 * New Zealand GST is 15% and is included in displayed prices (GST-inclusive pricing).
 * To extract the GST component from a GST-inclusive price:
 * GST = Price × (15/115)
 */

describe("GST Calculation", () => {
  // Helper function matching the implementation in stripe.ts
  const calculateGstFromInclusive = (subtotal: number): number => {
    return subtotal * (15 / 115);
  };

  it("should correctly calculate GST from a GST-inclusive price", () => {
    // NZ$115 inclusive = NZ$100 ex-GST + NZ$15 GST
    const subtotal = 115;
    const gst = calculateGstFromInclusive(subtotal);
    expect(gst).toBeCloseTo(15, 2);
  });

  it("should calculate GST for typical product prices", () => {
    // NZ$50 product
    const price1 = 50;
    const gst1 = calculateGstFromInclusive(price1);
    expect(gst1).toBeCloseTo(6.52, 2); // 50 * 15/115 ≈ 6.52

    // NZ$132.50 product
    const price2 = 132.50;
    const gst2 = calculateGstFromInclusive(price2);
    expect(gst2).toBeCloseTo(17.28, 2); // 132.50 * 15/115 ≈ 17.28
  });

  it("should calculate GST for cart totals", () => {
    // Cart with multiple items totaling NZ$481.50
    const cartTotal = 481.50;
    const gst = calculateGstFromInclusive(cartTotal);
    expect(gst).toBeCloseTo(62.80, 2); // 481.50 * 15/115 ≈ 62.80
  });

  it("should handle zero amounts", () => {
    const gst = calculateGstFromInclusive(0);
    expect(gst).toBe(0);
  });

  it("should handle small amounts correctly", () => {
    // NZ$1.00 product
    const gst = calculateGstFromInclusive(1);
    expect(gst).toBeCloseTo(0.13, 2); // 1 * 15/115 ≈ 0.13
  });

  it("should verify GST + ex-GST equals original price", () => {
    const prices = [50, 132.50, 481.50, 9.99, 1000];
    
    for (const price of prices) {
      const gst = calculateGstFromInclusive(price);
      const exGst = price - gst;
      // Verify: exGst + 15% = original price
      const reconstructed = exGst * 1.15;
      expect(reconstructed).toBeCloseTo(price, 2);
    }
  });

  it("should format GST amount to 2 decimal places", () => {
    const subtotal = 132.50;
    const gst = calculateGstFromInclusive(subtotal);
    const formattedGst = gst.toFixed(2);
    expect(formattedGst).toBe("17.28");
  });
});

describe("Order Total Calculation with GST", () => {
  const calculateGstFromInclusive = (subtotal: number): number => {
    return subtotal * (15 / 115);
  };

  it("should correctly calculate order totals", () => {
    const subtotal = 481.50; // GST-inclusive
    const shippingCost = 9.99;
    const gstAmount = calculateGstFromInclusive(subtotal);
    const total = subtotal + shippingCost;

    expect(gstAmount).toBeCloseTo(62.80, 2);
    expect(total).toBeCloseTo(491.49, 2);
  });

  it("should maintain GST calculation consistency across order lifecycle", () => {
    // Simulate order creation
    const subtotal = 200;
    const gstAmount = calculateGstFromInclusive(subtotal);
    const shippingCost = 9.99;
    const total = subtotal + shippingCost;

    // Store as strings (like in database)
    const storedGst = gstAmount.toFixed(2);
    const storedTotal = total.toFixed(2);

    // Retrieve and verify
    expect(parseFloat(storedGst)).toBeCloseTo(26.09, 2);
    expect(parseFloat(storedTotal)).toBeCloseTo(209.99, 2);
  });
});
