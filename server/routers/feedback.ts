import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { siteFeedback } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const feedbackRouter = router({
  /**
   * Submit feedback (public - can be anonymous)
   */
  submit: publicProcedure
    .input(
      z.object({
        type: z.enum(["bug", "feature", "general", "compliment", "complaint"]),
        category: z.string().max(100).optional(),
        subject: z.string().min(1).max(255),
        message: z.string().min(1),
        email: z.string().email().max(255).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      // Get current page from request headers (if available)
      const referer = ctx.req.headers.referer || ctx.req.headers.origin || "";
      const userAgent = ctx.req.headers["user-agent"] || "";

      const [feedback] = await db.insert(siteFeedback).values({
        userId: ctx.user?.id,
        type: input.type,
        category: input.category,
        subject: input.subject,
        message: input.message,
        email: input.email || ctx.user?.email,
        page: referer,
        userAgent,
        status: "new",
      });

      return { success: true, feedbackId: feedback.insertId };
    }),

  /**
   * Get all feedback (admin only)
   */
  getAll: protectedProcedure
    .input(
      z.object({
        status: z.enum(["new", "reviewing", "resolved", "closed"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      let query = db.select().from(siteFeedback);
      
      if (input.status) {
        query = query.where(eq(siteFeedback.status, input.status)) as any;
      }
      
      const feedback = await query
        .orderBy(desc(siteFeedback.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return feedback;
    }),

  /**
   * Update feedback status (admin only)
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "reviewing", "resolved", "closed"]),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      await db
        .update(siteFeedback)
        .set({
          status: input.status,
          adminNotes: input.adminNotes,
        })
        .where(eq(siteFeedback.id, input.id));

      return { success: true };
    }),

  /**
   * Get my feedback (for logged-in users)
   */
  myFeedback: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    
    const feedback = await db
      .select()
      .from(siteFeedback)
      .where(eq(siteFeedback.userId, ctx.user.id))
      .orderBy(desc(siteFeedback.createdAt));

    return feedback;
  }),
});
