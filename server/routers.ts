import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminRouter } from "./admin-routes";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { createCheckoutSession } from "./stripe";
import { invokeLLM } from "./_core/llm";
import { addSubscriberToMailchimp, removeSubscriberFromMailchimp } from "./mailchimp";

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
  const thriftStorePayoutAmount = salePrice * 0.05; // 5% to thrift store
  return {
    salePrice: salePrice.toFixed(2),
    thriftStorePayoutAmount: thriftStorePayoutAmount.toFixed(2),
  };
}

export const appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  
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
    
    // Store performance metrics for partnership scaling
    performanceMetrics: adminProcedure.query(async () => {
      return db.getStorePerformanceMetrics();
    }),
    
    performanceSummary: adminProcedure.query(async () => {
      return db.getStorePerformanceSummary();
    }),
  }),

  // ============ PRODUCT ROUTES ============
  product: router({
    list: publicProcedure
      .input(z.object({ 
        category: z.string().optional(),
        size: z.string().optional(),
        brand: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'name']).optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getAvailableProducts(input);
      }),
    
    // Get available filter options
    filterOptions: publicProcedure.query(async () => {
      const [brands, sizes, priceRange] = await Promise.all([
        db.getDistinctBrands(),
        db.getDistinctSizes(),
        db.getPriceRange(),
      ]);
      return { brands, sizes, priceRange };
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
    
    verifySession: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        if (!input.sessionId) {
          return { success: false, orderId: null };
        }
        
        try {
          // Import stripe directly
          const { stripe } = await import("./stripe");
          const session = await stripe.checkout.sessions.retrieve(input.sessionId);
          
          if (session.metadata?.order_id) {
            return {
              success: true,
              orderId: parseInt(session.metadata.order_id),
              customerEmail: session.customer_email,
              paymentStatus: session.payment_status,
            };
          }
          
          return { success: false, orderId: null };
        } catch (error) {
          console.error("[Checkout] Failed to verify session:", error);
          return { success: false, orderId: null };
        }
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

  // ============ CUSTOMER PROFILE ROUTES ============
  customerProfile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrCreateCustomerProfile(ctx.user.id);
    }),
    
    update: protectedProcedure
      .input(z.object({
        dateOfBirth: z.string().optional(),
        gender: z.string().optional(),
        preferredCategories: z.array(z.string()).optional(),
        preferredSizes: z.array(z.string()).optional(),
        preferredBrands: z.array(z.string()).optional(),
        emailMarketing: z.boolean().optional(),
        smsMarketing: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Ensure profile exists
        await db.getOrCreateCustomerProfile(ctx.user.id);
        
        const updateData: any = {};
        if (input.dateOfBirth) updateData.dateOfBirth = new Date(input.dateOfBirth);
        if (input.gender !== undefined) updateData.gender = input.gender;
        if (input.preferredCategories) updateData.preferredCategories = JSON.stringify(input.preferredCategories);
        if (input.preferredSizes) updateData.preferredSizes = JSON.stringify(input.preferredSizes);
        if (input.preferredBrands) updateData.preferredBrands = JSON.stringify(input.preferredBrands);
        if (input.emailMarketing !== undefined) updateData.emailMarketing = input.emailMarketing;
        if (input.smsMarketing !== undefined) updateData.smsMarketing = input.smsMarketing;
        
        await db.updateCustomerProfile(ctx.user.id, updateData);
        return { success: true };
      }),
    
    getTokenTransactions: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getUserTokenTransactions(ctx.user.id, input.limit || 50);
      }),
    
    convertTokensToSpendLimit: protectedProcedure
      .input(z.object({ amount: z.number().positive() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getOrCreateCustomerProfile(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
        
        const currentBalance = parseFloat(profile.tokenBalance);
        if (currentBalance < input.amount) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient token balance" });
        }
        
        // Deduct tokens and add to spend limit
        await db.updateTokenBalance(ctx.user.id, input.amount.toFixed(2), 'subtract');
        await db.updateSpendLimit(ctx.user.id, input.amount.toFixed(2), 'add');
        
        // Record transaction
        const newBalance = currentBalance - input.amount;
        await db.createTokenTransaction({
          userId: ctx.user.id,
          type: 'spent_spend_limit',
          amount: (-input.amount).toFixed(2),
          balanceAfter: newBalance.toFixed(2),
          description: `Converted ${input.amount.toFixed(2)} tokens to spend limit`,
        });
        
        return { success: true, newBalance: newBalance.toFixed(2) };
      }),
    
    // Weekly login reward endpoints
    claimWeeklyReward: protectedProcedure
      .input(z.object({
        fingerprint: z.string().optional(),
      }).optional())
      .mutation(async ({ ctx, input }) => {
        // Get IP from request headers
        const ip = ctx.req?.headers['x-forwarded-for']?.toString().split(',')[0] || 
                   ctx.req?.socket?.remoteAddress || 
                   undefined;
        return db.checkAndAwardWeeklyLoginReward(ctx.user.id, input?.fingerprint, ip);
      }),
    
    getWeeklyRewardStatus: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getWeeklyRewardStatus(ctx.user.id);
      }),
  }),

  // ============ CHARITY ROUTES ============
  charity: router({
    list: publicProcedure.query(async () => {
      return db.getAllCharities(true);
    }),
    
    listAll: adminProcedure.query(async () => {
      return db.getAllCharities(false);
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCharityById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        website: z.string().optional(),
        logoUrl: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createCharity(input);
        return { id, success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        website: z.string().optional(),
        logoUrl: z.string().optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCharity(id, data);
        return { success: true };
      }),
    
    donate: protectedProcedure
      .input(z.object({
        charityId: z.number(),
        tokenAmount: z.number().positive(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getOrCreateCustomerProfile(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
        
        const currentBalance = parseFloat(profile.tokenBalance);
        if (currentBalance < input.tokenAmount) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient token balance" });
        }
        
        const charity = await db.getCharityById(input.charityId);
        if (!charity || !charity.isActive) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Charity not found or inactive" });
        }
        
        // Convert tokens to dollar value (1 token = $1)
        const dollarValue = input.tokenAmount;
        
        // Create donation record
        await db.createCharityDonation({
          userId: ctx.user.id,
          charityId: input.charityId,
          tokenAmount: input.tokenAmount.toFixed(2),
          dollarValue: dollarValue.toFixed(2),
          status: 'confirmed',
        });
        
        // Update token balance
        await db.updateTokensDonated(ctx.user.id, input.tokenAmount.toFixed(2));
        
        // Update charity total
        await db.incrementCharityDonations(input.charityId, dollarValue.toFixed(2));
        
        // Record transaction
        const newBalance = currentBalance - input.tokenAmount;
        await db.createTokenTransaction({
          userId: ctx.user.id,
          type: 'donated_charity',
          amount: (-input.tokenAmount).toFixed(2),
          balanceAfter: newBalance.toFixed(2),
          relatedCharityId: input.charityId,
          description: `Donated ${input.tokenAmount.toFixed(2)} tokens to ${charity.name}`,
        });
        
        return { success: true, newBalance: newBalance.toFixed(2) };
      }),
    
    getUserDonations: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserCharityDonations(ctx.user.id);
    }),
  }),

  // ============ COURIER RETURN ROUTES ============
  courierReturn: router({
    create: protectedProcedure
      .input(z.object({
        originalOrderId: z.number().optional(),
        originalProductId: z.number().optional(),
        itemName: z.string().min(1),
        itemBrand: z.string().optional(),
        itemCategory: z.enum(["tops", "bottoms", "dresses", "outerwear", "accessories", "shoes", "bags", "other"]),
        itemSize: z.string().optional(),
        itemCondition: z.enum(["like_new", "excellent", "good", "fair"]),
        itemDescription: z.string().optional(),
        image1Url: z.string().optional(),
        image2Url: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createCourierReturn({
          userId: ctx.user.id,
          ...input,
        });
        return { id, success: true };
      }),
    
    getUserReturns: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserCourierReturns(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const returnItem = await db.getCourierReturnById(input.id);
        if (!returnItem) return undefined;
        // Only allow user to see their own returns (unless admin)
        if (returnItem.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }
        return returnItem;
      }),
    
    // Admin routes
    listAll: adminProcedure.query(async () => {
      return db.getAllCourierReturns();
    }),
    
    listByStatus: adminProcedure
      .input(z.object({ status: z.string() }))
      .query(async ({ input }) => {
        return db.getCourierReturnsByStatus(input.status);
      }),
    
    approve: adminProcedure
      .input(z.object({
        id: z.number(),
        estimatedResaleValue: z.number().positive(),
      }))
      .mutation(async ({ input }) => {
        // Calculate tokens (25% of estimated resale value)
        const tokensAwarded = input.estimatedResaleValue * 0.25;
        
        await db.updateCourierReturn(input.id, {
          status: 'approved',
          estimatedResaleValue: input.estimatedResaleValue.toFixed(2),
          tokensAwarded: tokensAwarded.toFixed(2),
        });
        
        return { success: true, tokensAwarded: tokensAwarded.toFixed(2) };
      }),
    
    sendLabel: adminProcedure
      .input(z.object({
        id: z.number(),
        courierService: z.string(),
        trackingNumber: z.string(),
        shippingLabelUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCourierReturn(id, {
          ...data,
          status: 'label_sent',
        });
        return { success: true };
      }),
    
    markReceived: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateCourierReturn(input.id, { status: 'received' });
        return { success: true };
      }),
    
    completeInspection: adminProcedure
      .input(z.object({
        id: z.number(),
        inspectionNotes: z.string().optional(),
        approved: z.boolean(),
        rejectionReason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const returnItem = await db.getCourierReturnById(input.id);
        if (!returnItem) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Return not found" });
        }
        
        if (input.approved) {
          // Award tokens to user
          const tokensAwarded = parseFloat(returnItem.tokensAwarded || '0');
          if (tokensAwarded > 0) {
            const profile = await db.getOrCreateCustomerProfile(returnItem.userId);
            if (profile) {
              await db.updateTokenBalance(returnItem.userId, tokensAwarded.toFixed(2), 'add');
              
              const newBalance = parseFloat(profile.tokenBalance) + tokensAwarded;
              await db.createTokenTransaction({
                userId: returnItem.userId,
                type: 'earned_return',
                amount: tokensAwarded.toFixed(2),
                balanceAfter: newBalance.toFixed(2),
                relatedCourierReturnId: input.id,
                description: `Earned ${tokensAwarded.toFixed(2)} tokens from courier return`,
              });
            }
          }
          
          await db.updateCourierReturn(input.id, {
            status: 'inspected',
            inspectionNotes: input.inspectionNotes,
            tokensAwardedAt: new Date(),
          });
        } else {
          await db.updateCourierReturn(input.id, {
            status: 'rejected',
            inspectionNotes: input.inspectionNotes,
            rejectionReason: input.rejectionReason,
          });
        }
        
        return { success: true };
      }),
    
    listForProduct: adminProcedure
      .input(z.object({
        id: z.number(),
        productId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.updateCourierReturn(input.id, {
          status: 'listed',
          resultingProductId: input.productId,
        });
        return { success: true };
      }),
    
    complete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateCourierReturn(input.id, { status: 'completed' });
        return { success: true };
      }),
  }),

  // ============ DISCOUNT TIER ROUTES ============
  discountTier: router({
    list: publicProcedure.query(async () => {
      return db.getActiveDiscountTiers();
    }),
    
    listAll: adminProcedure.query(async () => {
      return db.getAllDiscountTiers();
    }),
    
    getForCart: protectedProcedure
      .input(z.object({ itemCount: z.number() }))
      .query(async ({ input }) => {
        return db.getDiscountTierForItemCount(input.itemCount);
      }),
    
    create: adminProcedure
      .input(z.object({
        minItems: z.number().min(1),
        maxItems: z.number().optional(),
        discountPercentage: z.number().min(0).max(100),
        bonusTokensPercentage: z.number().min(0).max(100).optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createDiscountTier({
          minItems: input.minItems,
          maxItems: input.maxItems,
          discountPercentage: input.discountPercentage.toFixed(2),
          bonusTokensPercentage: (input.bonusTokensPercentage || 0).toFixed(2),
          description: input.description,
        });
        return { id, success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        minItems: z.number().min(1).optional(),
        maxItems: z.number().optional().nullable(),
        discountPercentage: z.number().min(0).max(100).optional(),
        bonusTokensPercentage: z.number().min(0).max(100).optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = {};
        if (data.minItems !== undefined) updateData.minItems = data.minItems;
        if (data.maxItems !== undefined) updateData.maxItems = data.maxItems;
        if (data.discountPercentage !== undefined) updateData.discountPercentage = data.discountPercentage.toFixed(2);
        if (data.bonusTokensPercentage !== undefined) updateData.bonusTokensPercentage = data.bonusTokensPercentage.toFixed(2);
        if (data.description !== undefined) updateData.description = data.description;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        
        await db.updateDiscountTier(id, updateData);
        return { success: true };
      }),
  }),

  // ============ LOYALTY ANALYTICS ROUTES ============
  loyaltyAnalytics: router({
    overview: adminProcedure.query(async () => {
      return db.getLoyaltyAnalytics();
    }),
  }),

  // ============ BLOG ROUTES ============
  blog: router({
    list: publicProcedure
      .input(z.object({
        category: z.enum(["style_tips", "sustainability", "brand_spotlight", "behind_the_scenes", "community", "trends"]).optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getPublishedBlogPosts(input?.category, input?.limit);
      }),
    
    listAll: adminProcedure.query(async () => {
      return db.getAllBlogPosts();
    }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await db.getBlogPostBySlug(input.slug);
        if (post) {
          await db.incrementBlogViewCount(post.id);
        }
        return post;
      }),
    
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        excerpt: z.string().optional(),
        content: z.string().min(1),
        featuredImageUrl: z.string().optional(),
        category: z.enum(["style_tips", "sustainability", "brand_spotlight", "behind_the_scenes", "community", "trends"]),
        tags: z.string().optional(),
        authorName: z.string().optional(),
        readingTime: z.number().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createBlogPost({
          ...input,
          authorId: ctx.user.id,
          authorName: input.authorName || ctx.user.name || "Urban Refit Team",
          publishedAt: input.status === "published" ? new Date() : undefined,
        });
        return { id, success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        excerpt: z.string().optional(),
        content: z.string().min(1).optional(),
        featuredImageUrl: z.string().optional(),
        category: z.enum(["style_tips", "sustainability", "brand_spotlight", "behind_the_scenes", "community", "trends"]).optional(),
        tags: z.string().optional(),
        readingTime: z.number().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = { ...data };
        if (data.status === "published") {
          const existing = await db.getBlogPostById(id);
          if (existing && !existing.publishedAt) {
            updateData.publishedAt = new Date();
          }
        }
        await db.updateBlogPost(id, updateData);
        return { success: true };
      }),
    
    like: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementBlogLikeCount(input.id);
        return { success: true };
      }),
  }),

  // ============ CHAT/HELPDESK ROUTES ============
  chat: router({
    send: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        message: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        // Save user message
        await db.createChatMessage({
          sessionId: input.sessionId,
          userId: ctx.user?.id,
          role: "user",
          content: input.message,
        });
        
        // Get chat history for context
        const history = await db.getChatHistory(input.sessionId, 10);
        
        // Get current product inventory for context
        const inventory = await db.getProductSummaryForChat();
        const inventoryContext = inventory && inventory.length > 0
          ? `\n\nCURRENT INVENTORY (${inventory.length} items available):\n${inventory.map(p => `- ${p.name} (${p.brand || 'Unbranded'}) | Size: ${p.size || 'One Size'} | Category: ${p.category} | Price: $${p.salePrice} | Condition: ${p.condition || 'Good'}`).join('\n')}`
          : '\n\nNote: Unable to fetch current inventory. Suggest customer visits the shop page directly.';
        
        // Build messages for LLM
        const systemPrompt = `You are Refit, the professional virtual assistant for Urban Refit - a curated secondhand clothing marketplace.

IMPORTANT RULES:
- Do NOT use any emojis in your responses
- Be professional, helpful, and concise
- You handle multiple customers simultaneously, so if they want a specific item, advise them to visit the Urban Refit online store immediately and purchase it before someone else does
- Every item is one-of-a-kind since it is secondhand - once sold, it is gone forever

KEY INFORMATION:
- Urban Refit sells pre-loved, quality branded clothing from partner thrift stores
- 5% of every sale goes back to our thrift store partners
- Each item is unique (one-of-one) since it is secondhand
- Customers can return items for resale and earn tokens (25% of resale value)
- Tokens can be used for discounts or donated to charity partners
- Shipping is calculated at checkout
- We accept all major credit cards, PayPal, and Afterpay via Stripe

SIZE GUIDE:
- Sizes available: S (Small), M (Medium), L (Large), XL (Extra Large)
- For pants: Waist sizes are listed (e.g., 32, 34, 36)
- Always ask the customer for their preferred size when helping with product queries

COMMON QUESTIONS:
- Returns: Items can be returned within 14 days if unworn with tags
- Shipping: Standard shipping 5-7 business days, express 2-3 days
- Sizing: Check product descriptions for measurements
- Condition: Items are rated as Like New, Excellent, Good, or Fair
- Tokens: Earn tokens by returning items or making purchases

WHEN CUSTOMER ASKS ABOUT A PRODUCT:
1. Check the inventory list below to see if we have it or something similar
2. If exact match found, confirm availability and provide details (size, price, condition)
3. If no exact match, suggest similar items from the inventory
4. Always remind them that items sell quickly and they should purchase soon if interested
5. Direct them to the shop page: urbanrefit.store/shop

If you cannot find what they are looking for, suggest they check back regularly as new items are added weekly, or contact support@urbanrefit.com for special requests.${inventoryContext}`;

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...history.map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content: input.message },
        ];
        
        try {
          const response = await invokeLLM({ messages });
          const rawContent = response.choices[0]?.message?.content;
          const assistantMessage = typeof rawContent === 'string' ? rawContent : "I apologize, but I am experiencing technical difficulties. Please try again or email us at support@urbanrefit.com.";
          
          // Save assistant response
          await db.createChatMessage({
            sessionId: input.sessionId,
            userId: ctx.user?.id,
            role: "assistant",
            content: assistantMessage,
          });
          
          return { message: assistantMessage };
        } catch (error) {
          console.error("[Chat] LLM error:", error);
          const fallbackMessage = "I apologize for the inconvenience. I am currently unable to process your request. Please try again shortly or email us at support@urbanrefit.com for assistance.";
          
          await db.createChatMessage({
            sessionId: input.sessionId,
            userId: ctx.user?.id,
            role: "assistant",
            content: fallbackMessage,
          });
          
          return { message: fallbackMessage };
        }
      }),
    
    history: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        return db.getChatHistory(input.sessionId);
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

  // ============ REVIEW ROUTES ============
  reviews: router({
    // Get all approved reviews for display
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllApprovedReviews(input?.limit);
      }),
    
    // Get reviews for a specific product
    byProduct: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return db.getProductReviews(input.productId);
      }),
    
    // Get overall review statistics
    stats: publicProcedure.query(async () => {
      return db.getOverallReviewStats();
    }),
    
    // Get reviews by current user
    myReviews: protectedProcedure.query(async ({ ctx }) => {
      return db.getReviewsByUser(ctx.user.id);
    }),
    
    // Submit a new review
    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string().max(255).optional(),
        content: z.string().optional(),
        fitFeedback: z.enum(["runs_small", "true_to_size", "runs_large"]).optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user has purchased this product (verified purchase)
        const userOrders = await db.getUserOrders(ctx.user.id);
        const purchasedProductIds = new Set<number>();
        for (const order of userOrders) {
          if (order.status === "delivered" || order.status === "shipped") {
            const items = await db.getOrderItems(order.id);
            items.forEach(item => purchasedProductIds.add(item.orderItem.productId));
          }
        }
        const isVerifiedPurchase = purchasedProductIds.has(input.productId);
        
        const reviewId = await db.createProductReview({
          ...input,
          userId: ctx.user.id,
          isVerifiedPurchase,
          status: "approved", // Auto-approve for now, can add moderation later
        });
        
        return { id: reviewId, isVerifiedPurchase };
      }),
    
    // Mark a review as helpful
    markHelpful: publicProcedure
      .input(z.object({ reviewId: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementReviewHelpful(input.reviewId);
        return { success: true };
      }),
    
    // Admin: Get pending reviews
    pending: adminProcedure.query(async () => {
      return db.getPendingReviews();
    }),
    
    // Admin: Approve or reject a review
    moderate: adminProcedure
      .input(z.object({
        reviewId: z.number(),
        status: z.enum(["approved", "rejected"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateReviewStatus(input.reviewId, input.status);
        return { success: true };
      }),
  }),

  // ============ SELL TO US ROUTES ============
  sell: router({
    // Submit an item to sell
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        email: z.string().email().max(320),
        phone: z.string().max(20).optional(),
        brand: z.string().min(1).max(255),
        itemType: z.enum(["tops", "bottoms", "outerwear", "shoes", "accessories"]),
        itemName: z.string().min(1).max(255),
        size: z.string().min(1).max(50),
        condition: z.enum(["like_new", "excellent", "good", "fair"]),
        description: z.string().optional(),
        originalPrice: z.string().optional(),
        requestedTokens: z.number().optional(),
        image1Url: z.string().optional(),
        image2Url: z.string().optional(),
        image3Url: z.string().optional(),
        image4Url: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const submission = await db.createSellSubmission({
          ...input,
          userId: ctx.user?.id || null,
        });
        
        if (!submission) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create submission" });
        }
        
        return { id: submission.id, status: submission.status };
      }),
    
    // Get user's own submissions
    mySubmissions: protectedProcedure.query(async ({ ctx }) => {
      return db.getSellSubmissions({ userId: ctx.user.id });
    }),
    
    // Get submission by ID (for user to check status)
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const submission = await db.getSellSubmissionById(input.id);
        if (!submission) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
        }
        // Only allow viewing own submissions or admin
        if (ctx.user.role !== "admin" && submission.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }
        return submission;
      }),
    
    // Upload image for submission
    uploadImage: publicProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const key = `sell-submissions/${nanoid()}-${input.filename}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        return { url };
      }),
    
    // Admin: Get all submissions
    listAll: adminProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getSellSubmissions({ status: input?.status });
      }),
    
    // Admin: Get submission stats
    stats: adminProcedure.query(async () => {
      return db.getSellSubmissionStats();
    }),
    
    // Admin: Update submission status
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "reviewing", "offer_made", "offer_accepted", "offer_rejected", "counter_offered", "accepted", "rejected", "completed"]),
        adminNotes: z.string().optional(),
        tokenOffer: z.number().optional(),
        sendEmail: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const success = await db.updateSellSubmissionStatus(
          input.id,
          input.status,
          input.adminNotes,
          input.tokenOffer
        );
        if (!success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update status" });
        }
        
        // Send email notification when offer is made
        if (input.status === 'offer_made' && input.tokenOffer && input.sendEmail) {
          const submission = await db.getSellSubmissionById(input.id);
          if (submission) {
            try {
              const { sendSellOfferEmail } = await import('./resend');
              await sendSellOfferEmail({
                to: submission.email,
                customerName: submission.name,
                itemName: submission.itemName,
                brand: submission.brand,
                tokenOffer: input.tokenOffer,
                submissionId: input.id,
              });
            } catch (emailError) {
              console.error('[Sell] Failed to send offer email:', emailError);
            }
          }
        }
        
        // Generate shipping label when status is set to accepted
        if (input.status === 'accepted') {
          const submission = await db.getSellSubmissionById(input.id);
          if (submission) {
            try {
              const { generateShippingLabel } = await import('./shippingLabel');
              const labelResult = await generateShippingLabel({
                submissionId: input.id,
                senderName: submission.name,
                senderEmail: submission.email,
                senderPhone: submission.phone || undefined,
                itemDescription: `${submission.brand} ${submission.itemName} (${submission.size})`,
                tokenValue: submission.finalTokens || submission.tokenOffer || 0,
              });
              
              await db.updateSellSubmissionShipping(
                input.id,
                labelResult.labelUrl,
                labelResult.trackingNumber,
                labelResult.courierService
              );
              
              console.log('[Sell] Generated shipping label:', labelResult.trackingNumber);
              
              // Send acceptance email with shipping label
              const updatedSubmission = await db.getSellSubmissionById(input.id);
              const { sendSellOfferAcceptedEmail } = await import('./resend');
              await sendSellOfferAcceptedEmail({
                to: submission.email,
                customerName: submission.name,
                itemName: submission.itemName,
                brand: submission.brand,
                finalTokens: submission.finalTokens || submission.tokenOffer || 0,
                submissionId: input.id,
                shippingLabelUrl: updatedSubmission?.shippingLabelUrl || undefined,
                trackingNumber: updatedSubmission?.trackingNumber || undefined,
              });
            } catch (error) {
              console.error('[Sell] Failed to generate shipping label or send email:', error);
            }
          }
        }
        
        return { success: true };
      }),
    
    // Admin: Accept counter offer (generates shipping label automatically)
    acceptCounterOffer: adminProcedure
      .input(z.object({
        id: z.number(),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const success = await db.acceptCounterOffer(input.id, input.adminNotes);
        if (!success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to accept counter offer" });
        }
        
        // Get submission details for label generation
        const submission = await db.getSellSubmissionById(input.id);
        if (submission) {
          // Generate shipping label
          try {
            const { generateShippingLabel } = await import('./shippingLabel');
            const labelResult = await generateShippingLabel({
              submissionId: input.id,
              senderName: submission.name,
              senderEmail: submission.email,
              senderPhone: submission.phone || undefined,
              itemDescription: `${submission.brand} ${submission.itemName} (${submission.size})`,
              tokenValue: submission.counterTokenOffer || submission.tokenOffer || 0,
            });
            
            // Save shipping info to database
            await db.updateSellSubmissionShipping(
              input.id,
              labelResult.labelUrl,
              labelResult.trackingNumber,
              labelResult.courierService
            );
            
            console.log('[Sell] Generated shipping label:', labelResult.trackingNumber);
          } catch (labelError) {
            console.error('[Sell] Failed to generate shipping label:', labelError);
          }
          
          // Send acceptance email with shipping label
          try {
            const updatedSubmission = await db.getSellSubmissionById(input.id);
            const { sendSellOfferAcceptedEmail } = await import('./resend');
            await sendSellOfferAcceptedEmail({
              to: submission.email,
              customerName: submission.name,
              itemName: submission.itemName,
              brand: submission.brand,
              finalTokens: submission.counterTokenOffer || submission.tokenOffer || 0,
              submissionId: input.id,
              shippingLabelUrl: updatedSubmission?.shippingLabelUrl || undefined,
              trackingNumber: updatedSubmission?.trackingNumber || undefined,
            });
          } catch (emailError) {
            console.error('[Sell] Failed to send acceptance email:', emailError);
          }
        }
        
        return { success: true };
      }),
    
    // Customer: Respond to offer
    respondToOffer: protectedProcedure
      .input(z.object({
        id: z.number(),
        response: z.enum(["accepted", "rejected", "counter"]),
        counterTokenOffer: z.number().optional(),
        customerNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const submission = await db.getSellSubmissionById(input.id);
        if (!submission) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
        }
        if (submission.userId !== ctx.user.id && submission.email !== ctx.user.email) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }
        if (submission.status !== 'offer_made') {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No pending offer to respond to" });
        }
        
        const success = await db.respondToSellOffer(
          input.id,
          input.response,
          input.counterTokenOffer,
          input.customerNotes
        );
        if (!success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to respond to offer" });
        }
        return { success: true };
      }),
  }),

  // ============ EMAIL SUBSCRIPTION ROUTES ============
  newsletter: router({
    // Subscribe to newsletter
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email().max(320),
        name: z.string().max(255).optional(),
        source: z.enum(["newsletter", "join_page", "contact", "checkout", "footer"]).default("newsletter"),
        newArrivals: z.boolean().default(true),
        exclusiveOffers: z.boolean().default(true),
        sustainabilityNews: z.boolean().default(false),
        partnerUpdates: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        // Check if already subscribed
        const existing = await db.getEmailSubscriberByEmail(input.email);
        
        if (existing) {
          if (existing.isActive) {
            // Already subscribed and active
            return { success: true, message: "You're already subscribed!", alreadySubscribed: true };
          } else {
            // Reactivate subscription
            await db.updateEmailSubscriber(input.email, {
              isActive: true,
              unsubscribedAt: null,
              newArrivals: input.newArrivals,
              exclusiveOffers: input.exclusiveOffers,
              sustainabilityNews: input.sustainabilityNews,
              partnerUpdates: input.partnerUpdates,
            });
            
            // Re-add to Mailchimp
            const nameParts = input.name?.split(" ") || [];
            await addSubscriberToMailchimp(input.email, {
              firstName: nameParts[0],
              lastName: nameParts.slice(1).join(" ") || undefined,
              tags: [input.source],
            });
            
            return { success: true, message: "Welcome back! Your subscription has been reactivated.", reactivated: true };
          }
        }
        
        // Create new subscription
        const subscriber = await db.createEmailSubscriber(input);
        if (!subscriber) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to subscribe" });
        }
        
        // Sync to Mailchimp
        const nameParts = input.name?.split(" ") || [];
        const mailchimpResult = await addSubscriberToMailchimp(input.email, {
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(" ") || undefined,
          tags: [input.source],
        });
        
        if (!mailchimpResult.success) {
          console.warn("[Newsletter] Mailchimp sync failed:", mailchimpResult.error);
          // Don't fail the subscription if Mailchimp fails - we still have the local record
        }
        
        return { success: true, message: "Thanks for subscribing!", id: subscriber.id };
      }),
    
    // Unsubscribe from newsletter
    unsubscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await db.unsubscribeEmail(input.email);
        
        // Remove from Mailchimp
        const mailchimpResult = await removeSubscriberFromMailchimp(input.email);
        if (!mailchimpResult.success) {
          console.warn("[Newsletter] Mailchimp unsubscribe failed:", mailchimpResult.error);
        }
        
        return { success: true, message: "You have been unsubscribed." };
      }),
    
    // Check subscription status
    status: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const subscriber = await db.getEmailSubscriberByEmail(input.email);
        return {
          isSubscribed: subscriber?.isActive ?? false,
          preferences: subscriber ? {
            newArrivals: subscriber.newArrivals,
            exclusiveOffers: subscriber.exclusiveOffers,
            sustainabilityNews: subscriber.sustainabilityNews,
            partnerUpdates: subscriber.partnerUpdates,
          } : null,
        };
      }),
    
    // Update preferences
    updatePreferences: publicProcedure
      .input(z.object({
        email: z.string().email(),
        newArrivals: z.boolean().optional(),
        exclusiveOffers: z.boolean().optional(),
        sustainabilityNews: z.boolean().optional(),
        partnerUpdates: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { email, ...preferences } = input;
        await db.updateEmailSubscriber(email, preferences);
        return { success: true };
      }),
    
    // Admin: Get all subscribers
    list: adminProcedure.query(async () => {
      return db.getAllActiveSubscribers();
    }),
    
    // Admin: Get subscriber stats
    stats: adminProcedure.query(async () => {
      return db.getSubscriberStats();
    }),
  }),

  // ============ CONTACT MESSAGE ROUTES ============
  contact: router({
    // Submit a contact message from FAQ page
    submit: publicProcedure
      .input(z.object({
        email: z.string().email().max(320),
        message: z.string().min(1).max(5000),
        subscribeToNewsletter: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        // Import notification helper
        const { notifyOwner } = await import("./_core/notification");
        
        // Create the contact message
        const contactMessage = await db.createContactMessage({
          email: input.email,
          message: input.message,
          userId: ctx.user?.id || null,
          subscribedToNewsletter: input.subscribeToNewsletter,
        });
        
        if (!contactMessage) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to save message" });
        }
        
        // Notify owner about new contact message
        await notifyOwner({
          title: "New Contact Message from Urban Refit",
          content: `New message from ${input.email}:\n\n${input.message}\n\n---\nNewsletter opt-in: ${input.subscribeToNewsletter ? "Yes" : "No"}`,
        });
        
        return { 
          success: true, 
          message: "Your message has been sent! We'll get back to you soon." 
        };
      }),
    
    // Admin: Get all contact messages
    list: adminProcedure.query(async () => {
      return db.getAllContactMessages();
    }),
    
    // Admin: Get unread messages
    unread: adminProcedure.query(async () => {
      return db.getUnreadContactMessages();
    }),
    
    // Admin: Update message status
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["unread", "read", "replied", "archived"]),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const success = await db.updateContactMessageStatus(input.id, input.status, input.adminNotes);
        if (!success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update message" });
        }
        return { success: true };
      }),
    
    // Admin: Get message stats
    stats: adminProcedure.query(async () => {
      return db.getContactMessageStats();
    }),
    
    // Admin: Send reply to a contact message
    sendReply: adminProcedure
      .input(z.object({
        messageId: z.number(),
        subject: z.string().min(1).max(500),
        content: z.string().min(1).max(10000),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get the original message
        const originalMessage = await db.getContactMessageById(input.messageId);
        if (!originalMessage) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" });
        }
        
        // Send email via Resend
        const { sendContactReply } = await import("./resend");
        const emailResult = await sendContactReply(
          originalMessage.email,
          null, // We don't have customer name stored
          originalMessage.message,
          input.content
        );
        
        // Create reply record
        const reply = await db.createContactReply({
          contactMessageId: input.messageId,
          subject: input.subject,
          content: input.content,
          sentByUserId: ctx.user?.id || null,
          sentByName: ctx.user?.name || null,
          emailSent: emailResult.success,
          emailMessageId: emailResult.messageId || null,
          emailError: emailResult.error || null,
        });
        
        // Update message status to replied
        await db.updateContactMessageStatus(input.messageId, "replied");
        
        return { 
          success: true, 
          emailSent: emailResult.success,
          error: emailResult.error,
          replyId: reply?.id 
        };
      }),
    
    // Admin: Get replies for a message
    getReplies: adminProcedure
      .input(z.object({ messageId: z.number() }))
      .query(async ({ input }) => {
        return db.getContactRepliesByMessageId(input.messageId);
      }),
    
    // Admin: Get single message by ID
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getContactMessageById(input.id);
      }),
    
    // Admin: Mark all unread messages as read
    markAllAsRead: adminProcedure
      .mutation(async () => {
        const count = await db.markAllContactMessagesAsRead();
        return { success: true, count };
      }),
  }),

  // ============ NOTIFICATION ROUTES ============
  notification: router({
    // Get user's notifications
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ ctx, input }) => {
        return db.getUserNotifications(ctx.user.id, input?.limit || 20);
      }),
    
    // Get unread count
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadNotificationCount(ctx.user.id);
    }),
    
    // Mark single notification as read
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markNotificationAsRead(input.id, ctx.user.id);
        return { success: true };
      }),
    
    // Mark all notifications as read
    markAllAsRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.markAllNotificationsAsRead(ctx.user.id);
        return { success: true };
      }),
    
    // Delete a notification
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteNotification(input.id, ctx.user.id);
        return { success: true };
      }),
    
    // Admin: Create broadcast notification
    createBroadcast: adminProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        message: z.string().min(1),
        type: z.enum(["info", "success", "warning", "order", "submission", "tokens", "promo"]).default("info"),
        link: z.string().max(500).optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createBroadcastNotification(input);
        return { id, success: true };
      }),
    
    // Admin: Get all broadcast notifications
    listBroadcasts: adminProcedure.query(async () => {
      return db.getAllBroadcastNotifications();
    }),
    
    // Admin: Delete broadcast notification
    deleteBroadcast: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBroadcastNotification(input.id);
        return { success: true };
      }),
    
    // Get user's notification preferences
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      return db.getNotificationPreferences(ctx.user.id);
    }),
    
    // Update user's notification preferences
    updatePreferences: protectedProcedure
      .input(z.object({
        orderUpdates: z.boolean().optional(),
        tokenRewards: z.boolean().optional(),
        promotions: z.boolean().optional(),
        sellSubmissions: z.boolean().optional(),
        systemUpdates: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateNotificationPreferences(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // Debug endpoint to fetch all product metadata
  getAllProductMetadata: publicProcedure.query(async () => {
    return await db.getAllProductMetadata();
  }),

  // Debug endpoint to fetch all products
  getAllProductsBasic: publicProcedure.query(async () => {
    return await db.getAllProductsBasic();
  }),
});

export type AppRouter = typeof appRouter;
