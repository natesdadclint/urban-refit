import { describe, it, expect } from "vitest";
import {
  getEarnedBadges,
  getNextBadge,
  getProgressToNextBadge,
  SUSTAINABILITY_BADGES,
} from "./badges";

describe("Badges System", () => {
  describe("Badge Configuration", () => {
    it("should have all badge types defined", () => {
      expect(SUSTAINABILITY_BADGES.length).toBeGreaterThan(0);
      const metrics = new Set(SUSTAINABILITY_BADGES.map((b) => b.metric));
      expect(metrics.has("landfill_kg")).toBe(true);
      expect(metrics.has("water_liters")).toBe(true);
      expect(metrics.has("carbon_kg")).toBe(true);
      expect(metrics.has("garments_count")).toBe(true);
    });

    it("should have all four tiers represented", () => {
      const tiers = new Set(SUSTAINABILITY_BADGES.map((b) => b.tier));
      expect(tiers.size).toBe(4);
      expect(tiers.has("bronze")).toBe(true);
      expect(tiers.has("silver")).toBe(true);
      expect(tiers.has("gold")).toBe(true);
      expect(tiers.has("platinum")).toBe(true);
    });

    it("should have unique badge IDs", () => {
      const ids = SUSTAINABILITY_BADGES.map((b) => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("getEarnedBadges", () => {
    it("should return no badges for zero metrics", () => {
      const badges = getEarnedBadges(0, 0, 0, 0);
      expect(badges.length).toBe(0);
    });

    it("should award bronze landfill badge at 5kg threshold", () => {
      const badges = getEarnedBadges(5, 0, 0, 0);
      const landfillBadges = badges.filter((b) => b.metric === "landfill_kg");
      expect(landfillBadges.length).toBeGreaterThan(0);
      expect(landfillBadges[0].tier).toBe("bronze");
    });

    it("should award multiple badges across metrics", () => {
      const badges = getEarnedBadges(25, 50000, 250, 25);
      expect(badges.length).toBeGreaterThanOrEqual(4); // At least one from each metric
    });

    it("should award platinum badges at high thresholds", () => {
      const badges = getEarnedBadges(500, 1000000, 5000, 500);
      const platinumBadges = badges.filter((b) => b.tier === "platinum");
      expect(platinumBadges.length).toBeGreaterThan(0);
    });

    it("should respect threshold boundaries", () => {
      // Just below bronze threshold
      const noBadges = getEarnedBadges(4.99, 0, 0, 0);
      expect(noBadges.length).toBe(0);

      // At bronze threshold
      const withBadge = getEarnedBadges(5, 0, 0, 0);
      expect(withBadge.length).toBeGreaterThan(0);
    });
  });

  describe("getNextBadge", () => {
    it("should return next landfill badge", () => {
      const nextBadge = getNextBadge("landfill_kg", 0);
      expect(nextBadge).toBeDefined();
      expect(nextBadge?.metric).toBe("landfill_kg");
      expect(nextBadge?.tier).toBe("bronze");
    });

    it("should return null when all badges earned", () => {
      const nextBadge = getNextBadge("landfill_kg", 1000);
      expect(nextBadge).toBeNull();
    });

    it("should progress through tiers", () => {
      const bronze = getNextBadge("landfill_kg", 0);
      expect(bronze?.tier).toBe("bronze");

      const silver = getNextBadge("landfill_kg", 5);
      expect(silver?.tier).toBe("silver");

      const gold = getNextBadge("landfill_kg", 25);
      expect(gold?.tier).toBe("gold");

      const platinum = getNextBadge("landfill_kg", 100);
      expect(platinum?.tier).toBe("platinum");
    });
  });

  describe("getProgressToNextBadge", () => {
    it("should calculate progress correctly", () => {
      const result = getProgressToNextBadge("landfill_kg", 2.5);
      expect(result.progress).toBeGreaterThan(0);
      expect(result.progress).toBeLessThan(100);
      expect(result.nextBadge).toBeDefined();
    });

    it("should show 100% progress when all badges earned", () => {
      const result = getProgressToNextBadge("landfill_kg", 1000);
      expect(result.progress).toBe(100);
      expect(result.nextBadge).toBeNull();
    });

    it("should track current badge", () => {
      const result = getProgressToNextBadge("landfill_kg", 10);
      expect(result.currentBadge).toBeDefined();
      expect(result.currentBadge?.tier).toBe("bronze");
    });

    it("should calculate progress between thresholds", () => {
      // Halfway between bronze (5) and silver (25)
      const result = getProgressToNextBadge("landfill_kg", 15);
      expect(result.progress).toBeCloseTo(50, 1);
    });
  });

  describe("Real-world scenarios", () => {
    it("should calculate metrics for typical user purchase", () => {
      // User buys 10 garments
      const badges = getEarnedBadges(2.3, 26500, 100, 10);
      expect(badges.length).toBeGreaterThan(0);

      // Should have at least bronze in each category
      const metrics = new Set(badges.map((b) => b.metric));
      expect(metrics.size).toBeGreaterThanOrEqual(3);
    });

    it("should handle large numbers correctly", () => {
      const badges = getEarnedBadges(1000, 5000000, 50000, 2000);
      const platinumCount = badges.filter((b) => b.tier === "platinum").length;
      expect(platinumCount).toBeGreaterThan(0);
    });

    it("should provide progress tracking for motivation", () => {
      const currentValue = 3; // 3kg diverted
      const result = getProgressToNextBadge("landfill_kg", currentValue);
      expect(result.progress).toBeGreaterThan(0);
      expect(result.progress).toBeLessThan(100);
      expect(result.nextBadge?.threshold).toBe(5); // Next milestone is 5kg
    });
  });
});
