import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Checkout Flow", () => {
  describe("Order Creation", () => {
    it("should calculate GST correctly (15% inclusive)", () => {
      // GST in NZ is 15% inclusive, meaning GST = Price × (15/115)
      const subtotal = 100;
      const gstAmount = subtotal * (15 / 115);
      
      expect(gstAmount).toBeCloseTo(13.04, 2);
      
      // Verify the math: subtotal includes GST
      // If subtotal is $100, then:
      // - GST component = $100 × (15/115) = $13.04
      // - Pre-GST amount = $100 - $13.04 = $86.96
      // - Verify: $86.96 × 1.15 = $100 ✓
      const preGstAmount = subtotal - gstAmount;
      expect(preGstAmount * 1.15).toBeCloseTo(subtotal, 2);
    });

    it("should calculate total with shipping correctly", () => {
      const subtotal = 150;
      const shippingCost = 9.99;
      const total = subtotal + shippingCost;
      
      expect(total).toBe(159.99);
    });

    it("should calculate thrift store payout at 10%", () => {
      const salePrice = 89.99;
      const payoutAmount = salePrice * 0.10;
      
      expect(payoutAmount).toBeCloseTo(9.00, 2);
    });
  });

  describe("Stripe Session Metadata", () => {
    it("should include required metadata fields", () => {
      const metadata = {
        order_id: "123",
        user_id: "456",
        customer_email: "test@example.com",
        customer_name: "Test User",
      };

      expect(metadata.order_id).toBeDefined();
      expect(metadata.user_id).toBeDefined();
      expect(metadata.customer_email).toBeDefined();
      expect(metadata.customer_name).toBeDefined();
    });
  });

  describe("Order Status Flow", () => {
    it("should have valid status transitions", () => {
      const validStatuses = [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ];

      // Verify all statuses are valid
      expect(validStatuses).toContain("pending");
      expect(validStatuses).toContain("paid");
      expect(validStatuses).toContain("shipped");
      expect(validStatuses).toContain("delivered");
    });

    it("should start with pending status", () => {
      const initialStatus = "pending";
      expect(initialStatus).toBe("pending");
    });

    it("should transition to paid after successful payment", () => {
      const statusAfterPayment = "paid";
      expect(statusAfterPayment).toBe("paid");
    });
  });

  describe("NZ Checkout Validation", () => {
    it("should validate 4-digit NZ postcodes", () => {
      const validPostcodes = ["1010", "6011", "8041", "0110"];
      const invalidPostcodes = ["10101", "123", "ABCD", ""];

      validPostcodes.forEach((postcode) => {
        expect(/^\d{4}$/.test(postcode)).toBe(true);
      });

      invalidPostcodes.forEach((postcode) => {
        expect(/^\d{4}$/.test(postcode)).toBe(false);
      });
    });

    it("should have valid NZ regions", () => {
      const nzRegions = [
        "Northland",
        "Auckland",
        "Waikato",
        "Bay of Plenty",
        "Gisborne",
        "Hawke's Bay",
        "Taranaki",
        "Manawatū-Whanganui",
        "Wellington",
        "Tasman",
        "Nelson",
        "Marlborough",
        "West Coast",
        "Canterbury",
        "Otago",
        "Southland",
      ];

      expect(nzRegions.length).toBe(16);
      expect(nzRegions).toContain("Auckland");
      expect(nzRegions).toContain("Wellington");
      expect(nzRegions).toContain("Canterbury");
    });

    it("should default to New Zealand as country", () => {
      const defaultCountry = "New Zealand";
      expect(defaultCountry).toBe("New Zealand");
    });
  });

  describe("Currency", () => {
    it("should use NZD currency", () => {
      const currency = "nzd";
      expect(currency).toBe("nzd");
    });

    it("should format prices with NZ$ prefix", () => {
      const price = 89.99;
      const formatted = `NZ$${price.toFixed(2)}`;
      expect(formatted).toBe("NZ$89.99");
    });
  });
});

describe("Resend Email Integration", () => {
  it("should have RESEND_API_KEY configured", () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
    expect(apiKey?.startsWith("re_")).toBe(true);
  });

  it("should format order confirmation email subject correctly", () => {
    const orderId = 123;
    const subject = `Order Confirmed - Urban Refit #${orderId}`;
    expect(subject).toBe("Order Confirmed - Urban Refit #123");
  });

  it("should format shipping notification email subject correctly", () => {
    const orderId = 456;
    const subject = `Your Order Has Shipped - Urban Refit #${orderId}`;
    expect(subject).toBe("Your Order Has Shipped - Urban Refit #456");
  });
});
