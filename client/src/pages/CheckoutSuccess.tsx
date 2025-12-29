import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

export default function CheckoutSuccess() {
  return (
    <Layout>
      <div className="container py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="mb-6">
            <CheckCircle className="h-20 w-20 mx-auto text-green-500" />
          </div>
          
          <h1 className="text-3xl font-serif font-semibold mb-4">
            Thank You for Your Order!
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Your payment was successful. We've sent a confirmation email with your order details.
            Your items will be shipped within 2-3 business days.
          </p>

          <div className="bg-secondary/50 rounded-lg p-6 mb-8">
            <Package className="h-8 w-8 mx-auto text-primary mb-3" />
            <p className="text-sm text-muted-foreground">
              By shopping with Urban Refit, you've helped give pre-loved clothing a second life
              and supported our local thrift store partners. Thank you for being part of the
              circular fashion movement!
            </p>
          </div>

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
