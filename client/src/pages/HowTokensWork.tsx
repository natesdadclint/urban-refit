import { useState } from "react";
import Layout from "@/components/Layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";
import {
  ArrowLeft,
  Coins,
  Gift,
  ShoppingBag,
  Heart,
  Recycle,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Package,
  Sparkles
} from "lucide-react";

const TOKEN_RATE = 1.00;

export default function HowTokensWork() {
  const [tokenInput, setTokenInput] = useState("");
  const [nzdInput, setNzdInput] = useState("");
  const [activeField, setActiveField] = useState<"token" | "nzd">("token");

  const handleTokenChange = (val: string) => {
    setTokenInput(val);
    setActiveField("token");
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setNzdInput((num * TOKEN_RATE).toFixed(2));
    } else {
      setNzdInput("");
    }
  };

  const handleNzdChange = (val: string) => {
    setNzdInput(val);
    setActiveField("nzd");
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setTokenInput((num / TOKEN_RATE).toFixed(2));
    } else {
      setTokenInput("");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <PageHeader
          title="How Tokens Work"
          subtitle="Urban Refit tokens are at the heart of our circular economy. Earn tokens by participating in sustainable fashion, then use them to save on future purchases or support charities you care about."
        >
          <Link href="/" className="inline-flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-medium text-foreground hover:text-primary transition-colors mb-4 sm:mb-6 py-1.5 sm:py-2 px-2 sm:px-3 -ml-2 sm:-ml-3 rounded-lg hover:bg-accent/20">
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Back to Home
          </Link>
        </PageHeader>

        {/* Token Value */}
        <div className="container max-w-4xl py-8 sm:py-12">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 sm:p-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">Token Value</p>
            <p className="text-3xl sm:text-4xl font-bold text-primary mb-2">1 Token = NZ$1.00</p>
            <p className="text-sm text-muted-foreground">Use tokens as real money towards your next purchase or charity donation</p>
          </div>
        </div>

        {/* Token Calculator Widget */}
        <div className="container max-w-4xl py-8 sm:py-12">
          <Card className="border-2 border-primary/20 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-primary/5 px-6 py-4 sm:px-8 sm:py-5 border-b border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-foreground">Token Calculator</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">See exactly what your tokens are worth</p>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <div className="grid sm:grid-cols-2 gap-6 items-center">
                  {/* Tokens Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tokens</label>
                    <div className="relative">
                      <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Enter token amount"
                        value={tokenInput}
                        onChange={(e) => handleTokenChange(e.target.value)}
                        onFocus={() => setActiveField("token")}
                        className="pl-10 text-lg h-12"
                      />
                    </div>
                  </div>

                  {/* NZD Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">NZ Dollars</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">NZ$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter NZD amount"
                        value={nzdInput}
                        onChange={(e) => handleNzdChange(e.target.value)}
                        onFocus={() => setActiveField("nzd")}
                        className="pl-12 text-lg h-12"
                      />
                    </div>
                  </div>
                </div>

                {/* Result Summary */}
                {(tokenInput || nzdInput) && (
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      {activeField === "token" ? "Your tokens are worth" : "You would need"}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">
                      {activeField === "token"
                        ? `NZ$${nzdInput || "0.00"}`
                        : `${tokenInput || "0"} tokens`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">at the rate of 1 token = NZ$1.00</p>
                  </div>
                )}

                {/* Quick Reference */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[10, 25, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleTokenChange(amount.toString())}
                      className="p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-center"
                    >
                      <p className="text-sm font-semibold text-foreground">{amount} tokens</p>
                      <p className="text-xs text-muted-foreground">= NZ${(amount * TOKEN_RATE).toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* The Circular Economy Model */}
        <div className="container max-w-4xl py-8 sm:py-12">
          <SectionHeader 
            title="The Circular Economy" 
            subtitle="Our token system keeps value circulating within our community, reducing waste and supporting sustainable fashion."
            centered 
          />
          
          {/* Circular Flow Diagram */}
          <div className="relative py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Step 1: Shop */}
              <Card className="border-2 border-primary/20 bg-card">
                <CardContent className="p-5 sm:p-6 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">1. Shop</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Buy quality pre-loved clothing at great prices
                  </p>
                </CardContent>
              </Card>

              {/* Step 2: Earn */}
              <Card className="border-2 border-primary/20 bg-card">
                <CardContent className="p-5 sm:p-6 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Coins className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">2. Earn Tokens</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Sell back items you no longer wear for tokens
                  </p>
                </CardContent>
              </Card>

              {/* Step 3: Redeem */}
              <Card className="border-2 border-primary/20 bg-card">
                <CardContent className="p-5 sm:p-6 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Recycle className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">3. Redeem or Give</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Use tokens for discounts or donate to charity
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Connecting arrows for desktop */}
            <div className="hidden sm:flex absolute top-1/2 left-[33%] -translate-y-1/2 -translate-x-1/2">
              <ArrowRight className="w-6 h-6 text-primary/40" />
            </div>
            <div className="hidden sm:flex absolute top-1/2 left-[67%] -translate-y-1/2 -translate-x-1/2">
              <ArrowRight className="w-6 h-6 text-primary/40" />
            </div>
          </div>
        </div>

        {/* Ways to Earn Tokens */}
        <div className="bg-secondary/30 py-12 sm:py-16">
          <div className="container max-w-4xl">
            <SectionHeader 
              title="Ways to Earn Tokens" 
              subtitle="Multiple ways to build your token balance"
              centered 
            />

            <div className="grid gap-4 sm:gap-6 mt-8">
              {/* Weekly Login Reward */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="bg-primary/10 p-6 sm:p-8 flex items-center justify-center sm:w-32">
                      <Calendar className="w-10 h-10 text-primary" />
                    </div>
                    <div className="p-5 sm:p-6 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base sm:text-lg">Weekly Login Reward</h3>
                        <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-0.5 rounded-full">Easy</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Simply log in once a week to earn free tokens. It's our way of saying thanks for being part of the community.
                      </p>
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <Coins className="w-4 h-4" />
                        <span>+1 token per week</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sell Your Clothes */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="bg-primary/10 p-6 sm:p-8 flex items-center justify-center sm:w-32">
                      <Package className="w-10 h-10 text-primary" />
                    </div>
                    <div className="p-5 sm:p-6 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base sm:text-lg">Sell Your Clothes</h3>
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">Best Value</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Have quality items you no longer wear? Submit them through our Sell page. We'll review and make you a token offer based on brand, condition, and demand.
                      </p>
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <Coins className="w-4 h-4" />
                        <span>Varies by item (typically 10-100+ tokens)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Rewards */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="bg-primary/10 p-6 sm:p-8 flex items-center justify-center sm:w-32">
                      <Sparkles className="w-10 h-10 text-primary" />
                    </div>
                    <div className="p-5 sm:p-6 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base sm:text-lg">Purchase Rewards</h3>
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">Automatic</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Every purchase earns you tokens back. The more you shop sustainably, the more you save on future orders.
                      </p>
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <Coins className="w-4 h-4" />
                        <span>Earn back on every order</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Ways to Spend Tokens */}
        <div className="container max-w-4xl py-12 sm:py-16">
          <SectionHeader 
            title="Ways to Spend Tokens" 
            subtitle="Your tokens, your choice"
            centered 
          />

          <div className="grid sm:grid-cols-2 gap-6 mt-8">
            {/* Discount on Purchases */}
            <Card className="border-2 hover:border-primary/40 transition-colors">
              <CardContent className="p-6 sm:p-8">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Gift className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Save on Purchases</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Apply your tokens at checkout to reduce your order total. Each token is worth NZ$1.00 off your purchase.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Use any amount of tokens</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Combine with other discounts</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>No minimum purchase required</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Donate to Charity */}
            <Card className="border-2 hover:border-primary/40 transition-colors">
              <CardContent className="p-6 sm:p-8">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Donate to Charity</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Convert your tokens into donations for our partner charities. Make a difference while cleaning out your wardrobe.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Choose from multiple charities</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>100% of tokens go to charity</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Track your giving impact</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border-y border-amber-200 dark:border-amber-800 py-8 sm:py-10">
          <div className="container max-w-4xl">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base mb-2 text-amber-800 dark:text-amber-200">Important: Tokens Are Not Cash</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Urban Refit tokens are part of our closed-loop ecosystem. They cannot be exchanged for cash or transferred outside our platform. 
                  This keeps value circulating within our sustainable fashion community, supporting both you and our charitable partners.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="container max-w-4xl py-12 sm:py-16">
          <SectionHeader title="Frequently Asked Questions" centered />

          <div className="space-y-4 mt-8">
            <Card>
              <CardContent className="p-5 sm:p-6">
                <h3 className="font-semibold mb-2">Do tokens expire?</h3>
                <p className="text-sm text-muted-foreground">
                  No, your tokens never expire. They'll be waiting for you whenever you're ready to use them.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 sm:p-6">
                <h3 className="font-semibold mb-2">How do I check my token balance?</h3>
                <p className="text-sm text-muted-foreground">
                  Your token balance is displayed in your profile dashboard. You can also see it at checkout when applying tokens to your order.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 sm:p-6">
                <h3 className="font-semibold mb-2">Can I earn tokens without selling clothes?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! You earn 1 token just for logging in each week. You also earn tokens back on purchases.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 sm:p-6">
                <h3 className="font-semibold mb-2">How long does it take to get tokens for sold items?</h3>
                <p className="text-sm text-muted-foreground">
                  Once you accept our offer and ship your item, tokens are credited to your account within 2-3 business days of us receiving and verifying the item.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/5 py-12 sm:py-16">
          <div className="container max-w-4xl text-center">
            <SectionHeader 
              title="Ready to Start Earning?" 
              subtitle="Join our circular economy today. Shop sustainably, earn tokens, and make a difference."
              centered 
            />
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button asChild size="lg" className="w-full sm:w-auto gap-2">
                <Link href="/shop">
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                <Link href="/sell">
                  <Package className="w-4 h-4" />
                  Sell Your Clothes
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
