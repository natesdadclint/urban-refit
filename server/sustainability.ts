/**
 * Textile Waste Reduction Calculator
 * 
 * Calculates environmental impact of secondhand clothing purchases
 * based on industry research and lifecycle assessment data
 */

// Average environmental impact per garment (new production)
// Using metric system: kg, liters, CO2 kg
export const GARMENT_IMPACT = {
  // Average weight of a garment (kilograms)
  WEIGHT_KG: 0.23,
  
  // Water consumption per garment (liters)
  // Industry average: 2650-10220 liters per shirt
  WATER_LITERS: 2650,
  
  // Carbon emissions per garment (kg CO2e)
  // Industry average: 5-10 kg per garment
  CARBON_KG: 6.5,
  
  // Landfill waste diverted (kilograms)
  // Assumes average garment prevents one new garment production
  LANDFILL_KG: 0.23,
};

export interface SustainabilityMetrics {
  garmentsGivenSecondLife: number;
  landfillWasteDivertedKg: number;
  waterSavedLiters: number;
  carbonEmissionsAvoided: number; // kg CO2e
  equivalentTreesPlanted: number;
}

/**
 * Calculate sustainability metrics based on number of garments purchased
 */
export function calculateSustainabilityMetrics(
  garmentsPurchased: number
): SustainabilityMetrics {
  const landfillWasteDiverted = garmentsPurchased * GARMENT_IMPACT.LANDFILL_KG;
  const waterSaved = garmentsPurchased * GARMENT_IMPACT.WATER_LITERS;
  const carbonAvoided = garmentsPurchased * GARMENT_IMPACT.CARBON_KG;
  
  // 1 tree absorbs ~21 kg CO2 per year
  // Assuming 10-year lifespan of garment
  const equivalentTrees = Math.round((carbonAvoided / 21) * 10) / 10;
  
  return {
    garmentsGivenSecondLife: garmentsPurchased,
    landfillWasteDivertedKg: Math.round(landfillWasteDiverted * 100) / 100,
    waterSavedLiters: Math.round(waterSaved * 100) / 100,
    carbonEmissionsAvoided: Math.round(carbonAvoided * 100) / 100,
    equivalentTreesPlanted: equivalentTrees,
  };
}

/**
 * Format metrics for display
 */
export function formatMetrics(metrics: SustainabilityMetrics) {
  return {
    garmentsGivenSecondLife: metrics.garmentsGivenSecondLife.toLocaleString(),
    landfillWasteDivertedKg: metrics.landfillWasteDivertedKg.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }),
    waterSavedLiters: metrics.waterSavedLiters.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    carbonEmissionsAvoided: metrics.carbonEmissionsAvoided.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }),
    equivalentTreesPlanted: metrics.equivalentTreesPlanted.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }),
  };
}
