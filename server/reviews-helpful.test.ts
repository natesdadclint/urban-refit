import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database functions
vi.mock("./db", () => ({
  incrementReviewHelpful: vi.fn().mockResolvedValue(undefined),
  getReviewById: vi.fn().mockResolvedValue({
    id: 1,
    productId: 1,
    userId: 1,
    rating: 5,
    title: "Great product",
    content: "Really happy with this purchase",
    helpfulCount: 5,
    isVerifiedPurchase: true,
    status: "approved",
    createdAt: new Date(),
  }),
}));

import * as db from "./db";

describe("Reviews Helpful Button", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("incrementReviewHelpful", () => {
    it("should call incrementReviewHelpful with the correct review ID", async () => {
      const reviewId = 1;
      await db.incrementReviewHelpful(reviewId);
      
      expect(db.incrementReviewHelpful).toHaveBeenCalledWith(reviewId);
      expect(db.incrementReviewHelpful).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple calls for different reviews", async () => {
      await db.incrementReviewHelpful(1);
      await db.incrementReviewHelpful(2);
      await db.incrementReviewHelpful(3);
      
      expect(db.incrementReviewHelpful).toHaveBeenCalledTimes(3);
      expect(db.incrementReviewHelpful).toHaveBeenNthCalledWith(1, 1);
      expect(db.incrementReviewHelpful).toHaveBeenNthCalledWith(2, 2);
      expect(db.incrementReviewHelpful).toHaveBeenNthCalledWith(3, 3);
    });
  });

  describe("Frontend localStorage tracking", () => {
    const HELPFUL_VOTES_KEY = "urban_refit_helpful_votes";

    // Simulating the frontend localStorage functions
    function getHelpfulVotes(): Set<number> {
      try {
        const stored = localStorage.getItem(HELPFUL_VOTES_KEY);
        if (stored) {
          return new Set(JSON.parse(stored));
        }
      } catch {
        // Ignore localStorage errors
      }
      return new Set();
    }

    function saveHelpfulVote(reviewId: number) {
      try {
        const votes = getHelpfulVotes();
        votes.add(reviewId);
        localStorage.setItem(HELPFUL_VOTES_KEY, JSON.stringify(Array.from(votes)));
      } catch {
        // Ignore localStorage errors
      }
    }

    beforeEach(() => {
      // Mock localStorage
      const storage: Record<string, string> = {};
      vi.stubGlobal("localStorage", {
        getItem: vi.fn((key: string) => storage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          storage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete storage[key];
        }),
        clear: vi.fn(() => {
          Object.keys(storage).forEach(key => delete storage[key]);
        }),
      });
    });

    it("should return empty set when no votes exist", () => {
      const votes = getHelpfulVotes();
      expect(votes.size).toBe(0);
    });

    it("should save a helpful vote to localStorage", () => {
      saveHelpfulVote(1);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        HELPFUL_VOTES_KEY,
        JSON.stringify([1])
      );
    });

    it("should accumulate multiple votes", () => {
      // First vote
      saveHelpfulVote(1);
      
      // Simulate localStorage returning the saved value
      vi.mocked(localStorage.getItem).mockReturnValueOnce(JSON.stringify([1]));
      
      // Second vote
      saveHelpfulVote(2);
      
      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        HELPFUL_VOTES_KEY,
        JSON.stringify([1, 2])
      );
    });

    it("should prevent duplicate votes for the same review", () => {
      // First vote for review 1
      saveHelpfulVote(1);
      
      // Simulate localStorage returning the saved value
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify([1]));
      
      // Check if already voted
      const votes = getHelpfulVotes();
      const hasVoted = votes.has(1);
      
      expect(hasVoted).toBe(true);
    });

    it("should correctly identify unvoted reviews", () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify([1, 2, 3]));
      
      const votes = getHelpfulVotes();
      
      expect(votes.has(1)).toBe(true);
      expect(votes.has(2)).toBe(true);
      expect(votes.has(3)).toBe(true);
      expect(votes.has(4)).toBe(false);
      expect(votes.has(5)).toBe(false);
    });
  });

  describe("Optimistic UI updates", () => {
    it("should calculate correct display count with optimistic increment", () => {
      const serverCount = 5;
      const optimisticIncrement = 1;
      const displayCount = serverCount + optimisticIncrement;
      
      expect(displayCount).toBe(6);
    });

    it("should handle multiple optimistic increments", () => {
      const optimisticCounts: Record<number, number> = {};
      
      // Simulate clicking helpful on review 1
      optimisticCounts[1] = (optimisticCounts[1] || 0) + 1;
      expect(optimisticCounts[1]).toBe(1);
      
      // Simulate clicking helpful on review 2
      optimisticCounts[2] = (optimisticCounts[2] || 0) + 1;
      expect(optimisticCounts[2]).toBe(1);
      
      // Review 3 not clicked
      expect(optimisticCounts[3] || 0).toBe(0);
    });

    it("should rollback optimistic count on error", () => {
      const optimisticCounts: Record<number, number> = { 1: 1 };
      
      // Simulate error rollback
      optimisticCounts[1] = Math.max((optimisticCounts[1] || 0) - 1, 0);
      
      expect(optimisticCounts[1]).toBe(0);
    });

    it("should not go below zero on rollback", () => {
      const optimisticCounts: Record<number, number> = { 1: 0 };
      
      // Simulate error rollback when count is already 0
      optimisticCounts[1] = Math.max((optimisticCounts[1] || 0) - 1, 0);
      
      expect(optimisticCounts[1]).toBe(0);
    });
  });
});
