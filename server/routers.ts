import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { createCheckoutSession } from "./stripe";
import { invokeLLM } from "./_core/llm";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// Calculate sale price from original cost and markup
function calculatePricing(originalCost: number, markupPercentage: number) {
  const salePrice = originalCost * (1 + markupPercentage / 100);
  const thriftStorePayoutAmount = salePrice * 0.10; // 10% to thrift store
  return {
    salePrice: salePrice.toFixed(2),
    thriftStorePayoutAmount: thriftStorePayoutAmount.toFixed(2),
  };
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ THRIFT STORE ROUTES ============
  thriftStore: router({
    list: publicProcedure.query(async () => {
      return db.getAllThriftStores(true);
    }),
    
    listAll: adminProcedure.query(async () => {
      return db.getAllThriftStores(false);
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getThriftStoreById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        address: z.string().optional(),
        city: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        contactPerson: z.string().optional(),
        bankName: z.string().optional(),
        bankAccount: z.string().optional(),
        bankRouting: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createThriftStore(input);
        return { id, success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        contactPerson: z.string().optional(),
        bankName: z.string().optional(),
        bankAccount: z.string().optional(),
        bankRouting: z.string().optional(),
        notes: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateThriftStore(id, data);
        return { success: true };
      }),
  }),

  // ============ PRODUCT ROUTES ============
  product: router({
    list: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAvailableProducts(input?.category);
      }),
    
    listAll: adminProcedure.query(async () => {
      return db.getAllProducts();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getProductWithThriftStore(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        brand: z.string().optional(),
        category: z.enum(["tops", "bottoms", "dresses", "outerwear", "accessories", "shoes", "bags", "other"]),
        size: z.string().optional(),
        condition: z.enum(["like_new", "excellent", "good", "fair"]),
        color: z.string().optional(),
        material: z.string().optional(),
        originalCost: z.number().positive(),
        markupPercentage: z.number().min(0),
        thriftStoreId: z.number().optional(),
        image1Url: z.string().optional(),
        image2Url: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const pricing = calculatePricing(input.originalCost, input.markupPercentage);
        const id = await db.createProduct({
          ...input,
          originalCost: input.originalCost.toFixed(2),
          markupPercentage: input.markupPercentage.toFixed(2),
          salePrice: pricing.salePrice,
          thriftStorePayoutAmount: pricing.thriftStorePayoutAmount,
        });
        return { id, success: true, ...pricing };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        brand: z.string().optional(),
        category: z.enum(["tops", "bottoms", "dresses", "outerwear", "accessories", "shoes", "bags", "other"]).optional(),
        size: z.string().optional(),
        condition: z.enum(["like_new", "excellent", "good", "fair"]).optional(),
        color: z.string().optional(),
        material: z.string().optional(),
        originalCost: z.number().positive().optional(),
        markupPercentage: z.number().min(0).optional(),
        thriftStoreId: z.number().optional(),
        image1Url: z.string().optional(),
        image2Url: z.string().optional(),
        status: z.enum(["available", "reserved", "sold", "archived"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, originalCost, markupPercentage, ...rest } = input;
        
        let updateData: any = { ...rest };
        
        // Recalculate pricing if cost or markup changed
        if (originalCost !== undefined || markupPercentage !== undefined) {
          const existing = await db.getProductById(id);
          if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
          
          const cost = originalCost ?? parseFloat(existing.originalCost);
          const markup = markupPercentage ?? parseFloat(existing.markupPercentage);
          const pricing = calculatePricing(cost, markup);
          
          updateData = {
            ...updateData,
            originalCost: cost.toFixed(2),
            markupPercentage: markup.toFixed(2),
            salePrice: pricing.salePrice,
            thriftStorePayoutAmount: pricing.thriftStorePayoutAmount,
          };
        }
        
        await db.updateProduct(id, updateData);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
    
    // Image upload endpoint
    uploadImage: adminProcedure
      .input(z.object({
        filename: z.string(),
        contentType: z.string(),
        base64Data: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64Data, "base64");
        const fileKey = `products/${nanoid()}-${input.filename}`;
        const { url } = await storagePut(fileKey, buffer, input.contentType);
        return { url, fileKey };
      }),
  }),

  // ============ CART ROUTES ============
  cart: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const items = await db.getCartItems(ctx.user.id);
      const total = items.reduce((sum, item) => sum + parseFloat(item.product.salePrice), 0);
      return { items, total: total.toFixed(2), count: items.length };
    }),
    
    add: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Check if product is available
        const product = await db.getProductById(input.productId);
        if (!product || product.status !== "available") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Product not available" });
        }
        
        await db.addToCart(ctx.user.id, input.productId);
        return { success: true };
      }),
    
    remove: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.removeFromCart(ctx.user.id, input.productId);
        return { success: true };
      }),
    
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearCart(ctx.user.id);
      return { success: true };
    }),
    
    count: protectedProcedure.query(async ({ ctx }) => {
      return db.getCartItemCount(ctx.user.id);
    }),
  }),

  // ============ CHECKOUT ROUTES ============
  checkout: router({
    createSession: protectedProcedure
      .input(z.object({
        shippingName: z.string().min(1),
        shippingAddress: z.string().min(1),
        shippingCity: z.string().min(1),
        shippingState: z.string().min(1),
        shippingZip: z.string().min(1),
        shippingCountry: z.string().min(1),
        shippingPhone: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const cartData = await db.getCartItems(ctx.user.id);
        
        if (cartData.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });
        }
        
        // Check all products are still available
        for (const item of cartData) {
          if (item.product.status !== "available") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `${item.product.name} is no longer available`,
            });
          }
        }
        
        const origin = ctx.req.headers.origin || `${ctx.req.protocol}://${ctx.req.get("host")}`;
        
        const result = await createCheckoutSession(
          ctx.user.id,
          ctx.user.email,
          ctx.user.name,
          cartData as any,
          {
            name: input.shippingName,
            address: input.shippingAddress,
            city: input.shippingCity,
            state: input.shippingState,
            zip: input.shippingZip,
            country: input.shippingCountry,
            phone: input.shippingPhone,
          },
          origin
        );
        
        return result;
      }),
  }),

  // ============ ORDER ROUTES ============
  order: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserOrders(ctx.user.id);
    }),
    
    listAll: adminProcedure.query(async () => {
      return db.getAllOrders();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        
        // Only allow user to see their own orders (unless admin)
        if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        const items = await db.getOrderItems(input.id);
        return { order, items };
      }),
    
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateOrder(input.id, { status: input.status });
        return { success: true };
      }),
  }),

  // ============ PAYOUT ROUTES ============
  payout: router({
    list: adminProcedure.query(async () => {
      return db.getAllPayouts();
    }),
    
    listByThriftStore: adminProcedure
      .input(z.object({ thriftStoreId: z.number() }))
      .query(async ({ input }) => {
        return db.getPayoutsByThriftStore(input.thriftStoreId);
      }),
    
    create: adminProcedure
      .input(z.object({
        thriftStoreId: z.number(),
        amount: z.number().positive(),
        paymentMethod: z.string().optional(),
        paymentReference: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createPayout({
          thriftStoreId: input.thriftStoreId,
          amount: input.amount.toFixed(2),
          paymentMethod: input.paymentMethod,
          paymentReference: input.paymentReference,
          notes: input.notes,
        });
        return { id, success: true };
      }),
    
    markPaid: adminProcedure
      .input(z.object({
        id: z.number(),
        paymentReference: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updatePayout(input.id, {
          status: "paid",
          paidAt: new Date(),
          paymentReference: input.paymentReference,
        });
        return { success: true };
      }),
  }),

  // ============ ANALYTICS ROUTES ============
  analytics: router({
    sales: adminProcedure.query(async () => {
      return db.getSalesAnalytics();
    }),
    
    products: adminProcedure.query(async () => {
      return db.getProductAnalytics();
    }),
    
    insights: adminProcedure.query(async () => {
      // Get analytics data
      const salesData = await db.getSalesAnalytics();
      const productData = await db.getProductAnalytics();
      
      if (!salesData || !productData) {
        return { insights: "Not enough data to generate insights yet." };
      }
      
      // Generate LLM insights
      const prompt = `You are an analytics expert for Urban Refit, a curated secondhand clothing marketplace. Analyze the following data and provide actionable insights:

SALES DATA:
- Total Sales: $${salesData.totalSales}
- Order Count: ${salesData.orderCount}
- Sales by Category: ${JSON.stringify(salesData.salesByCategory)}
- Top Thrift Stores: ${JSON.stringify(salesData.topThriftStores)}

PRODUCT DATA:
- Products by Status: ${JSON.stringify(productData.productsByStatus)}
- Top Brands: ${JSON.stringify(productData.topBrands)}
- Average Markup: ${productData.avgMarkup}%
- Average Profit per Item: $${productData.avgProfit}

Please provide:
1. Key performance highlights
2. Best-selling categories and brands analysis
3. Thrift store partnership performance
4. Pricing strategy recommendations
5. Inventory management suggestions

Keep insights concise and actionable.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a business analytics expert specializing in sustainable fashion retail." },
            { role: "user", content: prompt },
          ],
        });
        
        return {
          insights: response.choices[0]?.message?.content || "Unable to generate insights.",
          salesData,
          productData,
        };
      } catch (error) {
        console.error("[Analytics] LLM error:", error);
        return {
          insights: "Unable to generate AI insights at this time.",
          salesData,
          productData,
        };
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
