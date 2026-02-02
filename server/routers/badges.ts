import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  getUserBadges,
  getUserMilestoneProgress,
  getSustainabilityLeaderboard,
  awardBadgesToUser,
} from "../badges-db";
import { SUSTAINABILITY_BADGES } from "../badges";

export const badgesRouter = router({
  /**
   * Get all available badges
   */
  allBadges: publicProcedure.query(async () => {
    return SUSTAINABILITY_BADGES;
  }),

  /**
   * Get badges earned by current user
   */
  myBadges: protectedProcedure.query(async ({ ctx }) => {
    return getUserBadges(ctx.user.id);
  }),

  /**
   * Get user's sustainability milestone progress
   */
  myProgress: protectedProcedure.query(async ({ ctx }) => {
    return getUserMilestoneProgress(ctx.user.id);
  }),

  /**
   * Award badges to user (admin or internal use)
   * Used when user completes a purchase or action that affects sustainability metrics
   */
  awardBadges: protectedProcedure
    .input(
      z.object({
        landfillKg: z.number().min(0),
        waterLiters: z.number().min(0),
        carbonKg: z.number().min(0),
        garmentsCount: z.number().min(0).int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return awardBadgesToUser(
        ctx.user.id,
        input.landfillKg,
        input.waterLiters,
        input.carbonKg,
        input.garmentsCount
      );
    }),

  /**
   * Get global sustainability leaderboard
   */
  leaderboard: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      return getSustainabilityLeaderboard(input.limit);
    }),
});
