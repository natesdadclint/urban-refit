import Layout from "@/components/Layout";

export default function Privacy() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-accent/10 to-background py-16 md:py-24">
          <div className="container max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-foreground">
              Privacy Policy
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
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">1. Introduction</h2>
              <p>
                Urban Refit ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and purchase secondhand clothing through our platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">2. Information We Collect</h2>
              <p className="mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-foreground">Personal Information:</strong> Name, email address, postal address, phone number, and payment information when you create an account or make a purchase.</li>
                <li><strong className="text-foreground">Account Information:</strong> Username, password, and preferences associated with your Urban Refit account.</li>
                <li><strong className="text-foreground">Transaction Information:</strong> Details about purchases, including items bought, prices paid, and shipping information.</li>
                <li><strong className="text-foreground">Communication Data:</strong> Information you provide when contacting our customer service team at help@urbanrefit.store.</li>
                <li><strong className="text-foreground">Marketing Preferences:</strong> Your preferences for receiving promotional communications and newsletters.</li>
                <li><strong className="text-foreground">Loyalty Program Data:</strong> Token balances, rewards history, courier return requests, and charity donation preferences.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Process and fulfill your orders for secondhand clothing items</li>
                <li>Manage your account and provide customer support</li>
                <li>Send transactional emails (order confirmations, shipping updates)</li>
                <li>Administer our loyalty and rewards program, including token management</li>
                <li>Process courier returns for garment recycling</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Improve our website, products, and services</li>
                <li>Detect and prevent fraud or unauthorized access</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">4. Information Sharing</h2>
              <p className="mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-foreground">Service Providers:</strong> Third parties who perform services on our behalf, such as payment processing (Stripe), shipping carriers, and email service providers.</li>
                <li><strong className="text-foreground">Thrift Store Partners:</strong> We share limited transaction data with our thrift store partners to facilitate their 5% payout on sales of items they sourced. This includes only the item sold and sale amount, not your personal details.</li>
                <li><strong className="text-foreground">Charity Partners:</strong> When you donate tokens to charity, we share your name (if you choose) with the selected charity organization.</li>
                <li><strong className="text-foreground">Legal Requirements:</strong> When required by law or to protect our rights and safety.</li>
              </ul>
              <p className="mt-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment transactions are processed through Stripe's secure payment infrastructure. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">6. Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand where our visitors come from. You can control cookies through your browser settings, though disabling cookies may affect some website functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">7. Your Rights</h2>
              <p className="mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at help@urbanrefit.store.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">8. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Transaction records are kept for accounting and tax purposes as required by applicable regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">9. Children's Privacy</h2>
              <p>
                Our website is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at help@urbanrefit.store.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">11. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
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
