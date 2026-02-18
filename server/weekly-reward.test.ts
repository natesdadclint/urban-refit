import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getCustomerProfileByUserId: vi.fn(),
  getOrCreateCustomerProfile: vi.fn(),
  createTokenTransaction: vi.fn(),
  checkAndAwardWeeklyLoginReward: vi.fn(),
  getWeeklyRewardStatus: vi.fn(),
}));

import * as db from "./db";

describe("Weekly Login Reward System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkAndAwardWeeklyLoginReward", () => {
    it("should award 1 token for first-time login", async () => {
      const mockProfile = {
        userId: 1,
        tokenBalance: "10.00",
        totalTokensEarned: "10.00",
        lastWeeklyReward: null,
      };

      vi.mocked(db.getOrCreateCustomerProfile).mockResolvedValue(mockProfile as any);
      vi.mocked(db.createTokenTransaction).mockResolvedValue(1);
      vi.mocked(db.checkAndAwardWeeklyLoginReward).mockResolvedValue({
        awarded: true,
        tokensAwarded: 1,
        newBalance: "11.00",
        message: "Congratulations! You earned 1 token for your weekly login!"
      });

      const result = await db.checkAndAwardWeeklyLoginReward(1);

      expect(result.awarded).toBe(true);
      expect(result.tokensAwarded).toBe(1);
      expect(result.newBalance).toBe("11.00");
    });

    it("should not award tokens if already claimed this week", async () => {
      const lastReward = new Date();
      lastReward.setDate(lastReward.getDate() - 3); // 3 days ago

      vi.mocked(db.checkAndAwardWeeklyLoginReward).mockResolvedValue({
        awarded: false,
        tokensAwarded: 0,
        newBalance: "15.00",
        message: "Already received weekly reward",
        nextEligibleDate: new Date(lastReward.getTime() + 7 * 24 * 60 * 60 * 1000)
      });

      const result = await db.checkAndAwardWeeklyLoginReward(1);

      expect(result.awarded).toBe(false);
      expect(result.tokensAwarded).toBe(0);
      expect(result.nextEligibleDate).toBeDefined();
    });

    it("should award tokens after 7 days have passed", async () => {
      const lastReward = new Date();
      lastReward.setDate(lastReward.getDate() - 8); // 8 days ago

      vi.mocked(db.checkAndAwardWeeklyLoginReward).mockResolvedValue({
        awarded: true,
        tokensAwarded: 1,
        newBalance: "11.00",
        message: "Congratulations! You earned 1 token for your weekly login!"
      });

      const result = await db.checkAndAwardWeeklyLoginReward(1);

      expect(result.awarded).toBe(true);
      expect(result.tokensAwarded).toBe(1);
    });
  });

  describe("getWeeklyRewardStatus", () => {
    it("should return eligible true for new users", async () => {
      vi.mocked(db.getWeeklyRewardStatus).mockResolvedValue({
        eligible: true,
        lastRewardDate: null,
        nextEligibleDate: null,
        daysUntilEligible: 0
      });

      const result = await db.getWeeklyRewardStatus(1);

      expect(result.eligible).toBe(true);
      expect(result.lastRewardDate).toBeNull();
      expect(result.daysUntilEligible).toBe(0);
    });

    it("should return eligible false with days remaining", async () => {
      const lastReward = new Date();
      lastReward.setDate(lastReward.getDate() - 3);
      const nextEligible = new Date(lastReward.getTime() + 7 * 24 * 60 * 60 * 1000);

      vi.mocked(db.getWeeklyRewardStatus).mockResolvedValue({
        eligible: false,
        lastRewardDate: lastReward,
        nextEligibleDate: nextEligible,
        daysUntilEligible: 4
      });

      const result = await db.getWeeklyRewardStatus(1);

      expect(result.eligible).toBe(false);
      expect(result.daysUntilEligible).toBe(4);
    });
  });
});
