import Layout from "@/components/Layout";
import { Link } from "wouter";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";
import { ArrowRight, Heart, Leaf, Code, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Founder() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Meet the Founder"
          subtitle="The story behind Urban Refit — and why this platform exists."
        >
          <PageBreadcrumb
            segments={[
              { label: "About Us", href: "/about" },
              { label: "Meet the Founder" },
            ]}
            className="mb-4"
          />
        </PageHeader>

        <div className="container max-w-4xl py-16 md:py-24">
          {/* Opening */}
          <section className="mb-16">
            <SectionHeader title="Kia ora. I'm Clint." />
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                I built Urban Refit from a flat where two-minute noodles were the main course and learning to code was the side hustle. No investors. No business degree. Just a laptop, a stubborn refusal to accept the status quo, and a growing conviction that the way we consume clothing is fundamentally broken.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                I taught myself Shopify, APIs, the whole stack. Then AI arrived, and suddenly my tech brain met my creative instincts. Perfect storm. Dangerous enough to be useful.
              </p>
            </div>
          </section>

          {/* Te Ao Māori */}
          <section className="mb-16">
            <SectionHeader title="Reconnecting With Roots" />
            <blockquote className="border-l-4 border-primary pl-6 py-4 my-8 bg-accent/5 rounded-r-xl">
              <p className="text-xl font-serif italic text-foreground leading-relaxed">
                E ako ana au, e whakakotahi ana ki taku Ko Papa.
              </p>
              <p className="text-base text-muted-foreground mt-3">
                I am learning, reconnecting with my roots.
              </p>
            </blockquote>
            <div className="space-y-6">
              <p className="text-base text-muted-foreground leading-relaxed">
                While I was building the technical side of Urban Refit, I was walking a different path in parallel. Learning and embracing my heritage. Reconnecting with nature, with the land, with what matters when you strip away the corporate script.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                In te ao Māori, the concept of kaitiakitanga — guardianship of the natural world — is not a marketing angle. It is a responsibility. When I look at the fashion industry dumping 92 million tonnes of textile waste into landfills every year, kaitiakitanga is not optional. It is urgent.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                That journey shaped everything Urban Refit stands for. This is not just a business. It is an expression of values that go deeper than commerce.
              </p>
            </div>
          </section>

          {/* The Why */}
          <section className="mb-16">
            <SectionHeader title="Why This Exists" />
            <div className="space-y-6">
              <p className="text-base text-muted-foreground leading-relaxed">
                You know the feeling. Grinding through an apprenticeship. Drowning in university debt. Stacking shifts while figuring out your next move. The system was not built for us — it was built to extract from us.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                I watched mates spend money they did not have on clothes designed to fall apart in six months. Fast fashion is not cheap — it is a debt trap disguised as a bargain. And the environmental cost is staggering.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Urban Refit exists because I refused to keep funding the machine that chews through people and planet. Every garment here gets a second life. Affordable. Durable. Built for tight budgets and big dreams.
              </p>
            </div>
          </section>

          {/* The Promise */}
          <section className="mb-16 bg-foreground text-background rounded-2xl p-8 md:p-12">
            <div className="space-y-4">
              <p className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
                You don't need money to dress well.
              </p>
              <p className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
                You don't need to be complicit to survive.
              </p>
              <p className="text-lg font-medium text-background/70 pt-4">
                Let us prove it.
              </p>
            </div>
          </section>

          {/* What Drives Urban Refit */}
          <section className="mb-16">
            <SectionHeader
              title="What Drives Urban Refit"
              subtitle="The principles behind every decision we make."
            />
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                  </div>
                  <SectionHeader title="Kaitiakitanga" level="h3" className="!mb-0" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Guardianship of the natural world. Every garment we circulate is one less in a landfill. We measure success not just in sales, but in waste diverted and resources conserved.
                </p>
              </div>

              <div className="border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <SectionHeader title="Community" level="h3" className="!mb-0" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We partner with local thrift stores — the organisations that anchor communities. 10% of every sale goes back to the store that sourced the garment. Their mission fuels ours.
                </p>
              </div>

              <div className="border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-amber-600" />
                  </div>
                  <SectionHeader title="Honesty" level="h3" className="!mb-0" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every item is graded, measured, and described with full transparency. If there is a flaw, we tell you. If a garment does not meet our standards, it does not get listed. No exceptions.
                </p>
              </div>

              <div className="border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Code className="w-5 h-5 text-purple-600" />
                  </div>
                  <SectionHeader title="Technology" level="h3" className="!mb-0" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  I built this platform myself — every line of code, every design decision. That means we can move fast, iterate based on real feedback, and build features that actually matter to our customers.
                </p>
              </div>
            </div>
          </section>

          {/* The Vision */}
          <section className="mb-16">
            <SectionHeader title="Where We're Going" />
            <div className="space-y-6">
              <p className="text-base text-muted-foreground leading-relaxed">
                Urban Refit is just getting started. The vision is a platform where every garment has a traceable lifecycle — from its first owner to its last. Where buying secondhand is not a compromise but a conscious choice. Where the circular economy is not a buzzword on a corporate sustainability report, but the actual way things work.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                We are building token rewards, courier returns, charity partnerships, and AI-powered style recommendations — all designed to keep garments circulating and customers coming back. Not because of marketing tricks, but because the experience is genuinely better.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Check our{" "}
                <Link href="/roadmap" className="text-primary hover:underline font-medium">
                  public roadmap
                </Link>{" "}
                to see what is coming next.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-16 border border-border rounded-xl p-8 md:p-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <div>
                <SectionHeader title="Get in Touch" className="!mb-2" />
                <p className="text-base text-muted-foreground leading-relaxed mb-4">
                  I read every message that comes through. Whether it is feedback on the platform, a question about a product, or just a yarn about sustainable fashion — I am here.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline" size="lg">
                    <Link href="/contact">
                      Contact Us
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="mailto:help@urbanrefit.store">
                      help@urbanrefit.store
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Cross-links */}
          <section className="border-t border-border pt-16">
            <SectionHeader title="Learn More About Urban Refit" centered />
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Link href="/our-process">
                <div className="group border border-border rounded-xl p-6 hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer">
                  <SectionHeader title="Our Process" level="h3" className="!mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    From thrift store shelf to your wardrobe — every step is intentional and transparent.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    View Process <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
              <Link href="/quality-standards">
                <div className="group border border-border rounded-xl p-6 hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer">
                  <SectionHeader title="Quality Standards" level="h3" className="!mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Our condition grading system — what Like New, Excellent, Good, and Fair actually mean.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    View Standards <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-16 text-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/shop">
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </section>
        </div>
      </div>
    </Layout>
  );
}
