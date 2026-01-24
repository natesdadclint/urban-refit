import Layout from "@/components/Layout";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Partners() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-accent/10 to-background py-16 md:py-24">
          <div className="container max-w-4xl">
            <Link href="/" className="inline-flex items-center gap-2 text-base font-medium text-foreground hover:text-primary transition-colors mb-6 py-2 px-3 -ml-3 rounded-lg hover:bg-accent/20">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-foreground">
              Our Partners
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              We work with local thrift stores to source premium clothing and support sustainable fashion.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container max-w-4xl py-16 md:py-24">
          <div className="space-y-12">
            {/* Partnership Model */}
            <section>
              <h2 className="text-3xl font-serif font-bold mb-4 text-foreground">Our Partnership Model</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                Every thrift store partner receives 10% of the sale price for each garment sourced from their store. This creates a sustainable partnership that supports their mission while ensuring quality inventory for Urban Refit.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                We carefully select partners whose values align with ours—organizations committed to sustainability, community impact, and quality merchandise.
              </p>
            </section>

            {/* Partner Benefits */}
            <section>
              <h2 className="text-3xl font-serif font-bold mb-6 text-foreground">Partner Benefits</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">Revenue Share</h3>
                  <p className="text-base text-muted-foreground">
                    Receive 10% of every sale price for garments sourced from your store.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">Brand Visibility</h3>
                  <p className="text-base text-muted-foreground">
                    Your store is featured on our platform and recognized for supporting sustainable fashion.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">Inventory Support</h3>
                  <p className="text-base text-muted-foreground">
                    We help move quality inventory that might otherwise sit on shelves.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">Community Impact</h3>
                  <p className="text-base text-muted-foreground">
                    Together we extend the life of quality clothing and support the circular economy.
                  </p>
                </div>
              </div>
            </section>

            {/* Current Partners */}
            <section>
              <h2 className="text-3xl font-serif font-bold mb-6 text-foreground">Our Partners</h2>
              <p className="text-base text-muted-foreground mb-8">
                [Your partner list will appear here. Each partner will display their name, location, and contribution metrics.]
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="border border-border rounded-lg p-6 space-y-3">
                  <h3 className="text-base font-semibold text-foreground">Partner Name</h3>
                  <p className="text-base text-muted-foreground">City, State</p>
                  <p className="text-sm text-muted-foreground">Items sourced: 0</p>
                  <p className="text-sm text-muted-foreground">Total payouts: $0.00</p>
                </div>
              </div>
            </section>

            {/* Become a Partner */}
            <section className="bg-accent/5 rounded-lg p-8 space-y-4">
              <h2 className="text-2xl font-serif font-bold text-foreground">Interested in Becoming a Partner?</h2>
              <p className="text-base text-muted-foreground">
                We're always looking for quality thrift stores that share our commitment to sustainability and community impact. Contact us to learn more about partnership opportunities.
              </p>
              <p className="text-base text-muted-foreground">
                Email: <a href="mailto:help@urbanrefit.store" className="text-primary hover:underline">help@urbanrefit.store</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
