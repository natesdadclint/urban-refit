import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";

describe("Admin Sell Submissions Management", () => {
  let adminCaller: any;
  let testSubmissionId: number;

  beforeAll(async () => {
    // Create admin caller with admin context
    adminCaller = appRouter.createCaller({
      user: {
        id: 1,
        email: "admin@test.com",
        name: "Admin User",
        role: "admin",
        openId: "admin-open-id",
      },
      req: {} as any,
      res: {} as any,
    });
  });

  it("should list all sell submissions for admin", async () => {
    const submissions = await adminCaller.sell.listAll();
    expect(Array.isArray(submissions)).toBe(true);
  });

  it("should get sell submission stats", async () => {
    const stats = await adminCaller.sell.stats();
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("pending");
    expect(stats).toHaveProperty("reviewing");
    expect(stats).toHaveProperty("accepted");
    expect(stats).toHaveProperty("rejected");
    expect(typeof stats.total).toBe("number");
  });

  it("should filter submissions by status", async () => {
    const pendingSubmissions = await adminCaller.sell.listAll({
      status: "pending",
    });
    expect(Array.isArray(pendingSubmissions)).toBe(true);
    // All should have pending status
    pendingSubmissions.forEach((sub: any) => {
      expect(sub.status).toBe("pending");
    });
  });

  it("should update submission status with offer", async () => {
    // First get a submission to update
    const submissions = await adminCaller.sell.listAll();
    if (submissions.length > 0) {
      const testSub = submissions[0];
      testSubmissionId = testSub.id;

      const result = await adminCaller.sell.updateStatus({
        id: testSubmissionId,
        status: "reviewing",
        offerAmount: "50.00",
        adminNotes: "Good condition, fair price",
      });

      expect(result.success).toBe(true);

      // Verify the update
      const updated = await adminCaller.sell.getById({ id: testSubmissionId });
      expect(updated.status).toBe("reviewing");
      expect(updated.offerAmount).toBe("50.00");
    }
  });

  it("should accept a submission", async () => {
    if (testSubmissionId) {
      const result = await adminCaller.sell.updateStatus({
        id: testSubmissionId,
        status: "accepted",
        offerAmount: "50.00",
      });

      expect(result.success).toBe(true);

      const updated = await adminCaller.sell.getById({ id: testSubmissionId });
      expect(updated.status).toBe("accepted");
    }
  });

  it("should reject a submission", async () => {
    const submissions = await adminCaller.sell.listAll();
    if (submissions.length > 1) {
      const testSub = submissions[1];

      const result = await adminCaller.sell.updateStatus({
        id: testSub.id,
        status: "rejected",
        adminNotes: "Item not in acceptable condition",
      });

      expect(result.success).toBe(true);

      const updated = await adminCaller.sell.getById({ id: testSub.id });
      expect(updated.status).toBe("rejected");
    }
  });

  it("should mark submission as completed", async () => {
    if (testSubmissionId) {
      const result = await adminCaller.sell.updateStatus({
        id: testSubmissionId,
        status: "completed",
        adminNotes: "Payment sent to customer",
      });

      expect(result.success).toBe(true);

      const updated = await adminCaller.sell.getById({ id: testSubmissionId });
      expect(updated.status).toBe("completed");
    }
  });
});
