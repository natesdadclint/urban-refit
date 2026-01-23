import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as db from './db';

// Mock the database connection
vi.mock('./db', async () => {
  const actual = await vi.importActual('./db');
  return {
    ...actual,
    getDb: vi.fn(),
  };
});

describe('Sales Attribution & Partner Profitability', () => {
  describe('getPartnerProfitability', () => {
    it('should return an array of partner profitability data', async () => {
      const result = await db.getPartnerProfitability();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should include required fields in profitability data', async () => {
      const result = await db.getPartnerProfitability();
      
      // If there's data, check the structure
      if (result.length > 0) {
        const partner = result[0];
        expect(partner).toHaveProperty('thriftStoreId');
        expect(partner).toHaveProperty('storeName');
        expect(partner).toHaveProperty('totalProductsSourced');
        expect(partner).toHaveProperty('productsSold');
        expect(partner).toHaveProperty('sellThroughRate');
        expect(partner).toHaveProperty('totalRevenue');
        expect(partner).toHaveProperty('grossProfit');
        expect(partner).toHaveProperty('profitMargin');
      }
    });

    it('should sort results by gross profit descending', async () => {
      const result = await db.getPartnerProfitability();
      
      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].grossProfit).toBeGreaterThanOrEqual(result[i + 1].grossProfit);
        }
      }
    });
  });

  describe('getSalesAttributionSummary', () => {
    it('should return summary data with required fields', async () => {
      const result = await db.getSalesAttributionSummary();
      
      if (result) {
        expect(result).toHaveProperty('totalRevenue');
        expect(result).toHaveProperty('totalCost');
        expect(result).toHaveProperty('totalGrossProfit');
        expect(result).toHaveProperty('overallProfitMargin');
        expect(result).toHaveProperty('totalItemsSold');
        expect(result).toHaveProperty('avgRevenuePerItem');
        expect(result).toHaveProperty('avgProfitPerItem');
        expect(result).toHaveProperty('topPerformingStores');
        expect(result).toHaveProperty('bottomPerformingStores');
        expect(result).toHaveProperty('profitByCategory');
      }
    });

    it('should have numeric values for financial metrics', async () => {
      const result = await db.getSalesAttributionSummary();
      
      if (result) {
        expect(typeof result.totalRevenue).toBe('number');
        expect(typeof result.totalCost).toBe('number');
        expect(typeof result.totalGrossProfit).toBe('number');
        expect(typeof result.overallProfitMargin).toBe('number');
        expect(typeof result.totalItemsSold).toBe('number');
      }
    });

    it('should have arrays for store performance data', async () => {
      const result = await db.getSalesAttributionSummary();
      
      if (result) {
        expect(Array.isArray(result.topPerformingStores)).toBe(true);
        expect(Array.isArray(result.bottomPerformingStores)).toBe(true);
        expect(Array.isArray(result.profitByCategory)).toBe(true);
      }
    });
  });

  describe('getStoreDetailedAnalytics', () => {
    it('should return null for non-existent store', async () => {
      const result = await db.getStoreDetailedAnalytics(999999);
      expect(result).toBeNull();
    });

    it('should return detailed analytics for existing store', async () => {
      // First get a valid store ID
      const profitability = await db.getPartnerProfitability();
      
      if (profitability.length > 0) {
        const storeId = profitability[0].thriftStoreId;
        const result = await db.getStoreDetailedAnalytics(storeId);
        
        if (result) {
          expect(result).toHaveProperty('store');
          expect(result).toHaveProperty('monthlyPerformance');
          expect(result).toHaveProperty('topSellingProducts');
          expect(result).toHaveProperty('categoryBreakdown');
          expect(result.store.id).toBe(storeId);
        }
      }
    });
  });

  describe('Profit calculations', () => {
    it('should calculate profit margin correctly', async () => {
      const result = await db.getSalesAttributionSummary();
      
      if (result && result.totalRevenue > 0) {
        const expectedMargin = (result.totalGrossProfit / result.totalRevenue) * 100;
        expect(result.overallProfitMargin).toBeCloseTo(expectedMargin, 1);
      }
    });

    it('should calculate gross profit as revenue minus cost', async () => {
      const result = await db.getSalesAttributionSummary();
      
      if (result) {
        const expectedProfit = result.totalRevenue - result.totalCost;
        expect(result.totalGrossProfit).toBeCloseTo(expectedProfit, 2);
      }
    });
  });
});
