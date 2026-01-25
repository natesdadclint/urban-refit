import Layout from "@/components/Layout";

export default function Terms() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-accent/10 to-background py-16 md:py-24">
          <div className="container max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-foreground">
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 2026
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container max-w-4xl py-16 md:py-24">
          <div className="prose prose-stone max-w-none space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">1. Agreement to Terms</h2>
              <p>
                By accessing or using the Urban Refit website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">2. Nature of Products - Secondhand Clothing</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-4">
                <p className="text-amber-800 font-semibold mb-2">Important Notice</p>
                <p className="text-amber-700">
                  All items sold on Urban Refit are pre-owned, secondhand clothing. By purchasing from our platform, you acknowledge and accept that these items have been previously worn and may show signs of prior use.
                </p>
              </div>
              <p className="mb-4">
                Urban Refit specializes in curated secondhand fashion. Our items are sourced from thrift stores and carefully inspected before listing. However, as pre-owned items:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Items may have minor imperfections, wear marks, or signs of previous use that are consistent with secondhand goods</li>
                <li>Colors may vary slightly from photographs due to lighting and monitor differences</li>
                <li>Vintage or older items may have characteristics typical of their age</li>
                <li>Sizing may differ from modern standards, especially for vintage pieces</li>
                <li>Items have been cleaned and sanitized but may retain subtle characteristics of previous ownership</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">3. Condition Ratings</h2>
              <p className="mb-4">
                We rate all items based on their condition. These ratings are subjective assessments made in good faith:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-foreground">Like New:</strong> Appears unworn or minimally worn with no visible flaws. May still have original tags.</li>
                <li><strong className="text-foreground">Excellent:</strong> Gently worn with minimal signs of use. No significant flaws, stains, or damage.</li>
                <li><strong className="text-foreground">Good:</strong> Shows normal wear consistent with regular use. May have minor imperfections that do not affect wearability.</li>
                <li><strong className="text-foreground">Fair:</strong> Visible wear, minor flaws, or imperfections. Still wearable and functional. Priced accordingly.</li>
              </ul>
              <p className="mt-4">
                We strive to accurately describe and photograph all items. Any known flaws or defects will be noted in the item description. Please review all photos and descriptions carefully before purchasing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">4. Pricing and Payment</h2>
              <p className="mb-4">
                All prices are listed in NZD (New Zealand Dollars) and include the following components:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Original acquisition cost from our thrift store partners</li>
                <li>Our curation and quality control markup</li>
                <li>A 10% allocation to our thrift store partners from each sale</li>
              </ul>
              <p className="mt-4">
                Payment is processed securely through Stripe. We accept major credit cards and other payment methods supported by Stripe. All sales are final once payment is processed, subject to our return policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">5. Returns and Refunds</h2>
              <p className="mb-4">
                Due to the unique nature of secondhand items, our return policy is as follows:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-foreground">Eligible Returns:</strong> Items that are significantly not as described, have undisclosed damage, or were shipped incorrectly may be returned within 14 days of delivery.</li>
                <li><strong className="text-foreground">Non-Returnable:</strong> Items returned due to change of mind, fit preferences, or minor variations consistent with secondhand goods are not eligible for refund.</li>
                <li><strong className="text-foreground">Condition:</strong> Returned items must be unworn (after receipt), unwashed, and in the same condition as received, with all tags attached.</li>
                <li><strong className="text-foreground">Process:</strong> Contact help@urbanrefit.store within 14 days of delivery with photos and description of the issue.</li>
              </ul>
              <p className="mt-4">
                Refunds, when approved, will be processed to the original payment method within 5-10 business days of receiving the returned item.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">6. Shipping</h2>
              <p className="mb-4">
                Shipping costs and delivery times vary based on location. We are not responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Delays caused by shipping carriers or customs</li>
                <li>Lost or stolen packages after delivery confirmation</li>
                <li>Incorrect addresses provided by the customer</li>
                <li>Import duties, taxes, or customs fees in your country</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">7. Loyalty Program and Tokens</h2>
              <p className="mb-4">
                Urban Refit offers a loyalty program where customers can earn tokens through various activities:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Tokens are earned when you return garments through our courier return program</li>
                <li>Token value is approximately 25% of the item's resale value</li>
                <li>Tokens can be converted to spend limit (1 token = $1 NZD) for orders of 3+ items</li>
                <li>Alternatively, tokens can be donated to our charity partners</li>
                <li>Tokens have no cash value and cannot be exchanged for cash</li>
                <li>Urban Refit reserves the right to modify or discontinue the loyalty program at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">8. Courier Return Program</h2>
              <p className="mb-4">
                Our courier return program allows you to send back garments for resale:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Items must be clean, wearable, and in acceptable condition for resale</li>
                <li>We reserve the right to reject items that do not meet our quality standards</li>
                <li>Token rewards are issued only after items are inspected and approved</li>
                <li>Items not accepted will be donated to charity or responsibly disposed of</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">9. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account. We reserve the right to terminate accounts that violate these terms or engage in fraudulent activity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">10. Intellectual Property</h2>
              <p>
                The Urban Refit name, logo, website design, and original content are the property of Urban Refit and are protected by intellectual property laws. You may not use, reproduce, or distribute our intellectual property without written permission. Product images and descriptions are for informational purposes only.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">11. Limitation of Liability</h2>
              <p>
                Urban Refit shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services or products. Our total liability shall not exceed the amount you paid for the specific item in question. We make no warranties, express or implied, regarding the fitness of secondhand items for any particular purpose.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">12. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Urban Refit, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of our services or violation of these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">13. Governing Law</h2>
              <p>
                These Terms of Service shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these terms shall be resolved through binding arbitration or in the courts of competent jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">14. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the website. Your continued use of the service after changes constitutes acceptance of the modified terms. We encourage you to review these terms periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">15. Contact Us</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-6 bg-muted/50 rounded-lg">
                <p className="font-semibold text-foreground">Urban Refit</p>
                <p>Email: <a href="mailto:help@urbanrefit.store" className="text-primary hover:underline">help@urbanrefit.store</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
