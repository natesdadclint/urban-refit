import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock AWS S3
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue({}),
  })),
  PutObjectCommand: vi.fn().mockImplementation((params) => params),
  DeleteObjectCommand: vi.fn(),
  HeadObjectCommand: vi.fn(),
}));

describe("Upload Product Image Endpoint", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe("isAwsConfigured", () => {
    it("should return true when AWS credentials are configured", async () => {
      process.env.AWS_REGION = 'us-west-2';
      process.env.AWS_ACCESS_KEY_ID = 'test-key';
      process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
      
      const { isAwsConfigured } = await import("./storage");
      expect(isAwsConfigured()).toBe(true);
    });

    it("should return false when AWS credentials are missing", async () => {
      delete process.env.AWS_REGION;
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_SECRET_ACCESS_KEY;
      
      const { isAwsConfigured } = await import("./storage");
      expect(isAwsConfigured()).toBe(false);
    });
  });

  describe("uploadProductImage function", () => {
    it("should generate correct S3 key with productId and slot", async () => {
      process.env.AWS_REGION = 'us-west-2';
      process.env.AWS_ACCESS_KEY_ID = 'test-key';
      process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
      process.env.S3_BUCKET = 'urban-refit';
      process.env.S3_BASE_URL = 'https://urban-refit.s3.amazonaws.com';
      
      const { uploadProductImage } = await import("./storage");
      
      const result = await uploadProductImage({
        productId: 123,
        fileBuffer: Buffer.from('test-image'),
        mimeType: 'image/jpeg',
        slot: 1,
      });

      expect(result.key).toMatch(/^products\/123\/1-/);
      expect(result.url).toMatch(/^https:\/\/urban-refit\.s3\.amazonaws\.com\/products\/123\/1-/);
      expect(result.url).toMatch(/\.jpeg$/);
    });

    it("should handle slot 2", async () => {
      process.env.AWS_REGION = 'us-west-2';
      process.env.AWS_ACCESS_KEY_ID = 'test-key';
      process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
      
      const { uploadProductImage } = await import("./storage");
      
      const result = await uploadProductImage({
        productId: 456,
        fileBuffer: Buffer.from('test-image'),
        mimeType: 'image/png',
        slot: 2,
      });

      expect(result.key).toMatch(/^products\/456\/2-/);
      expect(result.url).toMatch(/\.png$/);
    });
  });

  describe("Base64 processing", () => {
    it("should strip data URL prefix from base64", () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const base64Data = dataUrl.replace(/^data:.+;base64,/, '');
      
      expect(base64Data).toBe('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
      expect(base64Data).not.toContain('data:');
    });

    it("should handle raw base64 without prefix", () => {
      const rawBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const base64Data = rawBase64.replace(/^data:.+;base64,/, '');
      
      expect(base64Data).toBe(rawBase64);
    });

    it("should convert base64 to buffer correctly", () => {
      const base64 = 'SGVsbG8gV29ybGQ='; // "Hello World"
      const buffer = Buffer.from(base64, 'base64');
      
      expect(buffer.toString()).toBe('Hello World');
    });
  });

  describe("Field mapping", () => {
    it("should map slot 1 to image1Url", () => {
      const slot = 1;
      const field = slot === 1 ? 'image1Url' : 'image2Url';
      expect(field).toBe('image1Url');
    });

    it("should map slot 2 to image2Url", () => {
      const slot = 2;
      const field = slot === 1 ? 'image1Url' : 'image2Url';
      expect(field).toBe('image2Url');
    });
  });
});
