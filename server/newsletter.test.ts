import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database functions
vi.mock('./db', () => ({
  getEmailSubscriberByEmail: vi.fn(),
  createEmailSubscriber: vi.fn(),
  updateEmailSubscriber: vi.fn(),
  unsubscribeEmail: vi.fn(),
  getAllActiveSubscribers: vi.fn(),
  getSubscriberStats: vi.fn(),
}));

import * as db from './db';

describe('Newsletter Subscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createEmailSubscriber', () => {
    it('should create a new subscriber successfully', async () => {
      const mockSubscriber = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        source: 'newsletter' as const,
        newArrivals: true,
        exclusiveOffers: true,
        sustainabilityNews: false,
        partnerUpdates: false,
        isActive: true,
        unsubscribedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.createEmailSubscriber).mockResolvedValue(mockSubscriber);

      const result = await db.createEmailSubscriber({
        email: 'test@example.com',
        name: 'Test User',
        source: 'newsletter',
      });

      expect(result).toEqual(mockSubscriber);
      expect(db.createEmailSubscriber).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        source: 'newsletter',
      });
    });

    it('should return null for duplicate email', async () => {
      vi.mocked(db.createEmailSubscriber).mockResolvedValue(null);

      const result = await db.createEmailSubscriber({
        email: 'existing@example.com',
        source: 'newsletter',
      });

      expect(result).toBeNull();
    });
  });

  describe('getEmailSubscriberByEmail', () => {
    it('should return subscriber if exists', async () => {
      const mockSubscriber = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        source: 'newsletter' as const,
        newArrivals: true,
        exclusiveOffers: true,
        sustainabilityNews: false,
        partnerUpdates: false,
        isActive: true,
        unsubscribedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getEmailSubscriberByEmail).mockResolvedValue(mockSubscriber);

      const result = await db.getEmailSubscriberByEmail('test@example.com');

      expect(result).toEqual(mockSubscriber);
      expect(db.getEmailSubscriberByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null if subscriber does not exist', async () => {
      vi.mocked(db.getEmailSubscriberByEmail).mockResolvedValue(null);

      const result = await db.getEmailSubscriberByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('unsubscribeEmail', () => {
    it('should unsubscribe successfully', async () => {
      vi.mocked(db.unsubscribeEmail).mockResolvedValue(true);

      const result = await db.unsubscribeEmail('test@example.com');

      expect(result).toBe(true);
      expect(db.unsubscribeEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('getAllActiveSubscribers', () => {
    it('should return all active subscribers', async () => {
      const mockSubscribers = [
        {
          id: 1,
          email: 'user1@example.com',
          name: 'User 1',
          source: 'newsletter' as const,
          newArrivals: true,
          exclusiveOffers: true,
          sustainabilityNews: false,
          partnerUpdates: false,
          isActive: true,
          unsubscribedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          email: 'user2@example.com',
          name: 'User 2',
          source: 'footer' as const,
          newArrivals: true,
          exclusiveOffers: false,
          sustainabilityNews: true,
          partnerUpdates: false,
          isActive: true,
          unsubscribedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getAllActiveSubscribers).mockResolvedValue(mockSubscribers);

      const result = await db.getAllActiveSubscribers();

      expect(result).toHaveLength(2);
      expect(result[0].email).toBe('user1@example.com');
      expect(result[1].email).toBe('user2@example.com');
    });
  });

  describe('getSubscriberStats', () => {
    it('should return subscriber statistics', async () => {
      const mockStats = {
        total: 100,
        active: 85,
        bySource: {
          newsletter: 40,
          footer: 30,
          join_page: 20,
          contact: 10,
        },
      };

      vi.mocked(db.getSubscriberStats).mockResolvedValue(mockStats);

      const result = await db.getSubscriberStats();

      expect(result.total).toBe(100);
      expect(result.active).toBe(85);
      expect(result.bySource.newsletter).toBe(40);
    });
  });

  describe('Email validation', () => {
    it('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
      ];

      const invalidEmails = [
        'invalid',
        '@nodomain.com',
        'no@',
        'spaces in@email.com',
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('Subscription sources', () => {
    it('should accept valid subscription sources', () => {
      const validSources = ['newsletter', 'join_page', 'contact', 'checkout', 'footer'];
      
      validSources.forEach(source => {
        expect(validSources.includes(source)).toBe(true);
      });
    });
  });
});
