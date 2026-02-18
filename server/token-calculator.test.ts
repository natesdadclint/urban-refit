import { describe, it, expect } from "vitest";

const TOKEN_RATE = 1.00;

function tokensToNzd(tokens: number): number {
  return parseFloat((tokens * TOKEN_RATE).toFixed(2));
}

function nzdToTokens(nzd: number): number {
  return parseFloat((nzd / TOKEN_RATE).toFixed(2));
}

describe("Token Calculator", () => {
  describe("Tokens to NZD conversion", () => {
    it("converts 1 token to NZ$1.00", () => {
      expect(tokensToNzd(1)).toBe(1.00);
    });

    it("converts 10 tokens to NZ$10.00", () => {
      expect(tokensToNzd(10)).toBe(10.00);
    });

    it("converts 25 tokens to NZ$25.00", () => {
      expect(tokensToNzd(25)).toBe(25.00);
    });

    it("converts 50 tokens to NZ$50.00", () => {
      expect(tokensToNzd(50)).toBe(50.00);
    });

    it("converts 100 tokens to NZ$100.00", () => {
      expect(tokensToNzd(100)).toBe(100.00);
    });

    it("converts 0 tokens to NZ$0.00", () => {
      expect(tokensToNzd(0)).toBe(0);
    });
  });

  describe("NZD to Tokens conversion", () => {
    it("converts NZ$1.00 to 1 token", () => {
      expect(nzdToTokens(1.00)).toBe(1);
    });

    it("converts NZ$10.00 to 10 tokens", () => {
      expect(nzdToTokens(10.00)).toBe(10);
    });

    it("converts NZ$25.00 to 25 tokens", () => {
      expect(nzdToTokens(25.00)).toBe(25);
    });

    it("converts NZ$50.00 to 50 tokens", () => {
      expect(nzdToTokens(50.00)).toBe(50);
    });

    it("converts NZ$100.00 to 100 tokens", () => {
      expect(nzdToTokens(100.00)).toBe(100);
    });

    it("converts NZ$0.00 to 0 tokens", () => {
      expect(nzdToTokens(0)).toBe(0);
    });
  });

  describe("Bidirectional consistency", () => {
    it("round-trips tokens -> NZD -> tokens", () => {
      const original = 42;
      const nzd = tokensToNzd(original);
      const backToTokens = nzdToTokens(nzd);
      expect(backToTokens).toBe(original);
    });

    it("round-trips NZD -> tokens -> NZD", () => {
      const original = 17.50;
      const tokens = nzdToTokens(original);
      const backToNzd = tokensToNzd(tokens);
      expect(backToNzd).toBe(original);
    });
  });

  describe("Quick reference amounts", () => {
    it("all quick reference amounts produce correct NZD values", () => {
      expect(tokensToNzd(10)).toBe(10.00);
      expect(tokensToNzd(25)).toBe(25.00);
      expect(tokensToNzd(50)).toBe(50.00);
      expect(tokensToNzd(100)).toBe(100.00);
    });
  });
});
