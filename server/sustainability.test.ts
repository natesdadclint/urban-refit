import { describe, it, expect } from "vitest";
import {
  calculateSustainabilityMetrics,
  formatMetrics,
  GARMENT_IMPACT,
  SustainabilityMetrics,
} from "./sustainability";

describe("Sustainability Calculator", () => {
  describe("calculateSustainabilityMetrics", () => {
    it("should return zero metrics for zero garments", () => {
      const metrics = calculateSustainabilityMetrics(0);
      
      expect(metrics.garmentsGivenSecondLife).toBe(0);
      expect(metrics.landfillWasteDivertedLbs).toBe(0);
      expect(metrics.waterSavedGallons).toBe(0);
      expect(metrics.carbonEmissionsAvoided).toBe(0);
      expect(metrics.equivalentTreesPlanted).toBe(0);
    });

    it("should calculate metrics for single garment", () => {
      const metrics = calculateSustainabilityMetrics(1);
      
      expect(metrics.garmentsGivenSecondLife).toBe(1);
      expect(metrics.landfillWasteDivertedKg).toBe(GARMENT_IMPACT.LANDFILL_KG);
      expect(metrics.waterSavedLiters).toBe(GARMENT_IMPACT.WATER_LITERS);
      expect(metrics.carbonEmissionsAvoided).toBe(GARMENT_IMPACT.CARBON_KG);
    });

    it("should scale metrics linearly with garment count", () => {
      const metrics10 = calculateSustainabilityMetrics(10);
      const metrics20 = calculateSustainabilityMetrics(20);
      
      expect(metrics20.landfillWasteDivertedKg).toBeCloseTo(
        metrics10.landfillWasteDivertedKg * 2,
        1
      );
      expect(metrics20.waterSavedLiters).toBeCloseTo(
        metrics10.waterSavedLiters * 2,
        1
      );
      expect(metrics20.carbonEmissionsAvoided).toBeCloseTo(
        metrics10.carbonEmissionsAvoided * 2,
        1
      );
    });

    it("should calculate equivalent trees correctly", () => {
      // 1 tree absorbs ~21 kg CO2 per year, 10-year lifespan = 210 kg per tree
      // So 6.5 kg CO2 per garment * 10 garments = 65 kg / 210 = 0.31 trees
      const metrics = calculateSustainabilityMetrics(10);
      const expectedTrees = Math.round((65 / 21) * 10) / 10;
      
      expect(metrics.equivalentTreesPlanted).toBeCloseTo(expectedTrees, 1);
    });

    it("should handle large garment counts", () => {
      const metrics = calculateSustainabilityMetrics(1000);
      
      expect(metrics.garmentsGivenSecondLife).toBe(1000);
      expect(metrics.landfillWasteDivertedKg).toBeGreaterThan(0);
      expect(metrics.waterSavedLiters).toBeGreaterThan(0);
      expect(metrics.carbonEmissionsAvoided).toBeGreaterThan(0);
      expect(metrics.equivalentTreesPlanted).toBeGreaterThan(0);
    });
  });

  describe("formatMetrics", () => {
    it("should format metrics as strings with proper localization", () => {
      const metrics = calculateSustainabilityMetrics(5);
      const formatted = formatMetrics(metrics);
      
      expect(typeof formatted.garmentsGivenSecondLife).toBe("string");
      expect(typeof formatted.landfillWasteDivertedKg).toBe("string");
      expect(typeof formatted.waterSavedLiters).toBe("string");
      expect(typeof formatted.carbonEmissionsAvoided).toBe("string");
      expect(typeof formatted.equivalentTreesPlanted).toBe("string");
    });

    it("should include commas in large numbers", () => {
      const metrics = calculateSustainabilityMetrics(1000);
      const formatted = formatMetrics(metrics);
      
      expect(formatted.garmentsGivenSecondLife).toContain("1,000");
    });

    it("should format decimal values correctly", () => {
      const metrics = calculateSustainabilityMetrics(1);
      const formatted = formatMetrics(metrics);
      
      // Water saved should be 2650 liters
      expect(formatted.waterSavedLiters).toBe("2,650");
      
      // Carbon should have 1 decimal place
      expect(formatted.carbonEmissionsAvoided).toMatch(/\d+\.\d/);
    });
  });

  describe("Environmental Impact Constants", () => {
    it("should have realistic garment impact values", () => {
      expect(GARMENT_IMPACT.WEIGHT_KG).toBeGreaterThan(0);
      expect(GARMENT_IMPACT.WATER_LITERS).toBeGreaterThan(0);
      expect(GARMENT_IMPACT.CARBON_KG).toBeGreaterThan(0);
      expect(GARMENT_IMPACT.LANDFILL_KG).toBeGreaterThan(0);
    });

    it("should have water consumption in expected range", () => {
      // Industry average: 2650-10220 liters per shirt
      expect(GARMENT_IMPACT.WATER_LITERS).toBeGreaterThanOrEqual(2650);
      expect(GARMENT_IMPACT.WATER_LITERS).toBeLessThanOrEqual(10220);
    });

    it("should have carbon emissions in expected range", () => {
      // Industry average: 5-10 kg per garment
      expect(GARMENT_IMPACT.CARBON_KG).toBeGreaterThanOrEqual(5);
      expect(GARMENT_IMPACT.CARBON_KG).toBeLessThanOrEqual(10);
    });
  });

  describe("Real-world scenarios", () => {
    it("should calculate impact for typical customer with 5 purchases", () => {
      const metrics = calculateSustainabilityMetrics(5);
      
      // Verify all metrics are positive
      expect(metrics.landfillWasteDivertedKg).toBeGreaterThan(0);
      expect(metrics.waterSavedLiters).toBeGreaterThan(0);
      expect(metrics.carbonEmissionsAvoided).toBeGreaterThan(0);
      
      // Verify reasonable values
      expect(metrics.landfillWasteDivertedKg).toBeLessThan(2);
      expect(metrics.waterSavedLiters).toBeLessThan(20000);
      expect(metrics.carbonEmissionsAvoided).toBeLessThan(50);
    });

    it("should show meaningful impact for loyal customer with 50 purchases", () => {
      const metrics = calculateSustainabilityMetrics(50);
      
      // Should save significant water
      expect(metrics.waterSavedLiters).toBeGreaterThan(130000);
      
      // Should avoid significant carbon
      expect(metrics.carbonEmissionsAvoided).toBeGreaterThan(300);
      
      // Should be equivalent to planting multiple trees
      expect(metrics.equivalentTreesPlanted).toBeGreaterThan(10);
    });
  });
});
