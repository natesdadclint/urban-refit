import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { XCircle, ArrowLeft, ArrowRight, ShoppingBag, HelpCircle } from "lucide-react";

export default function CheckoutCanceled() {
  return (
    <Layout>
      <div className="container py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="mb-6">
            <XCircle className="h-20 w-20 mx-auto text-muted-foreground" />
          </div>
          
          <PageHeader title="Payment Canceled" variant="compact" className="mb-4" />
          
          <p className="text-muted-foreground mb-8">
            Your payment was canceled and no charges were made. 
            Your items are still in your cart if you'd like to complete your purchase.
          </p>

          <div className="bg-secondary/50 rounded-lg p-6 mb-8">
            <ShoppingBag className="h-8 w-8 mx-auto text-primary mb-3" />
            <p className="text-sm text-muted-foreground">
              Don't worry - your cart items are saved and waiting for you. 
              You can return to checkout whenever you're ready.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/cart">
                <ArrowLeft className="h-4 w-4" />
                Return to Cart
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/shop">
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              Having trouble with checkout?
            </p>
            <Button asChild variant="ghost" size="sm">
              <Link href="/faq">
                <HelpCircle className="h-4 w-4" />
                View FAQ
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
