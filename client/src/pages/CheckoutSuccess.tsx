import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CheckCircle, Loader2, Mail, Package, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";

export default function CheckoutSuccess() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const sessionId = params.get("session_id");

  const [orderId, setOrderId] = useState<number | null>(null);

  // Verify the checkout session and get order details
  const { data: verifyData, isLoading: verifyLoading } = trpc.checkout.verifySession.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId }
  );

  useEffect(() => {
    if (verifyData?.orderId) {
      setOrderId(verifyData.orderId);
    }
  }, [verifyData]);

  // Get order details
  const { data: orderData, isLoading: orderLoading } = trpc.order.getById.useQuery(
    { id: orderId! },
    { enabled: !!orderId }
  );

  if (verifyLoading || orderLoading) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="max-w-lg mx-auto text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Confirming your order...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const order = orderData?.order;
  const items = orderData?.items || [];

  return (
    <Layout>
      <div className="container py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <CheckCircle className="h-20 w-20 mx-auto text-green-500" />
            </div>

            <PageHeader
              title="Thank You for Your Order!"
              subtitle="Your payment was successful. We've sent a confirmation email with your order details."
              variant="compact"
            />

            {order && (
              <p className="text-sm font-medium mt-4">
                Order #{order.id}
              </p>
            )}
          </div>

          {/* Order Summary Card */}
          {order && items.length > 0 && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <SectionHeader
                  title={
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Order Summary
                    </div>
                  }
                />

                {/* Items */}
                <div className="space-y-3 mb-4">
                  {items.map(({ product, orderItem }) => (
                    <div key={orderItem.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                        <img
                          src={product.image1Url || "https://placehold.co/100x100/f5f5f4/a8a29e?text=No+Image"}
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
                          NZ${parseFloat(orderItem.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>NZ${parseFloat(order.subtotal).toFixed(2)}</span>
                  </div>
                  {order.gstAmount && (
                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>(Includes GST of NZ${parseFloat(order.gstAmount).toFixed(2)})</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>NZ${parseFloat(order.shippingCost).toFixed(2)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Paid</span>
                  <span>NZ${parseFloat(order.total).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shipping Info */}
          {order && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <SectionHeader
                  title={
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Shipping To
                    </div>
                  }
                />
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.shippingName}</p>
                  <p className="text-muted-foreground">{order.shippingAddress}</p>
                  <p className="text-muted-foreground">
                    {order.shippingCity}, {order.shippingState} {order.shippingZip}
                  </p>
                  <p className="text-muted-foreground">{order.shippingCountry}</p>
                  {order.shippingPhone && (
                    <p className="text-muted-foreground">{order.shippingPhone}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* What's Next */}
          <div className="bg-secondary/50 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <SectionHeader title="What happens next?" level="h3" />
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>1. You'll receive an order confirmation email shortly</li>
                  <li>2. We'll carefully package your items within 1-2 business days</li>
                  <li>3. You'll receive a shipping notification with tracking info</li>
                  <li>4. Your items will arrive within 5-7 business days</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sustainability Message */}
          <div className="bg-primary/5 rounded-lg p-6 mb-8">
            <Package className="h-8 w-8 mx-auto text-primary mb-3" />
            <p className="text-sm text-center text-muted-foreground">
              By shopping with Urban Refit, you've helped give pre-loved clothing a second life
              and supported our local thrift store partners. Thank you for being part of the
              circular fashion movement!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/orders">
                View My Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/shop">
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
