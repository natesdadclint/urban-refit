import { adminProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export const adminRouter = router({
  bulkUploadImages: adminProcedure
    .input(z.object({
      images: z.any(),
      csvData: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const lines = input.csvData.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj: Record<string, string> = {};
          headers.forEach((header, idx) => {
            obj[header] = values[idx] || '';
          });
          return obj;
        });

        const results = [];
        for (const row of rows) {
          const productId = parseInt(row.productId);
          if (!productId) continue;

          const imageUrls: Record<string, string> = {};
          for (let i = 1; i <= 4; i++) {
            const filename = row[`image${i}Filename`];
            if (filename) {
              const file = input.images.find((f: any) => f.name === filename);
              if (file) {
                const buffer = await file.arrayBuffer();
                const key = `products/${productId}/image-${i}-${nanoid()}.jpg`;
                const { url } = await storagePut(key, Buffer.from(buffer), 'image/jpeg');
                imageUrls[`image${i}Url`] = url;
              }
            }
          }

          const metadata = {
            productId,
            invoiceNumber: row.invoiceNumber || null,
            thriftStoreName: row.thriftStoreName || null,
            styleDescription: row.styleDescription || null,
            materialDescription: row.materialDescription || null,
            customInformation: row.customInformation || null,
            image1Alt: row.image1Alt || null,
            image2Alt: row.image2Alt || null,
            image3Alt: row.image3Alt || null,
            image4Alt: row.image4Alt || null,
            ...imageUrls,
          };

          const existing = await db.getProductMetadata(productId);
          if (existing) {
            await db.updateProductMetadata(productId, metadata);
          } else {
            await db.createProductMetadata(metadata);
          }

          results.push({ productId, success: true });
        }

        return { success: true, uploaded: results.length, results };
      } catch (error) {
        console.error('[Bulk Upload] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Bulk upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  // ============ SALES ATTRIBUTION & PARTNER PROFITABILITY ============
  
  // Get partner profitability data for all thrift stores
  getPartnerProfitability: adminProcedure
    .query(async () => {
      const data = await db.getPartnerProfitability();
      return data;
    }),

  // Get overall sales attribution summary
  getSalesAttributionSummary: adminProcedure
    .query(async () => {
      const summary = await db.getSalesAttributionSummary();
      if (!summary) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch sales attribution summary' });
      }
      return summary;
    }),

  // Get detailed analytics for a specific thrift store
  getStoreDetailedAnalytics: adminProcedure
    .input(z.object({ thriftStoreId: z.number() }))
    .query(async ({ input }) => {
      const analytics = await db.getStoreDetailedAnalytics(input.thriftStoreId);
      if (!analytics) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' });
      }
      return analytics;
    }),

  // ============ IMAGE VALIDATION MONITORING ============
  
  validateAllImages: adminProcedure.mutation(async () => {    
    const runId = nanoid();
    const validationResults = [];
    
    // Helper function to validate a single image URL
    const validateImageUrl = async (url: string | null): Promise<{
      isValid: boolean;
      errorType: 'null' | 'empty' | 'invalid_format' | 'http_error' | 'timeout' | null;
      httpStatus: number | null;
      errorMessage: string | null;
      responseTimeMs: number;
    }> => {
      if (!url) {
        return {
          isValid: false,
          errorType: 'null',
          httpStatus: null,
          errorMessage: 'Image URL is null',
          responseTimeMs: 0,
        };
      }
      
      const startTime = Date.now();
      let isValid = true;
      let errorType: 'null' | 'empty' | 'invalid_format' | 'http_error' | 'timeout' | null = null;
      let httpStatus: number | null = null;
      let errorMessage: string | null = null;
      
      try {
        if (!url.startsWith('http') && !url.startsWith('/')) {
          isValid = false;
          errorType = 'invalid_format';
          errorMessage = 'URL does not start with http or /';
        } else if (url.startsWith('http')) {
          const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
          httpStatus = response.status;
          if (!response.ok) {
            isValid = false;
            errorType = 'http_error';
            errorMessage = `HTTP ${response.status}`;
          }
        }
      } catch (error: any) {
        isValid = false;
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
          errorType = 'timeout';
          errorMessage = 'Request timeout after 5s';
        } else {
          errorType = 'http_error';
          errorMessage = error.message;
        }
      }
      
      return {
        isValid,
        errorType,
        httpStatus,
        errorMessage,
        responseTimeMs: Date.now() - startTime,
      };
    };
    
    // Validate product images
    const allProducts = await db.getAllProductsBasic();
    for (const product of allProducts) {
      // Validate image1Url
      const result1 = await validateImageUrl(product.image1Url);
      await db.createImageValidationLog({
        validationRunId: runId,
        assetType: 'product',
        assetId: product.id,
        imageField: 'image1Url',
        imageUrl: product.image1Url,
        ...result1,
      });
      validationResults.push({ assetType: 'product', assetId: product.id, field: 'image1Url', isValid: result1.isValid });
      
      // Validate image2Url
      if (product.image2Url) {
        const result2 = await validateImageUrl(product.image2Url);
        await db.createImageValidationLog({
          validationRunId: runId,
          assetType: 'product',
          assetId: product.id,
          imageField: 'image2Url',
          imageUrl: product.image2Url,
          ...result2,
        });
        validationResults.push({ assetType: 'product', assetId: product.id, field: 'image2Url', isValid: result2.isValid });
      }
    }
    
    // Validate blog post images
    const allBlogs = await db.getAllBlogPostsForValidation();
    for (const blog of allBlogs) {
      const result = await validateImageUrl(blog.featuredImageUrl);
      await db.createImageValidationLog({
        validationRunId: runId,
        assetType: 'blog',
        assetId: blog.id,
        imageField: 'featuredImageUrl',
        imageUrl: blog.featuredImageUrl,
        ...result,
      });
      validationResults.push({ assetType: 'blog', assetId: blog.id, field: 'featuredImageUrl', isValid: result.isValid });
    }
    
    return {
      runId,
      totalChecked: validationResults.length,
      validCount: validationResults.filter(r => r.isValid).length,
      invalidCount: validationResults.filter(r => !r.isValid).length,
      byAssetType: {
        product: validationResults.filter(r => r.assetType === 'product').length,
        blog: validationResults.filter(r => r.assetType === 'blog').length,
      },
    };
  }),
  
  getValidationStats: adminProcedure.query(async () => {
    return await db.getValidationStats();
  }),
  
  getValidationHistory: adminProcedure
    .input(z.object({ limit: z.number().optional().default(10) }))
    .query(async ({ input }) => {
      return await db.getValidationHistory(input.limit);
    }),
  
  getValidationRunDetails: adminProcedure
    .input(z.object({ runId: z.string() }))
    .query(async ({ input }) => {
      return await db.getImageValidationLogsByRunId(input.runId);
    }),
});
