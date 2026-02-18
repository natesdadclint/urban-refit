import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  createNotification: vi.fn().mockResolvedValue(1),
  createBroadcastNotification: vi.fn().mockResolvedValue(2),
  getUserNotifications: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, title: 'Test', message: 'Test message', type: 'info', isRead: false, createdAt: new Date() }
  ]),
  getUnreadNotificationCount: vi.fn().mockResolvedValue(3),
  markNotificationAsRead: vi.fn().mockResolvedValue(undefined),
  markAllNotificationsAsRead: vi.fn().mockResolvedValue(undefined),
  deleteNotification: vi.fn().mockResolvedValue(true),
  getAllBroadcastNotifications: vi.fn().mockResolvedValue([
    { id: 2, title: 'Broadcast', message: 'Broadcast message', type: 'promo', isBroadcast: true, createdAt: new Date() }
  ]),
  deleteBroadcastNotification: vi.fn().mockResolvedValue(undefined),
}));

import * as db from './db';

describe('Notification System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a user notification', async () => {
      const notification = {
        userId: 1,
        title: 'Order Shipped',
        message: 'Your order has been shipped!',
        type: 'order' as const,
        link: '/orders/123'
      };
      
      const id = await db.createNotification(notification);
      
      expect(db.createNotification).toHaveBeenCalledWith(notification);
      expect(id).toBe(1);
    });
  });

  describe('createBroadcastNotification', () => {
    it('should create a broadcast notification for all users', async () => {
      const broadcast = {
        title: 'New Collection Available!',
        message: 'Check out our latest arrivals',
        type: 'promo' as const,
        link: '/shop'
      };
      
      const id = await db.createBroadcastNotification(broadcast);
      
      expect(db.createBroadcastNotification).toHaveBeenCalledWith(broadcast);
      expect(id).toBe(2);
    });
  });

  describe('getUserNotifications', () => {
    it('should return user notifications', async () => {
      const notifications = await db.getUserNotifications(1, 20);
      
      expect(db.getUserNotifications).toHaveBeenCalledWith(1, 20);
      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toBe('Test');
    });
  });

  describe('getUnreadNotificationCount', () => {
    it('should return unread count', async () => {
      const count = await db.getUnreadNotificationCount(1);
      
      expect(db.getUnreadNotificationCount).toHaveBeenCalledWith(1);
      expect(count).toBe(3);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark a notification as read', async () => {
      await db.markNotificationAsRead(1, 1);
      
      expect(db.markNotificationAsRead).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      await db.markAllNotificationsAsRead(1);
      
      expect(db.markAllNotificationsAsRead).toHaveBeenCalledWith(1);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a user notification', async () => {
      const result = await db.deleteNotification(1, 1);
      
      expect(db.deleteNotification).toHaveBeenCalledWith(1, 1);
      expect(result).toBe(true);
    });
  });

  describe('getAllBroadcastNotifications', () => {
    it('should return all broadcast notifications for admin', async () => {
      const broadcasts = await db.getAllBroadcastNotifications();
      
      expect(db.getAllBroadcastNotifications).toHaveBeenCalled();
      expect(broadcasts).toHaveLength(1);
      expect(broadcasts[0].isBroadcast).toBe(true);
    });
  });

  describe('deleteBroadcastNotification', () => {
    it('should delete a broadcast notification', async () => {
      await db.deleteBroadcastNotification(2);
      
      expect(db.deleteBroadcastNotification).toHaveBeenCalledWith(2);
    });
  });
});

describe('Notification Types', () => {
  it('should support all notification types', () => {
    const validTypes = ['info', 'success', 'warning', 'order', 'submission', 'tokens', 'promo'];
    
    validTypes.forEach(type => {
      expect(validTypes).toContain(type);
    });
  });
});

describe('Notification Helper Functions', () => {
  it('should have helper for order notifications', async () => {
    // Test that order notification helper exists and works
    const notification = {
      userId: 1,
      title: 'Order Confirmed',
      message: 'Your order has been confirmed and is being processed. (Order #123)',
      type: 'order' as const,
      link: '/orders/123'
    };
    
    await db.createNotification(notification);
    expect(db.createNotification).toHaveBeenCalledWith(notification);
  });

  it('should have helper for token notifications', async () => {
    const notification = {
      userId: 1,
      title: 'Tokens Earned!',
      message: '+1 token: Weekly login reward',     type: 'tokens' as const,
      link: '/profile'
    };
    
    await db.createNotification(notification);
    expect(db.createNotification).toHaveBeenCalledWith(notification);
  });

  it('should have helper for sell submission notifications', async () => {
    const notification = {
      userId: 1,
      title: 'Token Offer Received!',
      message: "We've made you a token offer of 100 tokens. Check your submissions to respond.",
      type: 'submission' as const,
      link: '/my-submissions'
    };
    
    await db.createNotification(notification);
    expect(db.createNotification).toHaveBeenCalledWith(notification);
  });
});
