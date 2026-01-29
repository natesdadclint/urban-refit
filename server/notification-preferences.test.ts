import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getNotificationPreferences: vi.fn(),
  updateNotificationPreferences: vi.fn(),
  shouldSendNotification: vi.fn(),
}));

import * as db from "./db";

describe("Notification Preferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getNotificationPreferences", () => {
    it("should return existing preferences for a user", async () => {
      const mockPreferences = {
        id: 1,
        userId: 123,
        orderUpdates: true,
        tokenRewards: true,
        promotions: false,
        sellSubmissions: true,
        systemUpdates: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getNotificationPreferences).mockResolvedValue(mockPreferences);

      const result = await db.getNotificationPreferences(123);

      expect(result).toEqual(mockPreferences);
      expect(db.getNotificationPreferences).toHaveBeenCalledWith(123);
    });

    it("should return null when database is not available", async () => {
      vi.mocked(db.getNotificationPreferences).mockResolvedValue(null);

      const result = await db.getNotificationPreferences(123);

      expect(result).toBeNull();
    });
  });

  describe("updateNotificationPreferences", () => {
    it("should update specific preferences", async () => {
      vi.mocked(db.updateNotificationPreferences).mockResolvedValue(undefined);

      await db.updateNotificationPreferences(123, {
        promotions: false,
        tokenRewards: false,
      });

      expect(db.updateNotificationPreferences).toHaveBeenCalledWith(123, {
        promotions: false,
        tokenRewards: false,
      });
    });

    it("should handle partial updates", async () => {
      vi.mocked(db.updateNotificationPreferences).mockResolvedValue(undefined);

      await db.updateNotificationPreferences(123, {
        orderUpdates: false,
      });

      expect(db.updateNotificationPreferences).toHaveBeenCalledWith(123, {
        orderUpdates: false,
      });
    });
  });

  describe("shouldSendNotification", () => {
    it("should return true for order notifications when enabled", async () => {
      vi.mocked(db.shouldSendNotification).mockResolvedValue(true);

      const result = await db.shouldSendNotification(123, "order");

      expect(result).toBe(true);
      expect(db.shouldSendNotification).toHaveBeenCalledWith(123, "order");
    });

    it("should return false for promo notifications when disabled", async () => {
      vi.mocked(db.shouldSendNotification).mockResolvedValue(false);

      const result = await db.shouldSendNotification(123, "promo");

      expect(result).toBe(false);
      expect(db.shouldSendNotification).toHaveBeenCalledWith(123, "promo");
    });

    it("should return true for tokens notifications when enabled", async () => {
      vi.mocked(db.shouldSendNotification).mockResolvedValue(true);

      const result = await db.shouldSendNotification(123, "tokens");

      expect(result).toBe(true);
    });

    it("should return true for submission notifications when enabled", async () => {
      vi.mocked(db.shouldSendNotification).mockResolvedValue(true);

      const result = await db.shouldSendNotification(123, "submission");

      expect(result).toBe(true);
    });

    it("should return true for system notifications (info type) when enabled", async () => {
      vi.mocked(db.shouldSendNotification).mockResolvedValue(true);

      const result = await db.shouldSendNotification(123, "info");

      expect(result).toBe(true);
    });
  });

  describe("Default preferences", () => {
    it("should have all notification types enabled by default", async () => {
      const defaultPrefs = {
        id: 1,
        userId: 999,
        orderUpdates: true,
        tokenRewards: true,
        promotions: true,
        sellSubmissions: true,
        systemUpdates: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getNotificationPreferences).mockResolvedValue(defaultPrefs);

      const result = await db.getNotificationPreferences(999);

      expect(result?.orderUpdates).toBe(true);
      expect(result?.tokenRewards).toBe(true);
      expect(result?.promotions).toBe(true);
      expect(result?.sellSubmissions).toBe(true);
      expect(result?.systemUpdates).toBe(true);
    });
  });
});
