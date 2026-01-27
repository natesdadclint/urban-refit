import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    url: "https://storage.example.com/shipping-labels/test-label.svg",
    key: "shipping-labels/test-label.svg",
  }),
}));

// Import after mocking
import { generateShippingLabel, getWarehouseAddress } from "./shippingLabel";
import { storagePut } from "./storage";

describe("Shipping Label Generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateShippingLabel", () => {
    it("should generate a shipping label with valid input", async () => {
      const input = {
        submissionId: 123,
        senderName: "John Smith",
        senderEmail: "john@example.com",
        senderPhone: "021-123-4567",
        itemDescription: "Nike Air Max 90 (Size 10)",
        tokenValue: 50,
      };

      const result = await generateShippingLabel(input);

      expect(result).toHaveProperty("labelUrl");
      expect(result).toHaveProperty("trackingNumber");
      expect(result).toHaveProperty("courierService");
      expect(result.labelUrl).toBe("https://storage.example.com/shipping-labels/test-label.svg");
      expect(result.courierService).toBe("NZ Post Prepaid");
    });

    it("should generate unique tracking numbers", async () => {
      const input = {
        submissionId: 1,
        senderName: "Test User",
        senderEmail: "test@example.com",
        itemDescription: "Test Item",
        tokenValue: 25,
      };

      const result1 = await generateShippingLabel(input);
      const result2 = await generateShippingLabel({ ...input, submissionId: 2 });

      expect(result1.trackingNumber).not.toBe(result2.trackingNumber);
    });

    it("should generate tracking number with UR prefix", async () => {
      const input = {
        submissionId: 456,
        senderName: "Jane Doe",
        senderEmail: "jane@example.com",
        itemDescription: "Adidas Jacket (Size M)",
        tokenValue: 75,
      };

      const result = await generateShippingLabel(input);

      expect(result.trackingNumber).toMatch(/^UR/);
      expect(result.trackingNumber.length).toBeGreaterThan(8);
    });

    it("should call storagePut with correct parameters", async () => {
      const input = {
        submissionId: 789,
        senderName: "Test Sender",
        senderEmail: "sender@test.com",
        senderPhone: "09-555-1234",
        itemDescription: "Levi's Jeans (Size 32)",
        tokenValue: 40,
      };

      await generateShippingLabel(input);

      expect(storagePut).toHaveBeenCalledTimes(1);
      const [filename, content, contentType] = (storagePut as any).mock.calls[0];
      
      expect(filename).toMatch(/^shipping-labels\/789-UR/);
      expect(filename.endsWith(".svg")).toBe(true);
      expect(content).toContain("<?xml");
      expect(content).toContain("Urban Refit");
      expect(content).toContain("Test Sender");
      expect(contentType).toBe("image/svg+xml");
    });

    it("should handle missing phone number gracefully", async () => {
      const input = {
        submissionId: 101,
        senderName: "No Phone User",
        senderEmail: "nophone@example.com",
        itemDescription: "Test Item",
        tokenValue: 30,
      };

      const result = await generateShippingLabel(input);

      expect(result).toHaveProperty("labelUrl");
      expect(result).toHaveProperty("trackingNumber");
      
      // Verify the SVG content handles missing phone
      const [, content] = (storagePut as any).mock.calls[0];
      expect(content).toContain("No phone provided");
    });

    it("should escape XML special characters in sender name", async () => {
      const input = {
        submissionId: 202,
        senderName: "John <Test> & Smith",
        senderEmail: "john@example.com",
        itemDescription: "Item with \"quotes\"",
        tokenValue: 20,
      };

      await generateShippingLabel(input);

      const [, content] = (storagePut as any).mock.calls[0];
      expect(content).toContain("John &lt;Test&gt; &amp; Smith");
    });
  });

  describe("getWarehouseAddress", () => {
    it("should return the warehouse address", () => {
      const address = getWarehouseAddress();

      expect(address).toHaveProperty("name");
      expect(address).toHaveProperty("street");
      expect(address).toHaveProperty("city");
      expect(address).toHaveProperty("postcode");
      expect(address).toHaveProperty("country");
      expect(address).toHaveProperty("phone");
      expect(address.name).toBe("Urban Refit Returns");
      expect(address.country).toBe("New Zealand");
    });
  });
});
