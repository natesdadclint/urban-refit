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
              <p className="text-lg text-muted-foreground leading-relaxed">
                [Your company story goes here. Share how Urban Refit started, what inspired you to create the platform, and your vision for the future of sustainable fashion.]
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
