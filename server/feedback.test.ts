import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { siteFeedback, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Feedback System", () => {
  let testUserId: number;
  let adminUserId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Create test users
    const [user] = await db.insert(users).values({
      openId: "test-feedback-user",
      name: "Feedback Test User",
      email: "feedback@test.com",
      role: "user",
    });
    testUserId = user.insertId;

    const [admin] = await db.insert(users).values({
      openId: "test-feedback-admin",
      name: "Feedback Admin",
      email: "admin@test.com",
      role: "admin",
    });
    adminUserId = admin.insertId;
  });

  describe("Submit Feedback", () => {
    it("should allow anonymous feedback submission", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {
          headers: {
            referer: "https://urbanrefit.test/shop",
            "user-agent": "Test Browser",
          },
        } as any,
        res: {} as any,
      });

      const result = await caller.feedback.submit({
        type: "bug",
        category: "navigation",
        subject: "Navigation menu not working",
        message: "The menu doesn't open on mobile devices",
        email: "anonymous@test.com",
      });

      expect(result.success).toBe(true);
      expect(result.feedbackId).toBeGreaterThan(0);

      // Verify in database
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const feedback = await db
        .select()
        .from(siteFeedback)
        .where(eq(siteFeedback.id, result.feedbackId));

      expect(feedback).toHaveLength(1);
      expect(feedback[0].type).toBe("bug");
      expect(feedback[0].subject).toBe("Navigation menu not working");
      expect(feedback[0].status).toBe("new");
    });

    it("should allow logged-in user feedback submission", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: "test-feedback-user",
          name: "Feedback Test User",
          email: "feedback@test.com",
          role: "user",
        },
        req: {
          headers: {
            referer: "https://urbanrefit.test/checkout",
            "user-agent": "Test Browser",
          },
        } as any,
        res: {} as any,
      });

      const result = await caller.feedback.submit({
        type: "feature",
        category: "checkout",
        subject: "Add PayPal payment option",
        message: "Would love to see PayPal as a payment method",
      });

      expect(result.success).toBe(true);

      // Verify userId is stored
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const feedback = await db
        .select()
        .from(siteFeedback)
        .where(eq(siteFeedback.id, result.feedbackId));

      expect(feedback[0].userId).toBe(testUserId);
      expect(feedback[0].email).toBe("feedback@test.com");
    });

    it("should validate required fields", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: { headers: {} } as any,
        res: {} as any,
      });

      await expect(
        caller.feedback.submit({
          type: "bug",
          category: "product",
          subject: "",
          message: "Test message",
        })
      ).rejects.toThrow();
    });
  });

  describe("Get My Feedback", () => {
    it("should return user's own feedback", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: "test-feedback-user",
          name: "Feedback Test User",
          email: "feedback@test.com",
          role: "user",
        },
        req: { headers: {} } as any,
        res: {} as any,
      });

      const feedback = await caller.feedback.myFeedback();

      expect(Array.isArray(feedback)).toBe(true);
      expect(feedback.length).toBeGreaterThan(0);
      expect(feedback.every((f) => f.userId === testUserId)).toBe(true);
    });

    it("should require authentication", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: { headers: {} } as any,
        res: {} as any,
      });

      await expect(caller.feedback.myFeedback()).rejects.toThrow();
    });
  });

  describe("Admin Feedback Management", () => {
    it("should allow admin to get all feedback", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: adminUserId,
          openId: "test-feedback-admin",
          name: "Feedback Admin",
          email: "admin@test.com",
          role: "admin",
        },
        req: { headers: {} } as any,
        res: {} as any,
      });

      const feedback = await caller.feedback.getAll({
        limit: 10,
        offset: 0,
      });

      expect(Array.isArray(feedback)).toBe(true);
      expect(feedback.length).toBeGreaterThan(0);
    });

    it("should filter feedback by status", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: adminUserId,
          openId: "test-feedback-admin",
          name: "Feedback Admin",
          email: "admin@test.com",
          role: "admin",
        },
        req: { headers: {} } as any,
        res: {} as any,
      });

      const feedback = await caller.feedback.getAll({
        status: "new",
        limit: 10,
        offset: 0,
      });

      expect(feedback.every((f) => f.status === "new")).toBe(true);
    });

    it("should allow admin to update feedback status", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Create test feedback
      const [feedback] = await db.insert(siteFeedback).values({
        type: "general",
        subject: "Test feedback for status update",
        message: "Test message",
        status: "new",
      });

      const caller = appRouter.createCaller({
        user: {
          id: adminUserId,
          openId: "test-feedback-admin",
          name: "Feedback Admin",
          email: "admin@test.com",
          role: "admin",
        },
        req: { headers: {} } as any,
        res: {} as any,
      });

      const result = await caller.feedback.updateStatus({
        id: feedback.insertId,
        status: "resolved",
        adminNotes: "Issue fixed in latest release",
      });

      expect(result.success).toBe(true);

      // Verify update
      const updated = await db
        .select()
        .from(siteFeedback)
        .where(eq(siteFeedback.id, feedback.insertId));

      expect(updated[0].status).toBe("resolved");
      expect(updated[0].adminNotes).toBe("Issue fixed in latest release");
    });

    it("should deny non-admin access to admin endpoints", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: "test-feedback-user",
          name: "Feedback Test User",
          email: "feedback@test.com",
          role: "user",
        },
        req: { headers: {} } as any,
        res: {} as any,
      });

      await expect(
        caller.feedback.getAll({ limit: 10, offset: 0 })
      ).rejects.toThrow("Unauthorized");

      await expect(
        caller.feedback.updateStatus({
          id: 1,
          status: "resolved",
        })
      ).rejects.toThrow("Unauthorized");
    });
  });
});
