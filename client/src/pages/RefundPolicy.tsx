import Layout from "@/components/Layout";

export default function RefundPolicy() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-accent/10 to-background py-16 md:py-24">
          <div className="container max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-foreground">
              Refund Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 2026
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container max-w-4xl py-16 md:py-24">
          <div className="prose prose-stone max-w-none space-y-8 text-muted-foreground">
            
            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <p className="text-amber-800 font-semibold mb-2">Important: Secondhand Items</p>
              <p className="text-amber-700">
                All items sold on Urban Refit are pre-owned, secondhand clothing. Our refund policy 
                reflects the unique nature of these items. Please read carefully before making a purchase.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Eligibility for Refunds</h2>
              <p className="mb-4">
                We want you to be satisfied with your purchase. Refunds may be issued in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-foreground">Item Significantly Not as Described:</strong> If the item you receive differs materially from the description or photos provided (e.g., wrong size, wrong item, undisclosed major damage).</li>
                <li><strong className="text-foreground">Undisclosed Damage:</strong> If the item has damage, stains, or defects that were not mentioned in the listing.</li>
                <li><strong className="text-foreground">Wrong Item Shipped:</strong> If you receive an item different from what you ordered.</li>
                <li><strong className="text-foreground">Item Not Received:</strong> If your order does not arrive within the estimated delivery window and tracking shows it was not delivered.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Non-Refundable Situations</h2>
              <p className="mb-4">
                Due to the nature of secondhand items, we cannot offer refunds for:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-foreground">Change of Mind:</strong> Deciding you no longer want the item after purchase.</li>
                <li><strong className="text-foreground">Fit Issues:</strong> Items that don't fit as expected (please check measurements carefully before ordering).</li>
                <li><strong className="text-foreground">Minor Wear Consistent with Secondhand:</strong> Small signs of previous use that are typical for pre-owned clothing and consistent with the stated condition rating.</li>
                <li><strong className="text-foreground">Color Variations:</strong> Slight differences in color between photos and the actual item due to lighting or monitor settings.</li>
                <li><strong className="text-foreground">Vintage Characteristics:</strong> Age-appropriate characteristics of vintage items.</li>
                <li><strong className="text-foreground">Odors:</strong> Mild scents that can be removed with washing (items are cleaned before shipping, but some may retain subtle odors).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Refund Request Process</h2>
              <div className="bg-muted/50 rounded-lg p-6 mb-4">
                <p className="font-semibold text-foreground mb-2">Time Limit</p>
                <p>You must contact us within <strong className="text-foreground">14 days of delivery</strong> to request a refund.</p>
              </div>
              <p className="mb-4">To request a refund:</p>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <strong className="text-foreground">Contact Us:</strong> Email <a href="mailto:help@urbanrefit.store" className="text-primary hover:underline">help@urbanrefit.store</a> with your order number and a description of the issue.
                </li>
                <li>
                  <strong className="text-foreground">Provide Evidence:</strong> Include clear photos showing the problem (e.g., damage, wrong item, discrepancy from listing).
                </li>
                <li>
                  <strong className="text-foreground">Await Response:</strong> We will review your request within 2-3 business days and respond with next steps.
                </li>
                <li>
                  <strong className="text-foreground">Return the Item:</strong> If approved, we will provide return shipping instructions. Items must be returned in the same condition as received.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Return Shipping</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>If the return is due to our error (wrong item, undisclosed damage), we will cover return shipping costs.</li>
                <li>For other approved returns, the customer is responsible for return shipping costs.</li>
                <li>We recommend using a tracked shipping service for returns.</li>
                <li>Items must be returned within 7 days of refund approval.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Condition of Returned Items</h2>
              <p className="mb-4">
                To be eligible for a refund, returned items must be:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Unworn after receipt (trying on is acceptable)</li>
                <li>Unwashed</li>
                <li>In the same condition as when received</li>
                <li>With all original tags still attached (if applicable)</li>
                <li>Free from additional damage, stains, or odors</li>
              </ul>
              <p className="mt-4">
                Items returned in a different condition than received may not be eligible for a full refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Refund Processing</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Refunds are processed within 5-10 business days after we receive and inspect the returned item.</li>
                <li>Refunds will be issued to the original payment method.</li>
                <li>Original shipping costs are non-refundable unless the return is due to our error.</li>
                <li>You will receive an email confirmation when your refund has been processed.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Exchanges</h2>
              <p>
                Due to the unique nature of secondhand items, we do not offer direct exchanges. If you would like 
                a different item, please return the original item for a refund (if eligible) and place a new order.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Loyalty Tokens and Refunds</h2>
              <p className="mb-4">
                If you used loyalty tokens or spend limit credit on your purchase:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Token value used will be restored to your account upon approved refund.</li>
                <li>Bonus tokens earned from the purchase will be deducted from your balance.</li>
                <li>If your token balance goes negative, it will be deducted from future earnings.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Damaged in Transit</h2>
              <p>
                If your item arrives damaged due to shipping, please contact us immediately with photos of the 
                packaging and item. We will work with the shipping carrier to resolve the issue and provide 
                a refund or replacement where possible.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Contact Us</h2>
              <p>
                If you have any questions about our refund policy or need assistance with a return, please contact us:
              </p>
              <div className="mt-4 p-6 bg-muted/50 rounded-lg">
                <p className="font-semibold text-foreground">Urban Refit Customer Service</p>
                <p>Email: <a href="mailto:help@urbanrefit.store" className="text-primary hover:underline">help@urbanrefit.store</a></p>
                <p className="mt-2 text-sm">Response time: 1-2 business days</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
