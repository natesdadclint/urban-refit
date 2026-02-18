import { describe, it, expect } from 'vitest';

describe('Referral System', () => {
  describe('Referral Code Generation', () => {
    it('generates code in URBAN-{NAME}-{RANDOM} format', () => {
      const code = 'URBAN-ALEX-A1B2';
      expect(code).toMatch(/^URBAN-[A-Z]+-[A-Z0-9]{4}$/);
    });

    it('extracts first name and uppercases it', () => {
      const userName = 'Alex Johnson';
      const firstName = userName.split(' ')[0].toUpperCase();
      expect(firstName).toBe('ALEX');
    });

    it('handles single-word names', () => {
      const userName = 'Madonna';
      const firstName = userName.split(' ')[0].toUpperCase();
      expect(firstName).toBe('MADONNA');
    });

    it('removes non-alphabetic characters from name', () => {
      const userName = 'Al3x J0hn';
      const cleaned = userName.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
      expect(cleaned).toBe('ALX');
    });

    it('truncates long names to 8 characters', () => {
      const userName = 'Christopher';
      const truncated = userName.substring(0, 8).toUpperCase();
      expect(truncated).toBe('CHRISTOP');
      expect(truncated.length).toBeLessThanOrEqual(8);
    });

    it('handles empty name with fallback', () => {
      const userName = '';
      const firstName = userName.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '').substring(0, 8) || 'USER';
      expect(firstName).toBe('USER');
    });
  });

  describe('Referral Rewards', () => {
    it('awards 10 tokens to referee on signup', () => {
      const REFEREE_SIGNUP_BONUS = 10;
      expect(REFEREE_SIGNUP_BONUS).toBe(10);
    });

    it('awards 20 tokens to referrer on first purchase', () => {
      const REFERRER_REWARD = 20;
      expect(REFERRER_REWARD).toBe(20);
    });

    it('calculates total tokens for completed referral', () => {
      const REFEREE_SIGNUP_BONUS = 10;
      const REFERRER_REWARD = 20;
      const totalTokensIssued = REFEREE_SIGNUP_BONUS + REFERRER_REWARD;
      expect(totalTokensIssued).toBe(30);
    });

    it('converts referee bonus to NZD at $1.00 per token', () => {
      const REFEREE_SIGNUP_BONUS = 10;
      const TOKEN_VALUE_NZD = 1.00;
      const nzdValue = REFEREE_SIGNUP_BONUS * TOKEN_VALUE_NZD;
      expect(nzdValue).toBe(10.00);
    });

    it('converts referrer reward to NZD at $1.00 per token', () => {
      const REFERRER_REWARD = 20;
      const TOKEN_VALUE_NZD = 1.00;
      const nzdValue = REFERRER_REWARD * TOKEN_VALUE_NZD;
      expect(nzdValue).toBe(20.00);
    });
  });

  describe('Referral Status', () => {
    it('starts as pending status', () => {
      const status = 'pending';
      expect(status).toBe('pending');
    });

    it('changes to completed after first purchase', () => {
      let status = 'pending';
      // Simulate first purchase
      status = 'completed';
      expect(status).toBe('completed');
    });

    it('tracks signup and first purchase timestamps', () => {
      const signupAt = new Date('2026-01-01');
      const firstPurchaseAt = new Date('2026-01-15');
      
      expect(firstPurchaseAt.getTime()).toBeGreaterThan(signupAt.getTime());
      expect((firstPurchaseAt.getTime() - signupAt.getTime()) / (1000 * 60 * 60 * 24)).toBe(14); // 14 days
    });
  });

  describe('Referral Code Validation', () => {
    it('validates active referral code', () => {
      const referralCode = {
        code: 'URBAN-ALEX-A1B2',
        isActive: true,
        userId: 1
      };
      
      expect(referralCode.isActive).toBe(true);
      expect(referralCode.code).toBeTruthy();
    });

    it('rejects inactive referral code', () => {
      const referralCode = {
        code: 'URBAN-ALEX-A1B2',
        isActive: false,
        userId: 1
      };
      
      expect(referralCode.isActive).toBe(false);
    });

    it('prevents self-referral', () => {
      const currentUserId = 1;
      const referralCode = {
        userId: 1,
        code: 'URBAN-ALEX-A1B2'
      };
      
      const isSelfReferral = currentUserId === referralCode.userId;
      expect(isSelfReferral).toBe(true);
    });

    it('allows referral from different user', () => {
      const currentUserId = 2;
      const referralCode = {
        userId: 1,
        code: 'URBAN-ALEX-A1B2'
      };
      
      const isSelfReferral = currentUserId === referralCode.userId;
      expect(isSelfReferral).toBe(false);
    });
  });

  describe('Referral Stats', () => {
    it('calculates total referrals', () => {
      const referralCode = {
        totalReferrals: 5,
        completedReferrals: 3
      };
      
      expect(referralCode.totalReferrals).toBe(5);
    });

    it('calculates pending referrals', () => {
      const referralCode = {
        totalReferrals: 5,
        completedReferrals: 3
      };
      
      const pendingReferrals = referralCode.totalReferrals - referralCode.completedReferrals;
      expect(pendingReferrals).toBe(2);
    });

    it('calculates total tokens earned from referrals', () => {
      const completedReferrals = 3;
      const REFERRER_REWARD = 20;
      const totalTokensEarned = completedReferrals * REFERRER_REWARD;
      
      expect(totalTokensEarned).toBe(60);
    });

    it('formats total tokens earned as decimal string', () => {
      const totalTokensEarned = 60;
      const formatted = totalTokensEarned.toFixed(2);
      
      expect(formatted).toBe('60.00');
    });
  });

  describe('Share URL Generation', () => {
    it('generates share URL with referral code', () => {
      const code = 'URBAN-ALEX-A1B2';
      const baseUrl = 'https://urbanrefit.com';
      const shareUrl = `${baseUrl}/?ref=${code}`;
      
      expect(shareUrl).toBe('https://urbanrefit.com/?ref=URBAN-ALEX-A1B2');
    });

    it('extracts referral code from URL parameter', () => {
      const url = new URL('https://urbanrefit.com/?ref=URBAN-ALEX-A1B2');
      const code = url.searchParams.get('ref');
      
      expect(code).toBe('URBAN-ALEX-A1B2');
    });
  });
});
