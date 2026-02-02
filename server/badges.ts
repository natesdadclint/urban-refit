/**
 * Sustainability Achievement Badges System
 * Defines milestone tiers and badge criteria for environmental impact
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  threshold: number; // Threshold value for the metric
  metric: "landfill_kg" | "water_liters" | "carbon_kg" | "garments_count"; // Which metric to track
  tier: "bronze" | "silver" | "gold" | "platinum";
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  awardedAt: Date;
  progress: number; // Current progress towards next badge
}

// Define all available badges organized by metric
export const SUSTAINABILITY_BADGES: Badge[] = [
  // Landfill Waste Diversion Badges
  {
    id: "landfill_bronze",
    name: "Waste Warrior",
    description: "Diverted 5 kg of textile waste from landfills",
    icon: "♻️",
    color: "text-amber-600",
    threshold: 5,
    metric: "landfill_kg",
    tier: "bronze",
  },
  {
    id: "landfill_silver",
    name: "Waste Defender",
    description: "Diverted 25 kg of textile waste from landfills",
    icon: "♻️",
    color: "text-gray-400",
    threshold: 25,
    metric: "landfill_kg",
    tier: "silver",
  },
  {
    id: "landfill_gold",
    name: "Waste Champion",
    description: "Diverted 100 kg of textile waste from landfills",
    icon: "♻️",
    color: "text-yellow-500",
    threshold: 100,
    metric: "landfill_kg",
    tier: "gold",
  },
  {
    id: "landfill_platinum",
    name: "Waste Legend",
    description: "Diverted 500 kg of textile waste from landfills",
    icon: "♻️",
    color: "text-blue-400",
    threshold: 500,
    metric: "landfill_kg",
    tier: "platinum",
  },

  // Water Conservation Badges
  {
    id: "water_bronze",
    name: "Water Saver",
    description: "Saved 10,000 liters of water",
    icon: "💧",
    color: "text-blue-600",
    threshold: 10000,
    metric: "water_liters",
    tier: "bronze",
  },
  {
    id: "water_silver",
    name: "Water Guardian",
    description: "Saved 50,000 liters of water",
    icon: "💧",
    color: "text-cyan-400",
    threshold: 50000,
    metric: "water_liters",
    tier: "silver",
  },
  {
    id: "water_gold",
    name: "Water Protector",
    description: "Saved 200,000 liters of water",
    icon: "💧",
    color: "text-blue-300",
    threshold: 200000,
    metric: "water_liters",
    tier: "gold",
  },
  {
    id: "water_platinum",
    name: "Water Visionary",
    description: "Saved 1,000,000 liters of water",
    icon: "💧",
    color: "text-indigo-400",
    threshold: 1000000,
    metric: "water_liters",
    tier: "platinum",
  },

  // Carbon Emissions Reduction Badges
  {
    id: "carbon_bronze",
    name: "Carbon Cutter",
    description: "Avoided 50 kg of CO2 emissions",
    icon: "🌍",
    color: "text-green-600",
    threshold: 50,
    metric: "carbon_kg",
    tier: "bronze",
  },
  {
    id: "carbon_silver",
    name: "Carbon Conscious",
    description: "Avoided 250 kg of CO2 emissions",
    icon: "🌍",
    color: "text-green-500",
    threshold: 250,
    metric: "carbon_kg",
    tier: "silver",
  },
  {
    id: "carbon_gold",
    name: "Carbon Crusader",
    description: "Avoided 1,000 kg of CO2 emissions",
    icon: "🌍",
    color: "text-green-400",
    threshold: 1000,
    metric: "carbon_kg",
    tier: "gold",
  },
  {
    id: "carbon_platinum",
    name: "Carbon Neutralizer",
    description: "Avoided 5,000 kg of CO2 emissions",
    icon: "🌍",
    color: "text-emerald-400",
    threshold: 5000,
    metric: "carbon_kg",
    tier: "platinum",
  },

  // Garment Count Badges
  {
    id: "garments_bronze",
    name: "Second Life Starter",
    description: "Gave 5 garments a second life",
    icon: "👕",
    color: "text-purple-600",
    threshold: 5,
    metric: "garments_count",
    tier: "bronze",
  },
  {
    id: "garments_silver",
    name: "Second Life Supporter",
    description: "Gave 25 garments a second life",
    icon: "👕",
    color: "text-purple-500",
    threshold: 25,
    metric: "garments_count",
    tier: "silver",
  },
  {
    id: "garments_gold",
    name: "Second Life Advocate",
    description: "Gave 100 garments a second life",
    icon: "👕",
    color: "text-purple-400",
    threshold: 100,
    metric: "garments_count",
    tier: "gold",
  },
  {
    id: "garments_platinum",
    name: "Second Life Legend",
    description: "Gave 500 garments a second life",
    icon: "👕",
    color: "text-fuchsia-400",
    threshold: 500,
    metric: "garments_count",
    tier: "platinum",
  },
];

/**
 * Get all badges earned by a user based on their sustainability metrics
 */
export function getEarnedBadges(
  landfillKg: number,
  waterLiters: number,
  carbonKg: number,
  garmentsCount: number
): Badge[] {
  return SUSTAINABILITY_BADGES.filter((badge) => {
    switch (badge.metric) {
      case "landfill_kg":
        return landfillKg >= badge.threshold;
      case "water_liters":
        return waterLiters >= badge.threshold;
      case "carbon_kg":
        return carbonKg >= badge.threshold;
      case "garments_count":
        return garmentsCount >= badge.threshold;
      default:
        return false;
    }
  });
}

/**
 * Get next badge to achieve for a specific metric
 */
export function getNextBadge(
  metric: "landfill_kg" | "water_liters" | "carbon_kg" | "garments_count",
  currentValue: number
): Badge | null {
  const metricBadges = SUSTAINABILITY_BADGES.filter((b) => b.metric === metric)
    .sort((a, b) => a.threshold - b.threshold);

  for (const badge of metricBadges) {
    if (currentValue < badge.threshold) {
      return badge;
    }
  }

  return null; // All badges earned
}

/**
 * Calculate progress towards next badge (0-100%)
 */
export function getProgressToNextBadge(
  metric: "landfill_kg" | "water_liters" | "carbon_kg" | "garments_count",
  currentValue: number
): { progress: number; nextBadge: Badge | null; currentBadge: Badge | null } {
  const nextBadge = getNextBadge(metric, currentValue);
  const metricBadges = SUSTAINABILITY_BADGES.filter((b) => b.metric === metric)
    .sort((a, b) => a.threshold - b.threshold);

  let currentBadge: Badge | null = null;
  for (const badge of metricBadges) {
    if (currentValue >= badge.threshold) {
      currentBadge = badge;
    }
  }

  if (!nextBadge) {
    return { progress: 100, nextBadge: null, currentBadge };
  }

  const previousThreshold = currentBadge?.threshold ?? 0;
  const progress = Math.round(
    ((currentValue - previousThreshold) /
      (nextBadge.threshold - previousThreshold)) *
      100
  );

  return {
    progress: Math.min(progress, 99),
    nextBadge,
    currentBadge,
  };
}
