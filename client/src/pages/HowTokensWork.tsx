import Layout from "@/components/Layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export default function HowTokensWork() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/5 to-background py-12 sm:py-16 md:py-24">
          <div className="container max-w-4xl">
            <Link href="/" className="inline-flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-medium text-foreground hover:text-primary transition-colors mb-4 sm:mb-6 py-1.5 sm:py-2 px-2 sm:px-3 -ml-2 sm:-ml-3 rounded-lg hover:bg-accent/20">
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Coins className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground">
                How Tokens Work
              </h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
              Urban Refit tokens are at the heart of our circular economy. Earn tokens by participating in sustainable fashion, 
              then use them to save on future purchases or support charities you care about.
            </p>
          </div>
        </div>

        {/* Token Value */}
        <div className="container max-w-4xl py-8 sm:py-12">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 sm:p-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">Token Value</p>
            <p className="text-3xl sm:text-4xl font-bold text-primary mb-2">1 Token = NZ$1</p>
            <p className="text-sm text-muted-foreground">Use tokens as real money towards your next purchase or charity donation</p>
          </div>
        </div>

        {/* The Circular Economy Model */}
        <div className="container max-w-4xl py-8 sm:py-12">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-6 text-foreground text-center">
            The Circular Economy
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Our token system keeps value circulating within our community, reducing waste and supporting sustainable fashion.
          </p>
          
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
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-2 text-foreground text-center">
              Ways to Earn Tokens
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground text-center mb-8">
              Multiple ways to build your token balance
            </p>

            <div className="grid gap-4 sm:gap-6">
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
                        <span>+5 tokens per week</span>
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
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-2 text-foreground text-center">
            Ways to Spend Tokens
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground text-center mb-8">
            Your tokens, your choice
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Discount on Purchases */}
            <Card className="border-2 hover:border-primary/40 transition-colors">
              <CardContent className="p-6 sm:p-8">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Gift className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Save on Purchases</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Apply your tokens at checkout to reduce your order total. Each token is worth NZ$1 off your purchase.
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
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-8 text-foreground text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
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
                  Yes! You earn 5 tokens just for logging in each week. You also earn tokens back on purchases.
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
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4 text-foreground">
              Ready to Start Earning?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-xl mx-auto">
              Join our circular economy today. Shop sustainably, earn tokens, and make a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/shop">
                <Button size="lg" className="w-full sm:w-auto">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Shop Now
                </Button>
              </Link>
              <Link href="/sell">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Package className="w-4 h-4 mr-2" />
                  Sell Your Clothes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
