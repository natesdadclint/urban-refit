/**
 * Badge database operations and award logic
 */

import { getDb } from "./db";
import { userBadges, sustainabilityMilestones, users } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getEarnedBadges, SUSTAINABILITY_BADGES, type Badge } from "./badges";

/**
 * Award badges to a user based on their current sustainability metrics
 * Returns newly awarded badges
 */
export async function awardBadgesToUser(
  userId: number,
  landfillKg: number,
  waterLiters: number,
  carbonKg: number,
  garmentsCount: number
): Promise<Badge[]> {
  // Get all badges the user should have earned
  const earnedBadges = getEarnedBadges(
    landfillKg,
    waterLiters,
    carbonKg,
    garmentsCount
  );

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get badges user already has
  const existingBadges = await db
    .select()
    .from(userBadges)
    .where(eq(userBadges.userId, userId));

  const existingBadgeIds = new Set(existingBadges.map((b: any) => b.badgeId));

  // Find newly earned badges
  const newBadges = earnedBadges.filter((b) => !existingBadgeIds.has(b.id));

  // Award new badges
  for (const badge of newBadges as Badge[]) {
    await db.insert(userBadges).values({
      userId,
      badgeId: badge.id,
      badgeName: badge.name,
      badgeDescription: badge.description,
      badgeIcon: badge.icon,
      badgeColor: badge.color,
      tier: badge.tier,
      notificationSent: false,
    });
  }

  // Update milestone tracking
  await updateSustainabilityMilestone(
    userId,
    landfillKg,
    waterLiters,
    carbonKg,
    garmentsCount
  );

  return newBadges;
}

/**
 * Update sustainability milestone tracking for a user
 */
export async function updateSustainabilityMilestone(
  userId: number,
  landfillKg: number,
  waterLiters: number,
  carbonKg: number,
  garmentsCount: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const earnedBadges = getEarnedBadges(
    landfillKg,
    waterLiters,
    carbonKg,
    garmentsCount
  );

  // Count badges by tier
  const bronzeCount = earnedBadges.filter((b: Badge) => b.tier === "bronze").length;
  const silverCount = earnedBadges.filter((b: Badge) => b.tier === "silver").length;
  const goldCount = earnedBadges.filter((b: Badge) => b.tier === "gold").length;
  const platinumCount = earnedBadges.filter((b: Badge) => b.tier === "platinum").length;

  // Check if milestone exists
  const existing = await db
    .select()
    .from(sustainabilityMilestones)
    .where(eq(sustainabilityMilestones.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    // Update existing milestone
    await db
      .update(sustainabilityMilestones)
      .set({
        totalGarmentsCount: garmentsCount,
        totalLandfillKgDiverted: landfillKg.toString(),
        totalWaterLitersSaved: waterLiters,
        totalCarbonKgAvoided: carbonKg.toString(),
        bronzeBadgesCount: bronzeCount,
        silverBadgesCount: silverCount,
        goldBadgesCount: goldCount,
        platinumBadgesCount: platinumCount,
      })
      .where(eq(sustainabilityMilestones.userId, userId));
  } else {
    // Create new milestone
    await db.insert(sustainabilityMilestones).values({
      userId,
      totalGarmentsCount: garmentsCount,
      totalLandfillKgDiverted: landfillKg.toString(),
      totalWaterLitersSaved: waterLiters,
      totalCarbonKgAvoided: carbonKg.toString(),
      bronzeBadgesCount: bronzeCount,
      silverBadgesCount: silverCount,
      goldBadgesCount: goldCount,
      platinumBadgesCount: platinumCount,
    });
  }
}

/**
 * Get all badges earned by a user
 */
export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(userBadges)
    .where(eq(userBadges.userId, userId))
    .orderBy(userBadges.awardedAt);
}

/**
 * Get user's sustainability milestone progress
 */
export async function getUserMilestoneProgress(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const milestone = await db
    .select()
    .from(sustainabilityMilestones)
    .where(eq(sustainabilityMilestones.userId, userId))
    .limit(1);

  return milestone[0] || null;
}

/**
 * Get global sustainability leaderboard (top contributors)
 */
export async function getSustainabilityLeaderboard(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const leaderboard = await db
    .select({
      userId: sustainabilityMilestones.userId,
      userName: users.name,
      totalGarmentsCount: sustainabilityMilestones.totalGarmentsCount,
      totalLandfillKgDiverted: sustainabilityMilestones.totalLandfillKgDiverted,
      totalWaterLitersSaved: sustainabilityMilestones.totalWaterLitersSaved,
      totalCarbonKgAvoided: sustainabilityMilestones.totalCarbonKgAvoided,
      totalBadges: sustainabilityMilestones.bronzeBadgesCount,
    })
    .from(sustainabilityMilestones)
    .innerJoin(users, eq(sustainabilityMilestones.userId, users.id))
    .orderBy(sustainabilityMilestones.totalGarmentsCount)
    .limit(limit);

  return leaderboard;
}

/**
 * Mark badge notification as sent
 */
export async function markBadgeNotificationSent(badgeId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(userBadges)
    .set({ notificationSent: true })
    .where(eq(userBadges.id, badgeId));
}

/**
 * Get unsent badge notifications for a user
 */
export async function getUnsentBadgeNotifications(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(userBadges)
    .where(
      and(
        eq(userBadges.userId, userId),
        eq(userBadges.notificationSent, false)
      )
    );
}
