import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock database functions
vi.mock("./db", () => ({
  updateSellSubmissionStatus: vi.fn(),
  respondToSellOffer: vi.fn(),
  acceptCounterOffer: vi.fn(),
  getSellSubmissionById: vi.fn(),
  getSellSubmissions: vi.fn(),
}));

// Mock resend functions
vi.mock("./resend", () => ({
  sendSellOfferEmail: vi.fn().mockResolvedValue({ success: true }),
  sendSellOfferAcceptedEmail: vi.fn().mockResolvedValue({ success: true }),
  sendSellRejectionEmail: vi.fn().mockResolvedValue({ success: true }),
}));

import * as db from "./db";
import * as resend from "./resend";

describe("Sell Submission Offer Workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateSellSubmissionStatus", () => {
    it("should update status and set offer fields when making an offer", async () => {
      const mockUpdate = vi.mocked(db.updateSellSubmissionStatus);
      mockUpdate.mockResolvedValue(true);

      const result = await db.updateSellSubmissionStatus(1, "offer_made", "Good condition item", "45.00");
      
      expect(mockUpdate).toHaveBeenCalledWith(1, "offer_made", "Good condition item", "45.00");
      expect(result).toBe(true);
    });

    it("should return false when update fails", async () => {
      const mockUpdate = vi.mocked(db.updateSellSubmissionStatus);
      mockUpdate.mockResolvedValue(false);

      const result = await db.updateSellSubmissionStatus(1, "offer_made", undefined, "45.00");
      
      expect(result).toBe(false);
    });
  });

  describe("respondToSellOffer", () => {
    it("should accept an offer and set final amount", async () => {
      const mockRespond = vi.mocked(db.respondToSellOffer);
      mockRespond.mockResolvedValue(true);

      const result = await db.respondToSellOffer(1, "accepted");
      
      expect(mockRespond).toHaveBeenCalledWith(1, "accepted");
      expect(result).toBe(true);
    });

    it("should reject an offer", async () => {
      const mockRespond = vi.mocked(db.respondToSellOffer);
      mockRespond.mockResolvedValue(true);

      const result = await db.respondToSellOffer(1, "rejected", undefined, "Price too low");
      
      expect(mockRespond).toHaveBeenCalledWith(1, "rejected", undefined, "Price too low");
      expect(result).toBe(true);
    });

    it("should submit a counter offer", async () => {
      const mockRespond = vi.mocked(db.respondToSellOffer);
      mockRespond.mockResolvedValue(true);

      const result = await db.respondToSellOffer(1, "counter", "55.00", "I think it's worth more");
      
      expect(mockRespond).toHaveBeenCalledWith(1, "counter", "55.00", "I think it's worth more");
      expect(result).toBe(true);
    });
  });

  describe("acceptCounterOffer", () => {
    it("should accept a counter offer and set final amount", async () => {
      const mockAccept = vi.mocked(db.acceptCounterOffer);
      mockAccept.mockResolvedValue(true);

      const result = await db.acceptCounterOffer(1, "Customer has good history");
      
      expect(mockAccept).toHaveBeenCalledWith(1, "Customer has good history");
      expect(result).toBe(true);
    });
  });

  describe("Email Notifications", () => {
    it("should send offer email to customer", async () => {
      const mockSendEmail = vi.mocked(resend.sendSellOfferEmail);
      
      await resend.sendSellOfferEmail({
        to: "customer@example.com",
        customerName: "John Doe",
        itemName: "Vintage Jacket",
        brand: "Levi's",
        offerAmount: "45.00",
        submissionId: 1,
      });
      
      expect(mockSendEmail).toHaveBeenCalledWith({
        to: "customer@example.com",
        customerName: "John Doe",
        itemName: "Vintage Jacket",
        brand: "Levi's",
        offerAmount: "45.00",
        submissionId: 1,
      });
    });

    it("should send acceptance email when counter offer is accepted", async () => {
      const mockSendEmail = vi.mocked(resend.sendSellOfferAcceptedEmail);
      
      await resend.sendSellOfferAcceptedEmail({
        to: "customer@example.com",
        customerName: "John Doe",
        itemName: "Vintage Jacket",
        brand: "Levi's",
        finalAmount: "55.00",
        submissionId: 1,
      });
      
      expect(mockSendEmail).toHaveBeenCalledWith({
        to: "customer@example.com",
        customerName: "John Doe",
        itemName: "Vintage Jacket",
        brand: "Levi's",
        finalAmount: "55.00",
        submissionId: 1,
      });
    });

    it("should send rejection email when submission is rejected", async () => {
      const mockSendEmail = vi.mocked(resend.sendSellRejectionEmail);
      
      await resend.sendSellRejectionEmail({
        to: "customer@example.com",
        customerName: "John Doe",
        itemName: "Old T-Shirt",
        brand: "Generic",
        reason: "Item condition does not meet our standards",
        submissionId: 2,
      });
      
      expect(mockSendEmail).toHaveBeenCalledWith({
        to: "customer@example.com",
        customerName: "John Doe",
        itemName: "Old T-Shirt",
        brand: "Generic",
        reason: "Item condition does not meet our standards",
        submissionId: 2,
      });
    });
  });

  describe("Submission Status Flow", () => {
    it("should follow correct status flow: pending -> reviewing -> offer_made", async () => {
      const mockUpdate = vi.mocked(db.updateSellSubmissionStatus);
      mockUpdate.mockResolvedValue(true);

      // Step 1: Move to reviewing
      await db.updateSellSubmissionStatus(1, "reviewing");
      expect(mockUpdate).toHaveBeenLastCalledWith(1, "reviewing");

      // Step 2: Make offer
      await db.updateSellSubmissionStatus(1, "offer_made", undefined, "45.00");
      expect(mockUpdate).toHaveBeenLastCalledWith(1, "offer_made", undefined, "45.00");
    });

    it("should handle offer_made -> offer_accepted flow", async () => {
      const mockRespond = vi.mocked(db.respondToSellOffer);
      mockRespond.mockResolvedValue(true);

      await db.respondToSellOffer(1, "accepted");
      expect(mockRespond).toHaveBeenCalledWith(1, "accepted");
    });

    it("should handle offer_made -> counter_offered -> accepted flow", async () => {
      const mockRespond = vi.mocked(db.respondToSellOffer);
      const mockAccept = vi.mocked(db.acceptCounterOffer);
      mockRespond.mockResolvedValue(true);
      mockAccept.mockResolvedValue(true);

      // Customer counters
      await db.respondToSellOffer(1, "counter", "55.00");
      expect(mockRespond).toHaveBeenCalledWith(1, "counter", "55.00");

      // Admin accepts counter
      await db.acceptCounterOffer(1);
      expect(mockAccept).toHaveBeenCalledWith(1);
    });
  });

  describe("getSellSubmissionById", () => {
    it("should return submission with all offer fields", async () => {
      const mockSubmission = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        itemName: "Vintage Jacket",
        brand: "Levi's",
        status: "offer_made",
        offerAmount: "45.00",
        customerResponse: "pending",
        counterOfferAmount: null,
        customerNotes: null,
        finalAmount: null,
        offerSentAt: new Date(),
        customerRespondedAt: null,
      };

      const mockGet = vi.mocked(db.getSellSubmissionById);
      mockGet.mockResolvedValue(mockSubmission as any);

      const result = await db.getSellSubmissionById(1);
      
      expect(result).toEqual(mockSubmission);
      expect(result?.status).toBe("offer_made");
      expect(result?.offerAmount).toBe("45.00");
    });
  });

  describe("getSellSubmissions", () => {
    it("should filter submissions by user ID", async () => {
      const mockSubmissions = [
        { id: 1, userId: 123, status: "pending" },
        { id: 2, userId: 123, status: "offer_made" },
      ];

      const mockGet = vi.mocked(db.getSellSubmissions);
      mockGet.mockResolvedValue(mockSubmissions as any);

      const result = await db.getSellSubmissions({ userId: 123 });
      
      expect(mockGet).toHaveBeenCalledWith({ userId: 123 });
      expect(result).toHaveLength(2);
    });
  });
});
