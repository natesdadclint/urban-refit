import Layout from "@/components/Layout";

export default function Sustainability() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-accent/10 to-background py-16 md:py-24">
          <div className="container max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-foreground">
              Sustainability
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Urban Refit is committed to reducing fashion waste and supporting the circular economy.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container max-w-4xl py-16 md:py-24">
          <div className="space-y-12">
            {/* Impact */}
            <section>
              <h2 className="text-3xl font-serif font-bold mb-4 text-foreground">Our Environmental Impact</h2>
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
                  <p className="text-base text-muted-foreground">Pounds of waste diverted from landfills</p>
                </div>
                <div className="space-y-3">
                  <div className="text-4xl font-bold text-primary">0</div>
                  <p className="text-base text-muted-foreground">Gallons of water saved</p>
                </div>
              </div>
            </section>

            {/* Circular Economy */}
            <section>
              <h2 className="text-3xl font-serif font-bold mb-4 text-foreground">The Circular Economy</h2>
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
              <h2 className="text-3xl font-serif font-bold mb-4 text-foreground">How You Can Help</h2>
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
              <h2 className="text-2xl font-serif font-bold text-foreground">Our Commitment</h2>
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
