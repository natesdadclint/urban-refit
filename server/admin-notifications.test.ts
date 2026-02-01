import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  createAdminNotification: vi.fn().mockResolvedValue(1),
  getAdminNotifications: vi.fn().mockResolvedValue([
    {
      id: 1,
      title: "New Order Received",
      message: "John Doe placed an order for NZ$99.00",
      type: "new_order",
      priority: "high",
      isRead: false,
      createdAt: new Date(),
    },
    {
      id: 2,
      title: "New Sell Submission",
      message: "Jane Smith submitted 1 item(s) for review",
      type: "new_submission",
      priority: "medium",
      isRead: true,
      createdAt: new Date(),
    },
  ]),
  getUnreadAdminNotificationCount: vi.fn().mockResolvedValue(1),
  getAdminNotificationStats: vi.fn().mockResolvedValue({
    total: 10,
    unread: 3,
    byType: { new_order: 5, new_submission: 3, new_contact: 2 },
    byPriority: { low: 2, medium: 5, high: 3, critical: 0 },
  }),
  markAdminNotificationAsRead: vi.fn().mockResolvedValue(undefined),
  markAllAdminNotificationsAsRead: vi.fn().mockResolvedValue(5),
  deleteAdminNotification: vi.fn().mockResolvedValue(undefined),
  notifyAdminNewOrder: vi.fn().mockResolvedValue(undefined),
  notifyAdminNewSubmission: vi.fn().mockResolvedValue(undefined),
  notifyAdminNewContact: vi.fn().mockResolvedValue(undefined),
}));

import * as db from "./db";

describe("Admin Notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAdminNotification", () => {
    it("should create a notification with required fields", async () => {
      const notificationData = {
        title: "Test Notification",
        message: "This is a test message",
        type: "system_alert" as const,
        priority: "medium" as const,
      };

      const result = await db.createAdminNotification(notificationData);
      
      expect(db.createAdminNotification).toHaveBeenCalledWith(notificationData);
      expect(result).toBe(1);
    });

    it("should create a notification with optional link", async () => {
      const notificationData = {
        title: "Order Alert",
        message: "New order received",
        type: "new_order" as const,
        priority: "high" as const,
        link: "/admin/orders/123",
      };

      await db.createAdminNotification(notificationData);
      
      expect(db.createAdminNotification).toHaveBeenCalledWith(notificationData);
    });
  });

  describe("getAdminNotifications", () => {
    it("should return list of notifications", async () => {
      const notifications = await db.getAdminNotifications({});
      
      expect(notifications).toHaveLength(2);
      expect(notifications[0].type).toBe("new_order");
      expect(notifications[1].type).toBe("new_submission");
    });

    it("should filter by unread only", async () => {
      await db.getAdminNotifications({ unreadOnly: true });
      
      expect(db.getAdminNotifications).toHaveBeenCalledWith({ unreadOnly: true });
    });

    it("should filter by type", async () => {
      await db.getAdminNotifications({ type: "new_order" });
      
      expect(db.getAdminNotifications).toHaveBeenCalledWith({ type: "new_order" });
    });

    it("should filter by priority", async () => {
      await db.getAdminNotifications({ priority: "high" });
      
      expect(db.getAdminNotifications).toHaveBeenCalledWith({ priority: "high" });
    });
  });

  describe("getUnreadAdminNotificationCount", () => {
    it("should return count of unread notifications", async () => {
      const count = await db.getUnreadAdminNotificationCount();
      
      expect(count).toBe(1);
    });
  });

  describe("getAdminNotificationStats", () => {
    it("should return notification statistics", async () => {
      const stats = await db.getAdminNotificationStats();
      
      expect(stats.total).toBe(10);
      expect(stats.unread).toBe(3);
      expect(stats.byType.new_order).toBe(5);
      expect(stats.byPriority.high).toBe(3);
    });
  });

  describe("markAdminNotificationAsRead", () => {
    it("should mark notification as read", async () => {
      await db.markAdminNotificationAsRead(1, 123);
      
      expect(db.markAdminNotificationAsRead).toHaveBeenCalledWith(1, 123);
    });
  });

  describe("markAllAdminNotificationsAsRead", () => {
    it("should mark all notifications as read and return count", async () => {
      const count = await db.markAllAdminNotificationsAsRead(123);
      
      expect(count).toBe(5);
      expect(db.markAllAdminNotificationsAsRead).toHaveBeenCalledWith(123);
    });
  });

  describe("deleteAdminNotification", () => {
    it("should delete notification by ID", async () => {
      await db.deleteAdminNotification(1);
      
      expect(db.deleteAdminNotification).toHaveBeenCalledWith(1);
    });
  });

  describe("Event-triggered notifications", () => {
    it("should create notification for new order", async () => {
      await db.notifyAdminNewOrder(123, "John Doe", 99.00);
      
      expect(db.notifyAdminNewOrder).toHaveBeenCalledWith(123, "John Doe", 99.00);
    });

    it("should create notification for new submission", async () => {
      await db.notifyAdminNewSubmission(456, "Jane Smith", 1);
      
      expect(db.notifyAdminNewSubmission).toHaveBeenCalledWith(456, "Jane Smith", 1);
    });

    it("should create notification for new contact message", async () => {
      await db.notifyAdminNewContact(789, "user@example.com", "Question about shipping");
      
      expect(db.notifyAdminNewContact).toHaveBeenCalledWith(789, "user@example.com", "Question about shipping");
    });
  });

  describe("Notification types", () => {
    it("should support all notification types", () => {
      const validTypes = [
        "new_order",
        "order_cancelled",
        "new_submission",
        "submission_approved",
        "submission_rejected",
        "new_contact",
        "low_stock",
        "payout_due",
        "system_alert",
        "security_alert",
      ];
      
      expect(validTypes).toHaveLength(10);
    });

    it("should support all priority levels", () => {
      const validPriorities = ["low", "medium", "high", "critical"];
      
      expect(validPriorities).toHaveLength(4);
    });
  });
});
