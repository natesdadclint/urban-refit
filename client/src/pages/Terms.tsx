import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";

export default function Terms() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <PageHeader 
          title="Terms of Service"
          subtitle="Last updated: January 2026"
        />

        {/* Main Content */}
        <div className="container max-w-4xl py-16 md:py-24">
          <div className="prose prose-stone max-w-none space-y-8 text-muted-foreground">
            <section>
              <SectionHeader title="1. Agreement to Terms" />
              <p>
                By accessing or using the Urban Refit website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.
              </p>
            </section>

            <section>
              <SectionHeader title="2. Nature of Products - Secondhand Clothing" />
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
              <SectionHeader title="3. Condition Ratings" />
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
              <SectionHeader title="4. Pricing and Payment" />
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
              <SectionHeader title="5. Returns and Refunds" />
              <p className="mb-4">
                Due to the unique nature of secondhand items, our return policy is as follows:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-foreground">Eligible Returns:</strong> Items that are significantly not as described, have undisclosed damage, or were shipped incorrectly may be returned within 14 days of delivery.</li>
                <li><strong className="text-foreground">Authenticity Issues:</strong> If an item is found to not be authentic or does not match the brand or description as listed, you are entitled to a full refund. See Section 5A below for details.</li>
                <li><strong className="text-foreground">Non-Returnable:</strong> Items returned due to change of mind, fit preferences, or minor variations consistent with secondhand goods are not eligible for refund.</li>
                <li><strong className="text-foreground">Condition:</strong> Returned items must be unworn (after receipt), unwashed, and in the same condition as received, with all tags attached.</li>
                <li><strong className="text-foreground">Process:</strong> Contact help@urbanrefit.store within 14 days of delivery with photos and description of the issue.</li>
              </ul>
              <p className="mt-4">
                Refunds, when approved, will be processed to the original payment method within 5-10 business days of receiving the returned item.
              </p>
            </section>

            <section>
              <SectionHeader title="5A. Authenticity Guarantee & Remediation" />
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-4">
                <p className="text-emerald-800 font-semibold mb-2">Our Commitment to Authenticity</p>
                <p className="text-emerald-700">
                  Urban Refit is committed to offering only genuine, authentic branded garments. Every item undergoes a careful triage and inspection process before it is listed on our platform. However, we acknowledge that with the volume and variety of secondhand goods we handle, mistakes may from time to time occur.
                </p>
              </div>
              <p className="mb-4">
                In the event that an item you receive is found to be inauthentic or misrepresented in terms of its brand or origin, Urban Refit will work with you promptly to resolve the matter. Our authenticity remediation process is as follows:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-foreground">Full Refund:</strong> You are entitled to a full refund of the purchase price, including any shipping costs, for any item that is determined to not be authentic.</li>
                <li><strong className="text-foreground">Swift Remediation:</strong> Urban Refit is more than willing to interact at pace to remediate the situation. Upon notification, we will respond within 24 hours and aim to resolve all authenticity claims within 5 business days.</li>
                <li><strong className="text-foreground">Return Shipping:</strong> Urban Refit will cover all return shipping costs for items returned due to authenticity concerns. A prepaid shipping label will be provided.</li>
                <li><strong className="text-foreground">Token Compensation:</strong> In addition to a full refund, affected customers will receive 10 bonus Urban Refit Tokens as a gesture of goodwill for the inconvenience.</li>
                <li><strong className="text-foreground">Reporting:</strong> Contact help@urbanrefit.store with the subject line "Authenticity Concern" along with your order number, photos of the item, and a description of your concern. We take every report seriously.</li>
              </ul>
              <p className="mt-4">
                We do our best to triage and verify every garment that enters our inventory. Our team inspects labels, stitching, materials, and other markers of authenticity. Despite these efforts, the nature of secondhand sourcing means that occasional errors may occur. When they do, we stand behind our customers and prioritise a fair and timely resolution.
              </p>
              <p className="mt-4 text-sm">
                Urban Refit reserves the right to request the return of the item in question for independent verification. Fraudulent authenticity claims may result in account suspension.
              </p>
            </section>

            <section>
              <SectionHeader title="6. Shipping" />
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
              <SectionHeader title="7. Loyalty Program and Tokens" />
              <p className="mb-4">
                Urban Refit offers a loyalty program where customers can earn tokens through various activities:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Tokens are earned when you return garments through our courier return program</li>
                <li>Token value is approximately 25% of the item's resale value</li>
                <li>Tokens can be converted to spend limit (1 token = $1.00 NZD) for orders of 3+ items</li>
                <li>Alternatively, tokens can be donated to our charity partners</li>
                <li>Tokens have no cash value and cannot be exchanged for cash</li>
                <li>Urban Refit reserves the right to modify or discontinue the loyalty program at any time</li>
              </ul>
            </section>

            <section>
              <SectionHeader title="8. Courier Return Program" />
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
              <SectionHeader title="9. User Accounts" />
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account. We reserve the right to terminate accounts that violate these terms or engage in fraudulent activity.
              </p>
            </section>

            <section>
              <SectionHeader title="10. Intellectual Property" />
              <p>
                The Urban Refit name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Urban Refit or its affiliates or licensors. You must not use such marks without the prior written permission of Urban Refit. All other names, logos, product and service names, designs, and slogans on this Website are the trademarks of their respective owners.
              </p>
            </section>

            <section>
              <SectionHeader title="11. Limitation of Liability" />
              <p>
                In no event shall Urban Refit, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>

            <section>
              <SectionHeader title="12. Governing Law" />
              <p>
                These Terms shall be governed and construed in accordance with the laws of New Zealand, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <SectionHeader title="13. Changes to Terms" />
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>

            <section>
              <SectionHeader title="14. Contact Us" />
              <p>
                If you have any questions about these Terms, please contact us at <a href="mailto:help@urbanrefit.store">help@urbanrefit.store</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
