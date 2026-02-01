import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';

describe('Image Validation System', () => {
  let testRunId: string;
  
  beforeAll(async () => {
    // Clean up any existing test data
    testRunId = 'test-run-' + Date.now();
  });

  it('should create image validation log entry', async () => {
    const logData = {
      validationRunId: testRunId,
      productId: 1,
      imageField: 'image1Url' as const,
      imageUrl: 'https://example.com/image.jpg',
      isValid: true,
      errorType: null,
      httpStatus: 200,
      errorMessage: null,
      responseTimeMs: 150,
    };
    
    const logId = await db.createImageValidationLog(logData);
    expect(logId).toBeGreaterThan(0);
  });

  it('should retrieve validation logs by run ID', async () => {
    // Create a few test logs
    await db.createImageValidationLog({
      validationRunId: testRunId,
      productId: 1,
      imageField: 'image1Url',
      imageUrl: 'https://example.com/image1.jpg',
      isValid: true,
      errorType: null,
      httpStatus: 200,
      errorMessage: null,
      responseTimeMs: 100,
    });
    
    await db.createImageValidationLog({
      validationRunId: testRunId,
      productId: 2,
      imageField: 'image2Url',
      imageUrl: 'https://example.com/image2.jpg',
      isValid: false,
      errorType: 'http_error',
      httpStatus: 404,
      errorMessage: 'Not found',
      responseTimeMs: 200,
    });
    
    const logs = await db.getImageValidationLogsByRunId(testRunId);
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(logs.some(log => log.productId === 1)).toBe(true);
    expect(logs.some(log => log.productId === 2)).toBe(true);
  });

  it('should get validation statistics', async () => {
    const stats = await db.getValidationStats();
    expect(stats).toHaveProperty('totalProducts');
    expect(stats).toHaveProperty('validImages');
    expect(stats).toHaveProperty('invalidImages');
    expect(stats).toHaveProperty('lastRunDate');
    expect(typeof stats.totalProducts).toBe('number');
    expect(typeof stats.validImages).toBe('number');
    expect(typeof stats.invalidImages).toBe('number');
  });

  it('should get validation history', async () => {
    const history = await db.getValidationHistory(5);
    expect(Array.isArray(history)).toBe(true);
    history.forEach(run => {
      expect(run).toHaveProperty('runId');
      expect(run).toHaveProperty('createdAt');
      expect(run).toHaveProperty('totalChecks');
      expect(run).toHaveProperty('validCount');
      expect(run).toHaveProperty('invalidCount');
      expect(typeof run.totalChecks).toBe('number');
      expect(typeof run.validCount).toBe('number');
      expect(typeof run.invalidCount).toBe('number');
    });
  });

  it('should get latest validation run', async () => {
    const latest = await db.getLatestValidationRun();
    if (latest) {
      expect(latest).toHaveProperty('runId');
      expect(latest).toHaveProperty('createdAt');
      expect(typeof latest.runId).toBe('string');
      expect(latest.createdAt).toBeInstanceOf(Date);
    }
  });

  it('should handle null image URLs correctly', async () => {
    const nullImageLog = {
      validationRunId: testRunId,
      productId: 999,
      imageField: 'image1Url' as const,
      imageUrl: null,
      isValid: false,
      errorType: 'null' as const,
      httpStatus: null,
      errorMessage: 'Image URL is null',
      responseTimeMs: 0,
    };
    
    const logId = await db.createImageValidationLog(nullImageLog);
    expect(logId).toBeGreaterThan(0);
    
    const logs = await db.getImageValidationLogsByRunId(testRunId);
    const nullLog = logs.find(log => log.productId === 999);
    expect(nullLog).toBeDefined();
    expect(nullLog?.isValid).toBe(false);
    expect(nullLog?.errorType).toBe('null');
  });

  it('should handle different error types', async () => {
    const errorTypes = ['null', 'empty', 'invalid_format', 'http_error', 'timeout'] as const;
    
    for (const errorType of errorTypes) {
      const log = {
        validationRunId: testRunId,
        productId: 1000 + errorTypes.indexOf(errorType),
        imageField: 'image1Url' as const,
        imageUrl: 'https://example.com/test.jpg',
        isValid: false,
        errorType,
        httpStatus: errorType === 'http_error' ? 500 : null,
        errorMessage: `Test ${errorType} error`,
        responseTimeMs: 100,
      };
      
      const logId = await db.createImageValidationLog(log);
      expect(logId).toBeGreaterThan(0);
    }
    
    const logs = await db.getImageValidationLogsByRunId(testRunId);
    errorTypes.forEach(errorType => {
      const found = logs.some(log => log.errorType === errorType);
      expect(found).toBe(true);
    });
  });
});
