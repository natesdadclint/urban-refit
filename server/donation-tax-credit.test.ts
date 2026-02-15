import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const charitiesPage = readFileSync(
  resolve(__dirname, "../client/src/pages/Charities.tsx"),
  "utf-8"
);

const profilePage = readFileSync(
  resolve(__dirname, "../client/src/pages/Profile.tsx"),
  "utf-8"
);

describe("Donation Tax Credit Feature", () => {
  describe("Charities Page - Tax Credit Preview", () => {
    it("shows 33% tax credit rebate info in the donation dialog", () => {
      expect(charitiesPage).toContain("Tax Credit Rebate (33%)");
    });

    it("calculates donation value at $0.50 per token", () => {
      expect(charitiesPage).toContain("parseFloat(donationAmount) * 0.50");
    });

    it("calculates 33% tax credit on the dollar value", () => {
      expect(charitiesPage).toContain("parseFloat(donationAmount) * 0.50 * 0.33");
    });

    it("mentions NZ tax law in the dialog", () => {
      expect(charitiesPage).toContain("Under NZ tax law");
    });

    it("mentions donation receipt for tax return", () => {
      expect(charitiesPage).toContain("donation receipt for your tax return");
    });

    it("conditionally renders tax credit preview when amount is entered", () => {
      expect(charitiesPage).toContain("donationAmount && parseFloat(donationAmount) > 0");
    });

    it("shows Donation Value and Your Tax Credit labels", () => {
      expect(charitiesPage).toContain("Donation Value");
      expect(charitiesPage).toContain("Your Tax Credit");
    });
  });

  describe("Charities Page - Donation History with Tax Credits", () => {
    it("shows tax credit amount in donation history items", () => {
      expect(charitiesPage).toContain("Tax credit: NZ$");
    });

    it("calculates 33% tax credit on dollar value in history", () => {
      expect(charitiesPage).toContain("parseFloat(item.donation.dollarValue) * 0.33");
    });

    it("displays dollar values with NZ$ prefix in history", () => {
      expect(charitiesPage).toContain('NZ${parseFloat(item.donation.dollarValue)');
    });
  });

  describe("Charities Page - Info Section", () => {
    it("has a 33% Tax Credit Rebate info section", () => {
      expect(charitiesPage).toContain("33% Tax Credit Rebate");
    });

    it("mentions NZ$5 minimum for tax credit eligibility", () => {
      expect(charitiesPage).toContain("donations of NZ$5 or more");
    });

    it("mentions NZ$33.33 back per NZ$100 donated", () => {
      expect(charitiesPage).toContain("NZ$33.33 back on your tax return");
    });

    it("mentions IRD donation receipts", () => {
      expect(charitiesPage).toContain("donation receipts");
    });

    it("imports Sparkles icon for tax credit indicators", () => {
      expect(charitiesPage).toContain("Sparkles");
    });
  });

  describe("Profile Page - Donations Tab", () => {
    it("has a Donations tab trigger", () => {
      expect(profilePage).toContain('value="donations"');
      expect(profilePage).toContain("Donations</TabsTrigger>");
    });

    it("shows Total Donated summary card", () => {
      expect(profilePage).toContain("Total Donated");
    });

    it("shows Tax Credits Earned summary card", () => {
      expect(profilePage).toContain("Tax Credits Earned");
    });

    it("shows Tokens Donated summary card", () => {
      expect(profilePage).toContain("Tokens Donated");
    });

    it("calculates total donated from charityDonations data", () => {
      expect(profilePage).toContain("charityDonations.reduce");
      expect(profilePage).toContain("parseFloat(d.donation.dollarValue)");
    });

    it("calculates 33% tax credit on total donations", () => {
      expect(profilePage).toContain("* 0.33");
    });

    it("has a tax credit info banner in the donations tab", () => {
      expect(profilePage).toContain("33% Tax Credit Rebate");
    });

    it("mentions IRD tax return in the info banner", () => {
      expect(profilePage).toContain("IRD tax return");
    });

    it("shows donation history with charity name and date", () => {
      expect(profilePage).toContain("item.charity.name");
      expect(profilePage).toContain("item.donation.createdAt");
    });

    it("shows tax credit per donation in history", () => {
      expect(profilePage).toContain("Tax credit: NZ$");
    });

    it("has a Donate Now button linking to charities page", () => {
      expect(profilePage).toContain('href="/charities"');
      expect(profilePage).toContain("Donate Now");
    });

    it("shows empty state with 33% tax credit mention", () => {
      expect(profilePage).toContain("Donate your tokens to charity and earn a 33% tax credit rebate");
    });

    it("shows Browse Charities button in empty state", () => {
      expect(profilePage).toContain("Browse Charities");
    });

    it("fetches charityDonations data from tRPC", () => {
      expect(profilePage).toContain("trpc.charity.getUserDonations.useQuery");
    });
  });

  describe("Tax Credit Calculation Accuracy", () => {
    it("uses 0.33 multiplier consistently for 33% tax credit", () => {
      // Charities page
      const charitiesTaxCalcs = charitiesPage.match(/\* 0\.33/g) || [];
      expect(charitiesTaxCalcs.length).toBeGreaterThanOrEqual(2);

      // Profile page
      const profileTaxCalcs = profilePage.match(/\* 0\.33/g) || [];
      expect(profileTaxCalcs.length).toBeGreaterThanOrEqual(2);
    });

    it("uses NZD currency format consistently", () => {
      expect(charitiesPage).toContain("NZ$");
      expect(profilePage).toContain("NZ$");
    });
  });
});
