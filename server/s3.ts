/**
 * Alternative S3 Upload Utility
 * 
 * Use this when you need direct AWS SDK control or are deploying outside Manus.
 * For Manus-hosted deployments, prefer `storagePut` from ./storage.ts which uses
 * pre-configured credentials.
 * 
 * Required environment variables:
 * - AWS_REGION
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

// Lazy initialization to avoid errors when AWS credentials aren't configured
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'AWS credentials not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY environment variables, or use storagePut() from ./storage.ts instead.'
      );
    }

    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3Client;
}

const BUCKET = process.env.S3_BUCKET || 'urban-refit';
const BASE_URL = process.env.S3_BASE_URL || `https://${BUCKET}.s3.amazonaws.com`;

export interface UploadProductImageOptions {
  productId: number;
  fileBuffer: Buffer;
  mimeType: string;
  slot: 1 | 2 | 3 | 4;
}

export interface UploadResult {
  key: string;
  url: string;
}

/**
 * Upload a product image to S3 using direct AWS SDK
 * 
 * @example
 * const { url } = await uploadProductImage({
 *   productId: 123,
 *   fileBuffer: imageBuffer,
 *   mimeType: 'image/jpeg',
 *   slot: 1,
 * });
 * // url: 'https://urban-refit.s3.amazonaws.com/products/123/1-abc123.jpg'
 */
export async function uploadProductImage(opts: UploadProductImageOptions): Promise<UploadResult> {
  const s3 = getS3Client();
  const ext = opts.mimeType.split('/')[1] || 'jpg';
  const key = `products/${opts.productId}/${opts.slot}-${randomUUID()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: opts.fileBuffer,
      ContentType: opts.mimeType,
      ACL: 'public-read',
    }),
  );

  const url = `${BASE_URL}/${key}`;
  return { key, url };
}

/**
 * Upload any file to S3 with a custom key
 * 
 * @example
 * const { url } = await uploadFile({
 *   key: 'blog/images/hero.jpg',
 *   fileBuffer: imageBuffer,
 *   mimeType: 'image/jpeg',
 * });
 */
export async function uploadFile(opts: {
  key: string;
  fileBuffer: Buffer;
  mimeType: string;
}): Promise<UploadResult> {
  const s3 = getS3Client();

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: opts.key,
      Body: opts.fileBuffer,
      ContentType: opts.mimeType,
      ACL: 'public-read',
    }),
  );

  const url = `${BASE_URL}/${opts.key}`;
  return { key: opts.key, url };
}

/**
 * Delete a file from S3
 * 
 * @example
 * await deleteFile('products/123/1-abc123.jpg');
 */
export async function deleteFile(key: string): Promise<void> {
  const s3 = getS3Client();

  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
  );
}

/**
 * Check if a file exists in S3
 * 
 * @example
 * const exists = await fileExists('products/123/1-abc123.jpg');
 */
export async function fileExists(key: string): Promise<boolean> {
  const s3 = getS3Client();

  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: BUCKET,
        Key: key,
      }),
    );
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Generate the expected S3 URL for a product image
 * Useful for validation without making an API call
 */
export function getProductImageUrl(productId: number, slot: 1 | 2 | 3 | 4, filename: string): string {
  return `${BASE_URL}/products/${productId}/${slot}-${filename}`;
}

/**
 * Check if AWS credentials are configured
 */
export function isAwsConfigured(): boolean {
  return !!(
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  );
}
