import Layout from "@/components/Layout";
import { Link } from "wouter";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";
import { Search, Camera, Ruler, Tag, Package, Truck, ArrowRight, ShieldCheck, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";

const processSteps = [
  {
    step: 1,
    icon: Search,
    title: "Sourcing",
    subtitle: "Partnering with local thrift stores",
    description:
      "Every garment begins its Urban Refit journey at one of our partner thrift stores across New Zealand. Our team visits each store regularly, hand-selecting pieces that meet our brand and quality criteria. We focus on premium labels — the kind of clothing that was built to last and still has life left in it.",
    detail:
      "We do not accept bulk lots or unsorted donations. Every item is individually chosen by someone who understands men's fashion, fabric quality, and what our customers actually want to wear.",
  },
  {
    step: 2,
    icon: ShieldCheck,
    title: "Inspection",
    subtitle: "Quality triage and authentication",
    description:
      "Once sourced, every garment goes through a hands-on inspection process. We check stitching, zippers, buttons, fabric integrity, and overall condition. We also verify brand authenticity by examining labels, tags, and construction details.",
    detail:
      "Items that do not pass inspection are returned to the thrift store or responsibly recycled. We would rather list fewer items than compromise on quality. Our condition grading system (Like New, Excellent, Good, Fair) is applied at this stage.",
  },
  {
    step: 3,
    icon: Camera,
    title: "Photography",
    subtitle: "Consistent, honest product imagery",
    description:
      "Approved items are cleaned, pressed where appropriate, and photographed against a neutral background. Each listing includes a full-body shot and a close-up detail image showing fabric texture, stitching, or any notable features.",
    detail:
      "We photograph in natural light to ensure colours are as accurate as possible. Any imperfections — no matter how minor — are documented and disclosed in the listing. What you see is what you get.",
  },
  {
    step: 4,
    icon: Ruler,
    title: "Measurement",
    subtitle: "Precise sizing you can trust",
    description:
      "Every garment is measured flat-lay style across key dimensions: chest, length, sleeve, waist, and inseam (where applicable). These measurements are included in the product listing alongside the tagged size.",
    detail:
      "Secondhand sizing varies between brands and eras. Tagged sizes can be unreliable. Our flat-lay measurements give you the real numbers so you can buy with confidence, regardless of what the label says.",
  },
  {
    step: 5,
    icon: Tag,
    title: "Listing",
    subtitle: "Detailed descriptions and fair pricing",
    description:
      "Each item is listed with a comprehensive description covering brand, material, condition grade, measurements, and any notable features or flaws. Pricing is calculated from the original acquisition cost plus our curation markup, with 10% allocated back to the thrift store partner.",
    detail:
      "We write descriptions the way we would want to read them — honest, specific, and useful. No vague marketing language. If a shirt has a small mark on the cuff, we will tell you about it.",
  },
  {
    step: 6,
    icon: Package,
    title: "Packaging",
    subtitle: "Careful handling, minimal waste",
    description:
      "Sold items are carefully folded and packaged using recycled and recyclable materials. We avoid unnecessary plastic. Each order includes a thank-you card with care instructions and information about our token reward programme.",
    detail:
      "Our packaging is designed to protect the garment in transit while keeping waste to a minimum. We use compostable mailer bags and recycled tissue paper.",
  },
  {
    step: 7,
    icon: Truck,
    title: "Delivery",
    subtitle: "Tracked shipping across New Zealand",
    description:
      "Orders are dispatched within 1–2 business days via tracked courier. You will receive a tracking number as soon as your order ships. Free shipping is available on orders over NZ$50.",
    detail:
      "We ship nationwide, including rural addresses (rural delivery surcharge may apply). International shipping is not currently available, but it is on our roadmap.",
  },
];

export default function OurProcess() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Our Process"
          subtitle="From thrift store shelf to your wardrobe — every step is intentional, transparent, and quality-driven."
        >
          <PageBreadcrumb
            segments={[
              { label: "About Us", href: "/about" },
              { label: "Our Process" },
            ]}
            className="mb-4"
          />
        </PageHeader>

        {/* Process Timeline */}
        <div className="container max-w-4xl py-16 md:py-24">
          <div className="space-y-0">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === processSteps.length - 1;
              return (
                <div key={step.step} className="relative">
                  {/* Connector line */}
                  {!isLast && (
                    <div className="absolute left-6 top-16 bottom-0 w-px bg-border hidden md:block" />
                  )}

                  <div className="flex gap-6 md:gap-8 pb-12 md:pb-16">
                    {/* Step indicator */}
                    <div className="flex-shrink-0 hidden md:flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-serif font-bold text-lg">
                        {step.step}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3 md:hidden">
                        <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-serif font-bold text-sm flex-shrink-0">
                          {step.step}
                        </div>
                        <div>
                          <SectionHeader title={step.title} className="!mb-0" />
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {step.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="hidden md:block">
                        <SectionHeader title={step.title} />
                        <p className="text-sm font-medium text-primary -mt-4 mb-4">
                          {step.subtitle}
                        </p>
                      </div>

                      <div className="bg-card border border-border rounded-xl p-6 md:p-8">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="space-y-3">
                            <p className="text-base text-foreground leading-relaxed">
                              {step.description}
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-4">
                              {step.detail}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Circular Economy Callout */}
          <section className="mt-8 bg-primary/5 rounded-2xl p-8 md:p-12">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Recycle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <SectionHeader
                  title="The Cycle Continues"
                  subtitle="Our process does not end at delivery."
                />
                <p className="text-base text-muted-foreground leading-relaxed mb-4">
                  When you are done with a garment, send it back through our{" "}
                  <Link href="/courier-return" className="text-primary hover:underline font-medium">
                    Courier Return programme
                  </Link>
                  . We will inspect it, relist it, and reward you with Urban Refit Tokens. The garment gets another life. You get credit towards your next purchase. Nothing goes to waste.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  This is the circular economy in action — not as a marketing buzzword, but as the foundation of how we operate.
                </p>
              </div>
            </div>
          </section>

          {/* Trust Links */}
          <section className="mt-16 border-t border-border pt-16">
            <SectionHeader
              title="Learn More"
              subtitle="Explore the standards and story behind Urban Refit."
              centered
            />
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Link href="/quality-standards">
                <div className="group border border-border rounded-xl p-6 hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer">
                  <SectionHeader
                    title="Quality Standards"
                    level="h3"
                    className="!mb-2"
                  />
                  <p className="text-sm text-muted-foreground mb-4">
                    Our condition grading system explained — what Like New, Excellent, Good, and Fair actually mean.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    View Standards <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
              <Link href="/founder">
                <div className="group border border-border rounded-xl p-6 hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer">
                  <SectionHeader
                    title="Meet the Founder"
                    level="h3"
                    className="!mb-2"
                  />
                  <p className="text-sm text-muted-foreground mb-4">
                    The personal story and kaupapa behind Urban Refit — why this platform exists.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    Read the Story <ArrowRight className="w-4 h-4" />
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
