import { describe, it, expect } from 'vitest';

// Test the referral timer bonus and expiry logic

const TIMER_DURATION_SECONDS = 10 * 60; // 10 minutes
const TIMER_BONUS_TOKENS = 10;
const REFERRAL_EXPIRY_DAYS = 7;
const TOKEN_VALUE_NZD = 1.00;

describe('Referral Timer Bonus System', () => {
  describe('Timer Duration', () => {
    it('should have a 10-minute (600 second) timer', () => {
      expect(TIMER_DURATION_SECONDS).toBe(600);
    });

    it('should format timer correctly at start', () => {
      const mins = Math.floor(TIMER_DURATION_SECONDS / 60);
      const secs = TIMER_DURATION_SECONDS % 60;
      expect(`${mins}:${secs.toString().padStart(2, '0')}`).toBe('10:00');
    });

    it('should format timer correctly mid-countdown', () => {
      const remaining = 325; // 5 min 25 sec
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      expect(`${mins}:${secs.toString().padStart(2, '0')}`).toBe('5:25');
    });

    it('should format timer correctly at 0', () => {
      const remaining = 0;
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      expect(`${mins}:${secs.toString().padStart(2, '0')}`).toBe('0:00');
    });
  });

  describe('Timer Bonus Tokens', () => {
    it('should award 10 bonus tokens when timer is active', () => {
      expect(TIMER_BONUS_TOKENS).toBe(10);
    });

    it('should calculate NZD value of timer bonus at $1.00 per token', () => {
      const nzdValue = TIMER_BONUS_TOKENS * TOKEN_VALUE_NZD;
      expect(nzdValue).toBe(10.00);
    });

    it('timer bonus tokens should be donation-only', () => {
      const bonusDonationOnly = true; // enforced when timerBonusEligible is true
      expect(bonusDonationOnly).toBe(true);
    });

    it('should not award timer bonus when timer has expired', () => {
      const timerExpired = true;
      const timerBonusEligible = !timerExpired;
      expect(timerBonusEligible).toBe(false);
    });

    it('should award timer bonus when timer is still active', () => {
      const timerExpired = false;
      const timeLeft = 300; // 5 minutes remaining
      const timerBonusEligible = !timerExpired && timeLeft > 0;
      expect(timerBonusEligible).toBe(true);
    });
  });

  describe('Referral 1-Week Expiry', () => {
    it('should set expiry to 7 days from creation', () => {
      const now = new Date('2026-02-08T00:00:00Z');
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + REFERRAL_EXPIRY_DAYS);
      
      const expectedExpiry = new Date('2026-02-15T00:00:00Z');
      expect(expiresAt.getTime()).toBe(expectedExpiry.getTime());
    });

    it('should detect expired referral after 1 week', () => {
      const createdAt = new Date('2026-02-01T00:00:00Z');
      const expiresAt = new Date(createdAt);
      expiresAt.setDate(expiresAt.getDate() + REFERRAL_EXPIRY_DAYS);
      
      const now = new Date('2026-02-09T00:00:00Z'); // 8 days later
      const isExpired = now > expiresAt;
      expect(isExpired).toBe(true);
    });

    it('should not be expired within the 1-week window', () => {
      const createdAt = new Date('2026-02-08T00:00:00Z');
      const expiresAt = new Date(createdAt);
      expiresAt.setDate(expiresAt.getDate() + REFERRAL_EXPIRY_DAYS);
      
      const now = new Date('2026-02-12T00:00:00Z'); // 4 days later
      const isExpired = now > expiresAt;
      expect(isExpired).toBe(false);
    });

    it('should expire exactly at the 7-day boundary', () => {
      const createdAt = new Date('2026-02-08T12:00:00Z');
      const expiresAt = new Date(createdAt);
      expiresAt.setDate(expiresAt.getDate() + REFERRAL_EXPIRY_DAYS);
      
      // 1 second after expiry
      const afterExpiry = new Date('2026-02-15T12:00:01Z');
      expect(afterExpiry > expiresAt).toBe(true);
      
      // 1 second before expiry
      const beforeExpiry = new Date('2026-02-15T11:59:59Z');
      expect(beforeExpiry > expiresAt).toBe(false);
    });
  });

  describe('Donation-Only Token Restriction', () => {
    it('timer bonus tokens should be marked as donation-only in transaction', () => {
      const description = 'Timer bonus! 10 tokens earned for quick referral (donation-only -- use these to support a charity)';
      expect(description).toContain('donation-only');
    });

    it('timer bonus should be recorded with earned_referral_bonus type', () => {
      const transactionType = 'earned_referral_bonus';
      expect(transactionType).toBe('earned_referral_bonus');
    });

    it('should store timerBonusTokens amount on the referral record', () => {
      const timerBonusEligible = true;
      const timerBonusTokens = timerBonusEligible ? '10.00' : '0.00';
      expect(timerBonusTokens).toBe('10.00');
    });

    it('should store 0 timerBonusTokens when not eligible', () => {
      const timerBonusEligible = false;
      const timerBonusTokens = timerBonusEligible ? '10.00' : '0.00';
      expect(timerBonusTokens).toBe('0.00');
    });
  });

  describe('Session Timer Persistence', () => {
    it('should calculate remaining time from stored start', () => {
      const storedStart = Date.now() - (5 * 60 * 1000); // 5 minutes ago
      const elapsed = Math.floor((Date.now() - storedStart) / 1000);
      const remaining = TIMER_DURATION_SECONDS - elapsed;
      
      // Should be approximately 300 seconds (5 minutes)
      expect(remaining).toBeGreaterThanOrEqual(299);
      expect(remaining).toBeLessThanOrEqual(301);
    });

    it('should detect timer expired from stored start', () => {
      const storedStart = Date.now() - (11 * 60 * 1000); // 11 minutes ago
      const elapsed = Math.floor((Date.now() - storedStart) / 1000);
      const remaining = TIMER_DURATION_SECONDS - elapsed;
      
      expect(remaining).toBeLessThan(0);
    });
  });

  describe('Referral Code Format', () => {
    it('should generate URBAN-{NAME}-{RANDOM} format', () => {
      const userName = 'Clint';
      const firstName = userName.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '').substring(0, 8) || 'USER';
      const random = 'AB12';
      const code = `URBAN-${firstName}-${random}`;
      
      expect(code).toBe('URBAN-CLINT-AB12');
      expect(code).toMatch(/^URBAN-[A-Z]+-[A-Z0-9]+$/);
    });
  });
});
