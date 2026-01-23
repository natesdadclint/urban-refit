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
            <p className="text-xl text-muted-foreground leading-relaxed">
              Discover our mission to make premium fashion accessible while supporting sustainable practices and our community partners.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container max-w-4xl py-16 md:py-24">
          <div className="space-y-12">
            {/* Mission Section */}
            <section>
              <h2 className="text-3xl font-serif font-bold mb-4 text-foreground">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Urban Refit is dedicated to making high-end fashion accessible to everyone while championing sustainability and supporting local communities.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe that premium clothing deserves a second life. By carefully curating pieces from local thrift stores, we give quality garments new homes while ensuring that 10% of every sale returns to the thrift stores that make our collection possible.
              </p>
            </section>

            {/* Values Section */}
            <section>
              <h2 className="text-3xl font-serif font-bold mb-6 text-foreground">Our Values</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Sustainability</h3>
                  <p className="text-muted-foreground">
                    We keep quality textiles out of landfills by giving them new life and new owners.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Community</h3>
                  <p className="text-muted-foreground">
                    We support local thrift stores and their missions through our profit-sharing model.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Quality</h3>
                  <p className="text-muted-foreground">
                    Every piece is hand-selected by our curator to ensure premium quality and style.
                  </p>
                </div>
              </div>
            </section>

            {/* Story Section */}
            <section>
              <h2 className="text-3xl font-serif font-bold mb-4 text-foreground">Our Story</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                It started with a simple observation: men hate shopping. Not because they lack style, but because the traditional retail experience was never designed for them. Hours wandering through crowded stores, overwhelming choices, and the unspoken expectation that someone else would make the decisions. For too long, men outsourced their wardrobes to partners, settling for whatever was convenient rather than what truly fit their identity.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Urban Refit was born from a different vision. We saw the untapped potential in thrift stores across the country, where premium brands sat waiting for someone with an eye for quality. We saw men who wanted to dress well but needed a simpler path to get there. And we saw an opportunity to build something that served both.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Our model is straightforward: we partner with local thrift stores, hand-selecting the finest pieces from their inventory. Each item is photographed, measured, and described with the detail you need to buy with confidence. When you purchase from Urban Refit, you are not just getting quality clothing at a fraction of retail price. You are supporting the thrift stores that anchor communities, keeping textiles out of landfills, and reclaiming your right to define your own style.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Every sale compounds our impact. Ten percent returns directly to our thrift store partners, funding their charitable missions. The clothing finds new life with owners who appreciate its quality. And slowly, we are proving that sustainable fashion is not a compromise. It is an upgrade.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                This is Urban Refit. Style on your terms. Shopping that respects your time. Fashion that gives back. Welcome to the movement.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
