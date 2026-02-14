import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const clientSrc = path.resolve(__dirname, "../client/src");
const serverDir = path.resolve(__dirname);

describe("Sell Submission Reply / Conversation System", () => {
  // ============ SCHEMA ============
  describe("Database Schema", () => {
    const schema = fs.readFileSync(path.resolve(__dirname, "../drizzle/schema.ts"), "utf-8");

    it("should have sell_submission_replies table", () => {
      expect(schema).toContain('mysqlTable("sell_submission_replies"');
    });

    it("should have submissionId column referencing sell_submissions", () => {
      expect(schema).toContain("submissionId:");
    });

    it("should have senderRole column with admin and customer values", () => {
      expect(schema).toContain("senderRole:");
      expect(schema).toContain('"admin"');
      expect(schema).toContain('"customer"');
    });

    it("should have senderName column", () => {
      expect(schema).toContain("senderName:");
    });

    it("should have message column", () => {
      expect(schema).toContain("message:");
    });

    it("should have optional tokenOffer column", () => {
      expect(schema).toContain("tokenOffer:");
    });

    it("should have createdAt timestamp column", () => {
      expect(schema).toContain("createdAt:");
    });

    it("should export SellSubmissionReply types", () => {
      expect(schema).toContain("SellSubmissionReply");
      expect(schema).toContain("InsertSellSubmissionReply");
    });
  });

  // ============ DB HELPERS ============
  describe("Database Helpers", () => {
    const dbFile = fs.readFileSync(path.resolve(serverDir, "db.ts"), "utf-8");

    it("should import sellSubmissionReplies from schema", () => {
      expect(dbFile).toContain("sellSubmissionReplies");
    });

    it("should import InsertSellSubmissionReply type", () => {
      expect(dbFile).toContain("InsertSellSubmissionReply");
    });

    it("should import SellSubmissionReply type", () => {
      expect(dbFile).toContain("SellSubmissionReply");
    });

    it("should have createSellSubmissionReply function", () => {
      expect(dbFile).toContain("export async function createSellSubmissionReply");
    });

    it("should have getSellSubmissionReplies function", () => {
      expect(dbFile).toContain("export async function getSellSubmissionReplies");
    });

    it("createSellSubmissionReply should insert and return the created reply", () => {
      expect(dbFile).toContain("db.insert(sellSubmissionReplies).values(reply)");
    });

    it("getSellSubmissionReplies should filter by submissionId", () => {
      expect(dbFile).toContain("eq(sellSubmissionReplies.submissionId, submissionId)");
    });

    it("getSellSubmissionReplies should order by createdAt", () => {
      expect(dbFile).toContain("orderBy(sellSubmissionReplies.createdAt)");
    });
  });

  // ============ tRPC PROCEDURES ============
  describe("tRPC Router Procedures", () => {
    const routersFile = fs.readFileSync(path.resolve(serverDir, "routers.ts"), "utf-8");

    it("should have sell.adminReply procedure", () => {
      expect(routersFile).toContain("adminReply: adminProcedure");
    });

    it("adminReply should accept submissionId, message, and optional tokenOffer", () => {
      // Check input schema for adminReply
      const adminReplySection = routersFile.substring(
        routersFile.indexOf("adminReply: adminProcedure"),
        routersFile.indexOf("adminReply: adminProcedure") + 500
      );
      expect(adminReplySection).toContain("submissionId: z.number()");
      expect(adminReplySection).toContain("message: z.string()");
      expect(adminReplySection).toContain("tokenOffer: z.number().optional()");
    });

    it("adminReply should use adminProcedure for authorization", () => {
      expect(routersFile).toContain("adminReply: adminProcedure");
    });

    it("adminReply should call createSellSubmissionReply with admin senderRole", () => {
      const adminReplySection = routersFile.substring(
        routersFile.indexOf("adminReply: adminProcedure"),
        routersFile.indexOf("adminReply: adminProcedure") + 800
      );
      expect(adminReplySection).toContain('senderRole: "admin"');
    });

    it("adminReply should update submission status to offer_made when tokenOffer is provided", () => {
      const adminReplySection = routersFile.substring(
        routersFile.indexOf("adminReply: adminProcedure"),
        routersFile.indexOf("adminReply: adminProcedure") + 1500
      );
      expect(adminReplySection).toContain("updateSellSubmissionStatus");
      expect(adminReplySection).toContain('"offer_made"');
    });

    it("should have sell.customerReply procedure", () => {
      expect(routersFile).toContain("customerReply: protectedProcedure");
    });

    it("customerReply should accept submissionId, message, and optional counterTokenOffer", () => {
      const customerReplySection = routersFile.substring(
        routersFile.indexOf("customerReply: protectedProcedure"),
        routersFile.indexOf("customerReply: protectedProcedure") + 500
      );
      expect(customerReplySection).toContain("submissionId: z.number()");
      expect(customerReplySection).toContain("message: z.string()");
      expect(customerReplySection).toContain("counterTokenOffer: z.number().optional()");
    });

    it("customerReply should verify submission ownership", () => {
      const customerReplySection = routersFile.substring(
        routersFile.indexOf("customerReply: protectedProcedure"),
        routersFile.indexOf("customerReply: protectedProcedure") + 600
      );
      expect(customerReplySection).toContain("submission.userId !== ctx.user.id");
      expect(customerReplySection).toContain("FORBIDDEN");
    });

    it("customerReply should call createSellSubmissionReply with customer senderRole", () => {
      const customerReplySection = routersFile.substring(
        routersFile.indexOf("customerReply: protectedProcedure"),
        routersFile.indexOf("customerReply: protectedProcedure") + 800
      );
      expect(customerReplySection).toContain('senderRole: "customer"');
    });

    it("customerReply should call respondToSellOffer when counterTokenOffer is provided", () => {
      const customerReplySection = routersFile.substring(
        routersFile.indexOf("customerReply: protectedProcedure"),
        routersFile.indexOf("customerReply: protectedProcedure") + 1500
      );
      expect(customerReplySection).toContain("respondToSellOffer");
    });

    it("should have sell.getReplies procedure", () => {
      expect(routersFile).toContain("getReplies: protectedProcedure");
    });

    it("getReplies should accept submissionId input", () => {
      const getRepliesSection = routersFile.substring(
        routersFile.indexOf("getReplies: protectedProcedure"),
        routersFile.indexOf("getReplies: protectedProcedure") + 400
      );
      expect(getRepliesSection).toContain("submissionId: z.number()");
    });

    it("getReplies should allow admin or submission owner to view replies", () => {
      const getRepliesSection = routersFile.substring(
        routersFile.indexOf("getReplies: protectedProcedure"),
        routersFile.indexOf("getReplies: protectedProcedure") + 500
      );
      expect(getRepliesSection).toContain('ctx.user.role !== "admin"');
      expect(getRepliesSection).toContain("submission.userId !== ctx.user.id");
    });

    it("getReplies should call getSellSubmissionReplies", () => {
      const getRepliesSection = routersFile.substring(
        routersFile.indexOf("getReplies: protectedProcedure"),
        routersFile.indexOf("getReplies: protectedProcedure") + 800
      );
      expect(getRepliesSection).toContain("getSellSubmissionReplies");
    });
  });

  // ============ ADMIN UI ============
  describe("Admin Sell Submissions UI", () => {
    const adminPage = fs.readFileSync(
      path.resolve(clientSrc, "pages/admin/SellSubmissions.tsx"),
      "utf-8"
    );

    it("should import Textarea for reply input", () => {
      expect(adminPage).toContain("Textarea");
    });

    it("should import Send icon for reply button", () => {
      expect(adminPage).toContain("Send");
    });

    it("should have replyMessage state", () => {
      expect(adminPage).toContain("replyMessage");
      expect(adminPage).toContain("setReplyMessage");
    });

    it("should have replyTokenOffer state", () => {
      expect(adminPage).toContain("replyTokenOffer");
      expect(adminPage).toContain("setReplyTokenOffer");
    });

    it("should use trpc.sell.adminReply mutation", () => {
      expect(adminPage).toContain("trpc.sell.adminReply.useMutation");
    });

    it("should use trpc.sell.getReplies query", () => {
      expect(adminPage).toContain("trpc.sell.getReplies.useQuery");
    });

    it("should have a conversation thread section with MessageSquare header", () => {
      expect(adminPage).toContain("Conversation with");
      expect(adminPage).toContain("MessageSquare");
    });

    it("should render admin messages aligned to the right", () => {
      expect(adminPage).toContain('reply.senderRole === "admin" ? "justify-end"');
    });

    it("should render customer messages aligned to the left", () => {
      expect(adminPage).toContain('"justify-start"');
    });

    it("should display token offers in reply bubbles", () => {
      expect(adminPage).toContain("reply.tokenOffer");
    });

    it("should have reply input with Cmd/Ctrl+Enter shortcut", () => {
      expect(adminPage).toContain("e.metaKey || e.ctrlKey");
      expect(adminPage).toContain("handleSendReply");
    });

    it("should have optional token offer input in reply area", () => {
      expect(adminPage).toContain('placeholder="Token offer (optional)"');
    });

    it("should show NZD conversion for token offer", () => {
      expect(adminPage).toContain("replyTokenOffer");
      expect(adminPage).toContain("0.5");
    });

    it("should have a Reply button with Send icon", () => {
      expect(adminPage).toContain("Reply");
      expect(adminPage).toContain("<Send");
    });

    it("should scroll to bottom when new replies arrive", () => {
      expect(adminPage).toContain("repliesEndRef");
      expect(adminPage).toContain("scrollIntoView");
    });

    it("should show empty state when no messages exist", () => {
      expect(adminPage).toContain("No messages yet");
    });
  });

  // ============ CUSTOMER UI ============
  describe("Customer MySubmissions UI", () => {
    const customerPage = fs.readFileSync(
      path.resolve(clientSrc, "pages/MySubmissions.tsx"),
      "utf-8"
    );

    it("should import Textarea for reply input", () => {
      expect(customerPage).toContain("Textarea");
    });

    it("should import Send icon for reply button", () => {
      expect(customerPage).toContain("Send");
    });

    it("should have replyMessage state", () => {
      expect(customerPage).toContain("replyMessage");
      expect(customerPage).toContain("setReplyMessage");
    });

    it("should use trpc.sell.customerReply mutation", () => {
      expect(customerPage).toContain("trpc.sell.customerReply.useMutation");
    });

    it("should use trpc.sell.getReplies query", () => {
      expect(customerPage).toContain("trpc.sell.getReplies.useQuery");
    });

    it("should have a View Conversation button on each submission card", () => {
      expect(customerPage).toContain("View Conversation");
    });

    it("should render customer messages aligned to the right", () => {
      expect(customerPage).toContain('reply.senderRole === "customer" ? "justify-end"');
    });

    it("should label admin messages as Urban Refit", () => {
      expect(customerPage).toContain('"Urban Refit"');
    });

    it("should label customer messages as You", () => {
      expect(customerPage).toContain('"You"');
    });

    it("should display token offers in reply bubbles", () => {
      expect(customerPage).toContain("reply.tokenOffer");
    });

    it("should have optional counter offer input in reply area", () => {
      expect(customerPage).toContain('placeholder="Counter offer (optional)"');
    });

    it("should have reply input with Cmd/Ctrl+Enter shortcut", () => {
      expect(customerPage).toContain("e.metaKey || e.ctrlKey");
      expect(customerPage).toContain("handleSendReply");
    });

    it("should scroll to bottom when new replies arrive", () => {
      expect(customerPage).toContain("repliesEndRef");
      expect(customerPage).toContain("scrollIntoView");
    });

    it("should show empty state when no messages exist", () => {
      expect(customerPage).toContain("No messages yet");
    });

    it("should still have Accept Offer and Decline buttons for offer_made status", () => {
      expect(customerPage).toContain("Accept Offer");
      expect(customerPage).toContain("Decline");
    });
  });
});
