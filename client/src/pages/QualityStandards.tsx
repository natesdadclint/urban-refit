import Layout from "@/components/Layout";
import { Link } from "wouter";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";
import { Star, CheckCircle, AlertCircle, Info, ArrowRight, ShieldCheck, Eye, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";

const conditionGrades = [
  {
    grade: "Like New",
    rating: 5,
    colour: "bg-emerald-500",
    colourLight: "bg-emerald-50 border-emerald-200",
    colourText: "text-emerald-700",
    icon: Star,
    summary: "Appears unworn or minimally worn with no visible flaws.",
    details: [
      "May still have original tags attached",
      "No signs of wear, fading, or pilling",
      "All buttons, zippers, and hardware fully functional and pristine",
      "Fabric feels new to the touch with no stretching or distortion",
      "No odours, stains, or marks of any kind",
    ],
    expectation:
      "You would not be able to distinguish this item from one purchased new. These are typically items that were bought and never worn, or worn once for a brief occasion.",
  },
  {
    grade: "Excellent",
    rating: 4,
    colour: "bg-blue-500",
    colourLight: "bg-blue-50 border-blue-200",
    colourText: "text-blue-700",
    icon: CheckCircle,
    summary: "Gently worn with minimal signs of use. No significant flaws.",
    details: [
      "Very light signs of wear that are only noticeable on close inspection",
      "Fabric in strong condition with no pilling, thinning, or fading",
      "All closures and hardware fully functional",
      "No stains, holes, or repairs",
      "May show very slight softening of fabric from a few washes",
    ],
    expectation:
      "This item has been worn a handful of times and cared for well. It looks and feels close to new. The kind of piece you would be happy to receive as a gift.",
  },
  {
    grade: "Good",
    rating: 3,
    colour: "bg-amber-500",
    colourLight: "bg-amber-50 border-amber-200",
    colourText: "text-amber-700",
    icon: Info,
    summary: "Shows normal wear consistent with regular use. Still in solid wearable condition.",
    details: [
      "Visible but minor signs of wear (light fading, slight pilling, softened fabric)",
      "May have minor imperfections that do not affect wearability or appearance at arm's length",
      "All closures and hardware functional",
      "Any flaws are noted and photographed in the listing",
      "Priced to reflect the condition — strong value for the brand and quality",
    ],
    expectation:
      "This is a well-loved garment that still has plenty of life left. It has been worn regularly but maintained. Think of your favourite shirt after a year of weekend wear — that is the condition level.",
  },
  {
    grade: "Fair",
    rating: 2,
    colour: "bg-orange-500",
    colourLight: "bg-orange-50 border-orange-200",
    colourText: "text-orange-700",
    icon: AlertCircle,
    summary: "Visible wear, minor flaws, or imperfections. Wearable and functional. Priced accordingly.",
    details: [
      "Noticeable signs of wear (fading, pilling, minor staining, or small repairs)",
      "May have cosmetic flaws that are clearly documented in photos and description",
      "Structurally sound — still wearable and functional",
      "All significant flaws are disclosed upfront",
      "Priced significantly below market to reflect condition",
    ],
    expectation:
      "This item shows its history. It is ideal for someone who values the brand and does not mind visible character. Perfect for workwear, weekend projects, or layering. Every flaw is disclosed — no surprises.",
  },
];

const inspectionChecklist = [
  { area: "Labels & Tags", check: "Brand authenticity verified, care labels intact, size tags readable" },
  { area: "Stitching", check: "All seams secure, no loose threads, no unravelling at stress points" },
  { area: "Fabric", check: "No holes, tears, thinning, or excessive pilling; colour consistent" },
  { area: "Closures", check: "Zippers, buttons, snaps, and hooks all functional and secure" },
  { area: "Stains & Marks", check: "Any marks identified, documented, and disclosed in listing" },
  { area: "Odour", check: "Clean, fresh, no residual odours from previous ownership" },
  { area: "Shape & Fit", check: "No permanent stretching, warping, or distortion of the garment" },
];

export default function QualityStandards() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Quality Standards"
          subtitle="Every garment is inspected, graded, and described with the honesty you deserve. No surprises."
        >
          <PageBreadcrumb
            segments={[
              { label: "About Us", href: "/about" },
              { label: "Quality Standards" },
            ]}
            className="mb-4"
          />
        </PageHeader>

        <div className="container max-w-4xl py-16 md:py-24">
          {/* Intro */}
          <section className="mb-16">
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Buying secondhand online requires trust. You cannot touch the fabric, check the stitching, or try it on before you buy. That is why we grade every item against a clear, consistent standard — and disclose everything upfront.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Our grading system is applied during the{" "}
              <Link href="/our-process" className="text-primary hover:underline font-medium">
                inspection stage of our process
              </Link>
              . Every item is assessed by the same criteria, photographed honestly, and described in plain language.
            </p>
          </section>

          {/* Condition Grading Scale */}
          <section className="mb-16">
            <SectionHeader
              title="Condition Grading Scale"
              subtitle="Four grades, clearly defined. Every listing tells you exactly what you are getting."
            />

            <div className="space-y-8 mt-8">
              {conditionGrades.map((grade) => {
                const Icon = grade.icon;
                return (
                  <div
                    key={grade.grade}
                    className={`border rounded-xl overflow-hidden ${grade.colourLight}`}
                  >
                    {/* Grade Header */}
                    <div className="p-6 md:p-8">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-full ${grade.colour} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-serif font-bold tracking-tight text-foreground">
                              {grade.grade}
                            </h3>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < grade.rating
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-neutral-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className={`text-base font-medium ${grade.colourText}`}>
                            {grade.summary}
                          </p>
                        </div>
                      </div>

                      {/* What to expect */}
                      <div className="ml-0 md:ml-16">
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">
                          {grade.expectation}
                        </p>

                        <div className="space-y-2">
                          {grade.details.map((detail, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-foreground/50 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-foreground/80">{detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Inspection Checklist */}
          <section className="mb-16">
            <SectionHeader
              title="Our Inspection Checklist"
              subtitle="Every garment passes through this checklist before it earns a listing on Urban Refit."
            />

            <div className="border border-border rounded-xl overflow-hidden mt-8">
              <div className="grid grid-cols-1 divide-y divide-border">
                {inspectionChecklist.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-5 hover:bg-accent/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4 text-foreground/60" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm mb-0.5">
                        {item.area}
                      </p>
                      <p className="text-sm text-muted-foreground">{item.check}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Photography Standards */}
          <section className="mb-16">
            <SectionHeader
              title="Photography Standards"
              subtitle="What you see is what you get. Our photography is designed for honesty, not flattery."
            />

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shirt className="w-5 h-5 text-primary" />
                  </div>
                  <SectionHeader title="Image 1: Full View" level="h3" className="!mb-0" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A complete shot of the garment against a clean, neutral background. Shows the overall shape, colour, and proportions. This is the image that appears in the shop grid.
                </p>
              </div>
              <div className="border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-primary" />
                  </div>
                  <SectionHeader title="Image 2: Detail Shot" level="h3" className="!mb-0" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A close-up of the fabric, stitching, label, or any notable feature. If there is a flaw, this is where you will see it. We do not hide imperfections — we document them.
                </p>
              </div>
            </div>
          </section>

          {/* Authenticity Guarantee */}
          <section className="mb-16 bg-primary/5 rounded-2xl p-8 md:p-12">
            <SectionHeader title="Authenticity Guarantee" />
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              Every branded item is checked for authenticity during inspection. We examine labels, stitching patterns, hardware, and construction details against known brand standards.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              If an item you receive turns out to be inauthentic, we offer a full refund including shipping costs, plus 10 bonus Urban Refit Tokens as a gesture of goodwill. Read the full details in our{" "}
              <Link href="/terms" className="text-primary hover:underline font-medium">
                Terms of Service (Section 5A)
              </Link>
              .
            </p>
            <p className="text-sm text-muted-foreground italic">
              We do our best. The nature of secondhand sourcing means occasional errors may occur. When they do, we stand behind our customers and prioritise a fair, swift resolution.
            </p>
          </section>

          {/* Cross-links */}
          <section className="border-t border-border pt-16">
            <SectionHeader
              title="Related Pages"
              centered
            />
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Link href="/our-process">
                <div className="group border border-border rounded-xl p-6 hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer">
                  <SectionHeader title="Our Process" level="h3" className="!mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Follow a garment from thrift store shelf to your wardrobe — every step explained.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    View Process <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
              <Link href="/refund-policy">
                <div className="group border border-border rounded-xl p-6 hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer">
                  <SectionHeader title="Refund Policy" level="h3" className="!mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Our returns process for secondhand items — clear, fair, and straightforward.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    Read Policy <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-16 text-center">
            <Link href="/shop">
              <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-8 py-6 text-base">
                Browse Our Collection
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </section>
        </div>
      </div>
    </Layout>
  );
}
