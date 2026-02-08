import Layout from "@/components/Layout";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";

export default function Sustainability() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <PageHeader
          title="Sustainability"
          subtitle="Urban Refit is committed to reducing fashion waste and supporting the circular economy."
        >
          <Link href="/" className="inline-flex items-center gap-2 text-base font-medium text-foreground hover:text-primary transition-colors mb-6 py-2 px-3 -ml-3 rounded-lg hover:bg-accent/20">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </PageHeader>

        {/* Main Content */}
        <div className="container max-w-4xl py-16 md:py-24">
          <div className="space-y-12">
            {/* Impact */}
            <section>
              <SectionHeader title="Our Environmental Impact" />
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                The fashion industry is one of the world's largest polluters. By extending the life of quality clothing, Urban Refit helps reduce waste, conserve resources, and support a more sustainable future.
              </p>
              <div className="grid md:grid-cols-3 gap-8 mt-8">
                <div className="space-y-3">
                  <div className="text-4xl font-bold text-primary">0</div>
                  <p className="text-base text-muted-foreground">Garments given a second life</p>
                </div>
                <div className="space-y-3">
                  <div className="text-4xl font-bold text-primary">0</div>
                  <p className="text-base text-muted-foreground">Kilograms of waste diverted from landfills</p>
                </div>
                <div className="space-y-3">
                  <div className="text-4xl font-bold text-primary">0</div>
                  <p className="text-base text-muted-foreground">Liters of water saved</p>
                </div>
              </div>
            </section>

            {/* Circular Economy */}
            <section>
              <SectionHeader title="The Circular Economy" />
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                Urban Refit operates on circular economy principles, where clothing is continuously cycled through new owners rather than discarded. This model:
              </p>
              <ul className="space-y-3 text-base text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Reduces the demand for new clothing production</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Conserves water, energy, and raw materials</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Reduces carbon emissions from manufacturing</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Supports local communities through thrift store partnerships</span>
                </li>
              </ul>
            </section>

            {/* How You Can Help */}
            <section>
              <SectionHeader title="How You Can Help" />
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-6 space-y-2">
                  <h3 className="text-base font-semibold text-foreground">Shop Secondhand</h3>
                  <p className="text-base text-muted-foreground">
                    Every purchase extends the life of quality clothing and reduces demand for new production.
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-6 space-y-2">
                  <h3 className="text-base font-semibold text-foreground">Support Local Thrift Stores</h3>
                  <p className="text-base text-muted-foreground">
                    By shopping with Urban Refit, you support the thrift stores that make our collection possible.
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-6 space-y-2">
                  <h3 className="text-base font-semibold text-foreground">Donate Quality Clothing</h3>
                  <p className="text-base text-muted-foreground">
                    Give your quality pieces a second life by donating them to local thrift stores.
                  </p>
                </div>
              </div>
            </section>

            {/* Commitment */}
            <section className="bg-accent/5 rounded-lg p-8 space-y-4">
              <SectionHeader title="Our Commitment" />
              <p className="text-base text-muted-foreground">
                We're committed to transparency and continuous improvement in our sustainability practices. We track our environmental impact and share our progress with our community.
              </p>
              <p className="text-base text-muted-foreground">
                [Your sustainability metrics and commitments will be displayed here.]
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
