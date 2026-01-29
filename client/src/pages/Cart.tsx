import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Cart() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: cart, isLoading } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const utils = trpc.useUtils();
  
  const removeFromCart = trpc.cart.remove.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      utils.cart.count.invalidate();
      toast.success("Item removed from cart");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove item");
    },
  });

  const clearCart = trpc.cart.clear.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      utils.cart.count.invalidate();
      toast.success("Cart cleared");
    },
  });

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="h-10 skeleton rounded w-1/4 mb-8" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 skeleton rounded" />
              ))}
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
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-serif font-semibold mb-4">Your Cart</h1>
          <p className="text-muted-foreground mb-6">
            Sign in to view your cart and start shopping.
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </Layout>
    );
  }

  const placeholderImage = "https://placehold.co/200x200/f5f5f4/a8a29e?text=No+Image";

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-serif font-semibold">Your Cart</h1>
            {cart && cart.items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearCart.mutate()}
                disabled={clearCart.isPending}
              >
                Clear Cart
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 skeleton rounded" />
              ))}
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="text-center py-16 bg-secondary/30 rounded-lg">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-6">Your cart is waiting for some pre-loved gems</p>
              <Button asChild>
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.items.map(({ cartItem, product }) => (
                  <div
                    key={cartItem.id}
                    className="flex gap-4 p-4 bg-card rounded-lg border border-border"
                  >
                    {/* Image */}
                    <Link href={`/product/${product.id}`} className="shrink-0">
                      <div className="w-24 h-24 rounded-md overflow-hidden bg-muted">
                        <img
                          src={product.image1Url || placeholderImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {product.brand && (
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          {product.brand}
                        </p>
                      )}
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-medium hover:text-primary transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        {product.size && <span>Size: {product.size}</span>}
                        <span className={`condition-badge ${product.condition}`}>
                          {product.condition.replace("_", " ")}
                        </span>
                      </div>
                      <p className="font-semibold mt-2">
                        NZ${parseFloat(product.salePrice).toFixed(2)}
                        <span className="text-xs font-normal text-muted-foreground ml-1">incl. GST</span>
                      </p>
                    </div>

                    {/* Remove button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart.mutate({ productId: product.id })}
                      disabled={removeFromCart.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
                  <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Subtotal ({cart.count} {cart.count === 1 ? "item" : "items"})
                      </span>
                      <span>NZ${cart.total}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>(Includes GST of NZ${(parseFloat(cart.total) * (15 / 115)).toFixed(2)})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>NZ$9.99</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between font-semibold text-lg mb-6">
                    <span>Total</span>
                    <span>NZ${(parseFloat(cart.total) + 9.99).toFixed(2)}</span>
                  </div>

                  <Button asChild className="w-full gap-2">
                    <Link href="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    5% of your purchase supports our thrift store partners
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
