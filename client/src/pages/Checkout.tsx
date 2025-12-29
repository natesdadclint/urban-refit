import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CreditCard, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Checkout() {
  const { isAuthenticated, user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: cart, isLoading: cartLoading } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const [formData, setFormData] = useState({
    shippingName: user?.name || "",
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZip: "",
    shippingCountry: "United States",
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

    createCheckoutSession.mutate(formData);
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

  const subtotal = parseFloat(cart.total);
  const shipping = 9.99;
  const total = subtotal + shipping;
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
                          placeholder="New York"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shippingState">State *</Label>
                        <Input
                          id="shippingState"
                          name="shippingState"
                          value={formData.shippingState}
                          onChange={handleInputChange}
                          placeholder="NY"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shippingZip">ZIP Code *</Label>
                        <Input
                          id="shippingZip"
                          name="shippingZip"
                          value={formData.shippingZip}
                          onChange={handleInputChange}
                          placeholder="10001"
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
                          placeholder="United States"
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
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
                  <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

                  {/* Items */}
                  <div className="space-y-3 mb-4">
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
                            ${parseFloat(product.salePrice).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between font-semibold text-lg mb-6">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    size="lg"
                    disabled={createCheckoutSession.isPending}
                  >
                    <CreditCard className="h-4 w-4" />
                    {createCheckoutSession.isPending ? "Processing..." : "Pay with Stripe"}
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
