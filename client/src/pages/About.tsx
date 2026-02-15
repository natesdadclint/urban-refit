import Layout from "@/components/Layout";
import { Link } from "wouter";
import { ArrowLeft, Recycle, Users, Sparkles } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";

export default function About() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <PageHeader
          title="About Urban Refit"
          subtitle="Built from nothing. Designed for those grinding through the system."
        >
          <Link href="/" className="inline-flex items-center gap-2 text-base font-medium text-foreground hover:text-primary transition-colors mb-6 py-2 px-3 -ml-3 rounded-lg hover:bg-accent/20">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </PageHeader>

        {/* Main Content */}
        <div className="container max-w-4xl py-16 md:py-24">
          <div className="space-y-16">
            {/* Founder Story Section */}
            <section>
              <SectionHeader title="The Beginning" />
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
              <SectionHeader title="Why This Exists" />
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
              <SectionHeader title="What We Stand For" />
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
                    10% of every sale goes directly to our thrift store partners, and another 10% supports our charity partners. Their mission fuels ours.
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
              <SectionHeader title="How It Works" />
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We partner with local NZ thrift stores, hand-selecting the finest pieces from their inventory. Each item is professionally photographed, measured, and described with the detail you need to buy with confidence.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  When you shop with Urban Refit, you're getting quality clothing at a fraction of retail. You're supporting the thrift stores that anchor communities. You're keeping textiles out of landfills. And you're reclaiming your right to define your own style – without breaking the bank.
                </p>
              </div>
            </section>

            {/* Trust Pages */}
            <section className="border-t border-border pt-16">
              <SectionHeader title="Dig Deeper" subtitle="Learn more about how we operate." centered />
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <Link href="/our-process">
                  <div className="group border border-border rounded-xl p-6 hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer h-full">
                    <h3 className="text-lg font-serif font-semibold tracking-tight text-foreground mb-2">Our Process</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      From thrift store shelf to your wardrobe — every step explained.
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      Learn More
                    </span>
                  </div>
                </Link>
                <Link href="/quality-standards">
                  <div className="group border border-border rounded-xl p-6 hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer h-full">
                    <h3 className="text-lg font-serif font-semibold tracking-tight text-foreground mb-2">Quality Standards</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our condition grading system — what each grade means for you.
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      View Standards
                    </span>
                  </div>
                </Link>
                <Link href="/founder">
                  <div className="group border border-border rounded-xl p-6 hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer h-full">
                    <h3 className="text-lg font-serif font-semibold tracking-tight text-foreground mb-2">Meet the Founder</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      The personal story and kaupapa behind Urban Refit.
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      Read the Story
                    </span>
                  </div>
                </Link>
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
