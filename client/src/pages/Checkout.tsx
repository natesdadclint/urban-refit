import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";

// New Zealand regions for shipping
const NZ_REGIONS = [
  "Northland",
  "Auckland",
  "Waikato",
  "Bay of Plenty",
  "Gisborne",
  "Hawke's Bay",
  "Taranaki",
  "Manawatū-Whanganui",
  "Wellington",
  "Tasman",
  "Nelson",
  "Marlborough",
  "West Coast",
  "Canterbury",
  "Otago",
  "Southland",
] as const;
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CreditCard, Lock, Coins, Gift, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

// Tiered discount structure
const getTieredDiscount = (itemCount: number): { percentage: number; bonusTokens: number } => {
  if (itemCount >= 10) return { percentage: 25, bonusTokens: 15 };
  if (itemCount >= 7) return { percentage: 20, bonusTokens: 10 };
  if (itemCount >= 5) return { percentage: 15, bonusTokens: 7 };
  if (itemCount >= 3) return { percentage: 10, bonusTokens: 5 };
  return { percentage: 0, bonusTokens: 0 };
};

export default function Checkout() {
  const { isAuthenticated, user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [useSpendLimit, setUseSpendLimit] = useState(false);
  const [spendLimitAmount, setSpendLimitAmount] = useState("");
  
  const { data: cart, isLoading: cartLoading } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: profile } = trpc.customerProfile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const [formData, setFormData] = useState({
    shippingName: user?.name || "",
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZip: "",
    shippingCountry: "New Zealand",
    shippingPhone: "",
  });

  const createCheckoutSession = trpc.checkout.createSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success("Redirecting to payment...");
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const required = ["shippingName", "shippingAddress", "shippingCity", "shippingState", "shippingZip", "shippingCountry", "shippingPhone"];
    const missing = required.filter((field) => !formData[field as keyof typeof formData]);
    
    if (missing.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate NZ postcode (4 digits)
    const postcodeRegex = /^\d{4}$/;
    if (!postcodeRegex.test(formData.shippingZip)) {
      toast.error("Please enter a valid 4-digit NZ postcode");
      return;
    }

    // Include spend limit if applicable
    const checkoutData = {
      ...formData,
      useSpendLimit: useSpendLimit && itemCount >= 3,
      spendLimitAmount: useSpendLimit && itemCount >= 3 ? parseFloat(spendLimitAmount) || 0 : 0,
    };

    createCheckoutSession.mutate(checkoutData);
  };

  if (loading || cartLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="h-10 skeleton rounded w-1/4 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 skeleton rounded" />
                ))}
              </div>
              <div className="h-64 skeleton rounded" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-serif font-semibold mb-4">Checkout</h1>
          <p className="text-muted-foreground mb-6">
            Sign in to complete your purchase.
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </Layout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-serif font-semibold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Add some items to your cart before checking out.
          </p>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const itemCount = cart.items.length;
  const subtotal = parseFloat(cart.total);
  const shipping = 9.99;
  
  // Calculate GST (15% included in prices - NZ standard)
  // GST = Price × (15/115) for GST-inclusive pricing
  const gstAmount = subtotal * (15 / 115);
  const subtotalExGst = subtotal - gstAmount;
  
  // Calculate tiered discount
  const { percentage: discountPercentage, bonusTokens } = getTieredDiscount(itemCount);
  const discountAmount = (subtotal * discountPercentage) / 100;
  
  // Calculate spend limit usage
  const availableSpendLimit = parseFloat(profile?.spendLimit || "0");
  const canUseSpendLimit = itemCount >= 3 && availableSpendLimit > 0;
  const spendLimitToUse = useSpendLimit && canUseSpendLimit 
    ? Math.min(parseFloat(spendLimitAmount) || 0, availableSpendLimit, subtotal - discountAmount) 
    : 0;
  
  const totalBeforeSpendLimit = subtotal - discountAmount + shipping;
  const total = totalBeforeSpendLimit - spendLimitToUse;
  
  const placeholderImage = "https://placehold.co/100x100/f5f5f4/a8a29e?text=No+Image";

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 gap-2"
            asChild
          >
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>
          </Button>

          <h1 className="text-3xl font-serif font-semibold mb-8">Checkout</h1>

          {/* Tiered Discount Banner */}
          {discountPercentage > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-primary">
                    {discountPercentage}% Bulk Discount Applied!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You're saving NZ${discountAmount.toFixed(2)} with {itemCount} items + earning {bonusTokens} bonus tokens
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Discount Tiers Info */}
          {itemCount < 3 && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Unlock discounts with more items:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">3+ items: 10% off + 5 tokens</Badge>
                <Badge variant="outline">5+ items: 15% off + 7 tokens</Badge>
                <Badge variant="outline">7+ items: 20% off + 10 tokens</Badge>
                <Badge variant="outline">10+ items: 25% off + 15 tokens</Badge>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Shipping Form */}
              <div className="space-y-6">
                <div>
                  <h2 className="font-semibold text-lg mb-4">Shipping Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="shippingName">Full Name *</Label>
                      <Input
                        id="shippingName"
                        name="shippingName"
                        value={formData.shippingName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="shippingAddress">Address *</Label>
                      <Input
                        id="shippingAddress"
                        name="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={handleInputChange}
                        placeholder="123 Main St, Apt 4"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shippingCity">City *</Label>
                        <Input
                          id="shippingCity"
                          name="shippingCity"
                          value={formData.shippingCity}
                          onChange={handleInputChange}
                          placeholder="Auckland"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shippingState">Region *</Label>
                        <Select
                          value={formData.shippingState}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, shippingState: value }))}
                        >
                          <SelectTrigger id="shippingState">
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            {NZ_REGIONS.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shippingZip">Postcode *</Label>
                        <Input
                          id="shippingZip"
                          name="shippingZip"
                          value={formData.shippingZip}
                          onChange={handleInputChange}
                          placeholder="1010"
                          maxLength={4}
                          pattern="\d{4}"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shippingCountry">Country *</Label>
                        <Input
                          id="shippingCountry"
                          name="shippingCountry"
                          value={formData.shippingCountry}
                          onChange={handleInputChange}
                          placeholder="New Zealand"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="shippingPhone">Phone Number *</Label>
                      <Input
                        id="shippingPhone"
                        name="shippingPhone"
                        type="tel"
                        value={formData.shippingPhone}
                        onChange={handleInputChange}
                        placeholder="+64 21 123 4567"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Spend Limit Section */}
                {canUseSpendLimit && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Use Spend Limit</p>
                          <p className="text-sm text-muted-foreground">
                            Available: NZ${availableSpendLimit.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={useSpendLimit} 
                        onCheckedChange={setUseSpendLimit}
                      />
                    </div>
                    {useSpendLimit && (
                      <div className="space-y-2">
                        <Label htmlFor="spendLimitAmount">Amount to use</Label>
                        <Input
                          id="spendLimitAmount"
                          type="number"
                          placeholder="Enter amount"
                          value={spendLimitAmount}
                          onChange={(e) => setSpendLimitAmount(e.target.value)}
                          min="0"
                          max={Math.min(availableSpendLimit, subtotal - discountAmount)}
                          step="0.01"
                        />
                        <div className="flex gap-2">
                          {[10, 25, 50].map((amount) => (
                            <Button
                              key={amount}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSpendLimitAmount(Math.min(amount, availableSpendLimit).toString())}
                              disabled={availableSpendLimit < amount}
                            >
                              NZ${amount}
                            </Button>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSpendLimitAmount(Math.min(availableSpendLimit, subtotal - discountAmount).toString())}
                          >
                            Max
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {!canUseSpendLimit && availableSpendLimit > 0 && itemCount < 3 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="h-5 w-5 text-muted-foreground" />
                      <p className="font-medium">Spend Limit Available: NZ${availableSpendLimit.toFixed(2)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add {3 - itemCount} more item{3 - itemCount > 1 ? 's' : ''} to use your spend limit!
                    </p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div>
                <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
                  <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

                  {/* Items */}
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.items.map(({ product }) => (
                      <div key={product.id} className="flex gap-3">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                          <img
                            src={product.image1Url || placeholderImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.brand} {product.size && `• Size ${product.size}`}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            NZ${parseFloat(product.salePrice).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                      <span>NZ${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>(Includes GST of NZ${gstAmount.toFixed(2)})</span>
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Bulk Discount ({discountPercentage}%)</span>
                        <span>-NZ${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>NZ${shipping.toFixed(2)}</span>
                    </div>
                    
                    {spendLimitToUse > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Spend Limit Applied</span>
                        <span>-NZ${spendLimitToUse.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between font-semibold text-lg mb-2">
                    <span>Total</span>
                    <span>NZ${total.toFixed(2)}</span>
                  </div>
                  
                  {bonusTokens > 0 && (
                    <div className="flex items-center gap-2 text-sm text-primary mb-4">
                      <Gift className="h-4 w-4" />
                      <span>You'll earn {bonusTokens} bonus tokens with this order!</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    size="lg"
                    disabled={createCheckoutSession.isPending}
                  >
                    <CreditCard className="h-4 w-4" />
                    {createCheckoutSession.isPending ? "Processing..." : `Pay NZ${total.toFixed(2)} with Stripe`}
                  </Button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Secure checkout powered by Stripe
                  </div>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    10% of your purchase supports our thrift store partners
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
