import Layout from "@/components/Layout";

export default function About() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-accent/10 to-background py-16 md:py-24">
          <div className="container max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-foreground">
              About Urban Refit
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Built from nothing. Designed for those grinding through the system.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container max-w-4xl py-16 md:py-24">
          <div className="space-y-12">
            {/* Founder Story Section */}
            <section>
              <h2 className="text-3xl font-serif font-bold mb-6 text-foreground">The Beginning</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                Urban Refit began in a flat where I ate two-minute noodles, teaching myself to code properly. Shopify, APIs, the works. Then AI arrived, and my tech brain met my creative instincts. Perfect storm. Dangerous enough to be useful.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mb-4 italic">
                E ako ana au, e whakakotahi ana ki taku Ko Papa.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                At the same time, I walked a different path. Learning and embracing my roots. Reconnecting with nature, with what matters when you strip away the corporate script.
              </p>
            </section>

            {/* The Why Section */}
            <section>
              <h2 className="text-3xl font-serif font-bold mb-6 text-foreground">Why This Exists</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                I am not a handbrake person. You know how it feels to be grinding an apprenticeship, drowning in university debt, or stacking Maccas shifts while deciding on your next move. The system is not built for us.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                This brand exists because I refused to keep funding the machine that chews through people and planet. Every garment here gets a second life. Affordable. Durable. Built for tight budgets and big dreams.
              </p>
            </section>

            {/* The Promise Section */}
            <section className="border-l-4 border-foreground pl-6">
              <p className="text-base font-serif text-foreground leading-relaxed mb-4">
                You do not need money to dress well.
              </p>
              <p className="text-base font-serif text-foreground leading-relaxed">
                You do not need to be complicit to survive.
              </p>
            </section>

            {/* Call to Action */}
            <section>
              <p className="text-base text-foreground font-semibold">
                Let us prove it.
              </p>
            </section>

            {/* Values Section */}
            <section className="pt-8 border-t border-border">
              <h2 className="text-3xl font-serif font-bold mb-6 text-foreground">What We Stand For</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">No Waste</h3>
                  <p className="text-base text-muted-foreground">
                    Quality textiles stay out of landfills. Every piece gets another chapter.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">Community First</h3>
                  <p className="text-base text-muted-foreground">
                    10% of every sale goes back to our thrift store partners. Their mission is our mission.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">Real Quality</h3>
                  <p className="text-base text-muted-foreground">
                    Hand-selected pieces. Premium brands. No fast fashion garbage.
                  </p>
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section>
              <h2 className="text-3xl font-serif font-bold mb-6 text-foreground">The Model</h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                We partner with local thrift stores, hand-selecting the finest pieces from their inventory. Each item is photographed, measured, and described with the detail you need to buy with confidence.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                When you purchase from Urban Refit, you are getting quality clothing at a fraction of retail price. You are supporting the thrift stores that anchor communities. You are keeping textiles out of landfills. And you are reclaiming your right to define your own style without breaking the bank.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
