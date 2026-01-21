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
