import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Gift, 
  Percent, 
  Recycle, 
  Heart, 
  TrendingUp, 
  Truck,
  Star,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Mail,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Join() {
  const { isAuthenticated, user } = useAuth();

  const [preferences, setPreferences] = useState({
    newArrivals: true,
    exclusiveOffers: true,
    sustainabilityNews: false,
    partnerUpdates: false,
  });
  const [email, setEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      toast.success(data.alreadySubscribed ? "Already Subscribed" : "Subscribed!", {
        description: data.message,
      });
      setEmail("");
      setShowEmailForm(false);
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to subscribe. Please try again.",
      });
    },
  });

  const benefits = [
    {
      icon: Percent,
      title: "Tiered Discounts",
      description: "Buy 3+ items and unlock 10% off. The more you buy, the more you save – up to 25% off on 10+ items."
    },
    {
      icon: Gift,
      title: "Earn Tokens",
      description: "Every purchase earns you tokens. Use them for discounts on future orders or donate to charity."
    },
    {
      icon: Recycle,
      title: "Courier Returns",
      description: "Send back garments you no longer wear and earn 25% of their resale value as tokens."
    },
    {
      icon: Heart,
      title: "Charity Donations",
      description: "Choose to donate your tokens to partner charities and make a positive impact."
    },
    {
      icon: TrendingUp,
      title: "Spend Limit Credit",
      description: "Convert tokens to spend limit credit and use it towards your next purchase."
    },
    {
      icon: Truck,
      title: "Order Tracking",
      description: "Track all your orders, view purchase history, and manage returns from your dashboard."
    }
  ];

  const membershipTiers = [
    { name: "Bronze", minSpend: 0, discount: "5%", color: "bg-amber-700" },
    { name: "Silver", minSpend: 500, discount: "10%", color: "bg-gray-400" },
    { name: "Gold", minSpend: 1000, discount: "15%", color: "bg-yellow-500" },
    { name: "Platinum", minSpend: 2500, discount: "20%", color: "bg-gray-300" },
  ];

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleJoin = () => {
    // Store preferences in localStorage before redirecting
    localStorage.setItem('urbanrefit_marketing_preferences', JSON.stringify(preferences));
    window.location.href = getLoginUrl();
  };

  const handleEmailSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    subscribeMutation.mutate({
      email,
      source: "join_page",
      ...preferences,
    });
  };

  if (isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">You're Already a Member!</CardTitle>
              <CardDescription>
                Welcome back, {user?.name || 'valued customer'}. You're already enjoying all the benefits of Urban Refit membership.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <a href="/profile">View Your Profile & Rewards</a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/shop">Continue Shopping</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 md:py-24">
        <div className="container">
          <Link href="/" className="inline-flex items-center gap-2 text-base font-medium text-foreground hover:text-primary transition-colors mb-6 py-2 px-3 -ml-3 rounded-lg hover:bg-accent/20">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Join the Sustainable Fashion Movement
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-semibold mb-6">
              Become an Urban Refit Member
            </h1>
            <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
              Unlock exclusive discounts, earn rewards on every purchase, and be part of a community 
              that's redefining sustainable men's fashion. Membership is free – forever.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={handleJoin} className="gap-2">
                Join Now – It's Free <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/shop">Browse First</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-semibold mb-4">Member Benefits</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              As an Urban Refit member, you'll enjoy exclusive perks designed to reward your 
              commitment to sustainable fashion.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-semibold mb-4">Membership Tiers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The more you shop, the more you save. Unlock higher tiers based on your annual spend.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {membershipTiers.map((tier, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className={`w-16 h-16 ${tier.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>
                    {tier.minSpend === 0 ? "Starting tier" : `$${tier.minSpend}+ annual spend`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{tier.discount}</p>
                  <p className="text-sm text-muted-foreground">extra discount</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Marketing Preferences & CTA */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Ready to Join?</CardTitle>
                <CardDescription>
                  Customize your experience by selecting your communication preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Keep Me Updated About:
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="newArrivals" 
                        checked={preferences.newArrivals}
                        onCheckedChange={() => handlePreferenceChange('newArrivals')}
                      />
                      <Label htmlFor="newArrivals" className="cursor-pointer">
                        New arrivals and restocks
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="exclusiveOffers" 
                        checked={preferences.exclusiveOffers}
                        onCheckedChange={() => handlePreferenceChange('exclusiveOffers')}
                      />
                      <Label htmlFor="exclusiveOffers" className="cursor-pointer">
                        Exclusive member offers and discounts
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="sustainabilityNews" 
                        checked={preferences.sustainabilityNews}
                        onCheckedChange={() => handlePreferenceChange('sustainabilityNews')}
                      />
                      <Label htmlFor="sustainabilityNews" className="cursor-pointer">
                        Sustainability news and impact reports
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="partnerUpdates" 
                        checked={preferences.partnerUpdates}
                        onCheckedChange={() => handlePreferenceChange('partnerUpdates')}
                      />
                      <Label htmlFor="partnerUpdates" className="cursor-pointer">
                        Partner thrift store updates
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button size="lg" className="w-full gap-2" onClick={handleJoin}>
                    Create My Free Account <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    By joining, you agree to our{" "}
                    <a href="/terms" className="underline hover:text-primary">Terms of Service</a>
                    {" "}and{" "}
                    <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>.
                  </p>
                </div>

                {/* Email-only subscription option */}
                <div className="pt-4 border-t">
                  {!showEmailForm ? (
                    <button
                      onClick={() => setShowEmailForm(true)}
                      className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Not ready to join? <span className="underline">Subscribe to our newsletter instead</span>
                    </button>
                  ) : (
                    <form onSubmit={handleEmailSubscribe} className="space-y-4">
                      <div className="text-center mb-4">
                        <p className="text-sm text-muted-foreground">
                          Stay updated without creating an account
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                        <Button type="submit" disabled={subscribeMutation.isPending}>
                          {subscribeMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Subscribe"
                          )}
                        </Button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowEmailForm(false)}
                        className="w-full text-center text-xs text-muted-foreground hover:text-primary"
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold mb-2">5,000+</p>
              <p className="text-primary-foreground/80">Happy Members</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">NZ$50,000+</p>
              <p className="text-primary-foreground/80">Donated to Thrift Partners</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">10,000+</p>
              <p className="text-primary-foreground/80">Garments Given New Life</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
