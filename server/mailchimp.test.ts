import { describe, it, expect } from "vitest";
import { verifyMailchimpConnection } from "./mailchimp";

describe("Mailchimp Integration", () => {
  it("should verify Mailchimp API connection with valid credentials", async () => {
    const result = await verifyMailchimpConnection();
    
    // Check that we can connect to Mailchimp
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    
    // Verify we get audience info back
    if (result.success && result.data) {
      const data = result.data as { listName: string; memberCount: number };
      expect(data.listName).toBeDefined();
      expect(typeof data.memberCount).toBe("number");
      console.log(`[Mailchimp Test] Connected to audience: ${data.listName} (${data.memberCount} members)`);
    }
  });
});
