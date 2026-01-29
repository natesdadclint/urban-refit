import Layout from "@/components/Layout";
import { Link } from "wouter";
import { ArrowLeft, Recycle, Users, Sparkles } from "lucide-react";

export default function About() {
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
              About Urban Refit
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Built from nothing. Designed for those grinding through the system.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container max-w-4xl py-16 md:py-24">
          <div className="space-y-16">
            {/* Founder Story Section */}
            <section>
              <h2 className="text-3xl font-serif font-bold mb-6 text-foreground">The Beginning</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Urban Refit started in a flat where two-minute noodles were the main course and learning to code was the side hustle. Shopify, APIs, the whole stack. Then AI arrived, and suddenly my tech brain met my creative instincts. Perfect storm. Dangerous enough to be useful.
              </p>
              <blockquote className="border-l-4 border-primary pl-6 py-2 my-8">
                <p className="text-lg font-serif italic text-foreground">
                  E ako ana au, e whakakotahi ana ki taku Ko Papa.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  I am learning, reconnecting with my roots.
                </p>
              </blockquote>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At the same time, I walked a different path. Learning and embracing my heritage. Reconnecting with nature, with what matters when you strip away the corporate script. That journey shaped everything Urban Refit stands for.
              </p>
            </section>

            {/* The Why Section */}
            <section>
              <h2 className="text-3xl font-serif font-bold mb-6 text-foreground">Why This Exists</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                You know the feeling. Grinding through an apprenticeship. Drowning in university debt. Stacking shifts while figuring out your next move. The system wasn't built for us – it was built to extract from us.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Urban Refit exists because I refused to keep funding the machine that chews through people and planet. Every garment here gets a second life. Affordable. Durable. Built for tight budgets and big dreams.
              </p>
            </section>

            {/* The Promise Section */}
            <section className="bg-primary/5 rounded-2xl p-8 md:p-12">
              <div className="space-y-4">
                <p className="text-2xl font-serif font-semibold text-foreground">
                  You don't need money to dress well.
                </p>
                <p className="text-2xl font-serif font-semibold text-foreground">
                  You don't need to be complicit to survive.
                </p>
                <p className="text-lg text-primary font-medium pt-4">
                  Let us prove it.
                </p>
              </div>
            </section>

            {/* Values Section */}
            <section>
              <h2 className="text-3xl font-serif font-bold mb-8 text-foreground">What We Stand For</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Recycle className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Zero Waste</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Quality textiles stay out of landfills. Every piece gets another chapter in someone's wardrobe.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Community First</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    5% of every sale goes directly to our thrift store partners. Their mission fuels ours.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Curated Quality</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Hand-selected premium brands only. No fast fashion. No compromises on quality.
                  </p>
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="border-t border-border pt-16">
              <h2 className="text-3xl font-serif font-bold mb-6 text-foreground">How It Works</h2>
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We partner with local NZ thrift stores, hand-selecting the finest pieces from their inventory. Each item is professionally photographed, measured, and described with the detail you need to buy with confidence.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  When you shop with Urban Refit, you're getting quality clothing at a fraction of retail. You're supporting the thrift stores that anchor communities. You're keeping textiles out of landfills. And you're reclaiming your right to define your own style – without breaking the bank.
                </p>
              </div>
            </section>

            {/* CTA Section */}
            <section className="text-center py-8">
              <Link 
                href="/shop" 
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Start Shopping
              </Link>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
