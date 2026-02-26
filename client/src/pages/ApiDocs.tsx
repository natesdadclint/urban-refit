import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ApiDocs() {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch("/api/products/330001");
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">API Documentation</h1>

        <div className="grid gap-8">
          {/* API Endpoints */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Available Endpoints</h2>
            <div className="space-y-4">
              <div>
                <p className="font-mono bg-muted p-3 rounded mb-2">GET /api/products</p>
                <p className="text-sm text-muted-foreground">Returns all available products</p>
              </div>
              <div>
                <p className="font-mono bg-muted p-3 rounded mb-2">GET /api/products/:id</p>
                <p className="text-sm text-muted-foreground">Returns a single product by ID</p>
              </div>
            </div>
          </Card>

          {/* Sample Product JSON */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Sample Product Response</h2>
            {loading ? (
              <p>Loading...</p>
            ) : product ? (
              <div>
                <div className="mb-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open("/api/products/330001", "_blank");
                    }}
                  >
                    View Live JSON
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded overflow-auto max-h-96 text-sm">
                  {JSON.stringify(product, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-red-500">Failed to load product</p>
            )}
          </Card>

          {/* All Products */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">All Products</h2>
            <Button
              variant="outline"
              onClick={() => {
                window.open("/api/products", "_blank");
              }}
            >
              View All Products JSON
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
