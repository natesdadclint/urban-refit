import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Sparkles, RefreshCw, TrendingUp, Package, Store, DollarSign } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";

export default function AdminInsights() {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: salesData } = trpc.analytics.sales.useQuery();
  const { data: productData } = trpc.analytics.products.useQuery();
  const { data: thriftStores } = trpc.thriftStore.listAll.useQuery();
  const { data: insightsData, refetch: refetchInsights } = trpc.analytics.insights.useQuery(
    undefined,
    { enabled: false }
  );

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    try {
      await refetchInsights();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AdminLayout title="AI-Powered Insights">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
        <p className="text-muted-foreground">
          Get intelligent analysis of your business performance powered by AI.
        </p>
        <Button
          onClick={handleGenerateInsights}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Insights
            </>
          )}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${salesData ? Number(salesData.totalSales).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesData?.orderCount || 0} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${salesData && salesData.orderCount > 0 ? (Number(salesData.totalSales) / salesData.orderCount).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Markup
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productData ? Number(productData.avgMarkup).toFixed(1) : "0"}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Partner Stores
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {thriftStores?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Brands */}
        <Card>
          <CardHeader>
            <CardTitle>Top Brands</CardTitle>
          </CardHeader>
          <CardContent>
            {productData?.topBrands && productData.topBrands.length > 0 ? (
              <div className="space-y-3">
                {productData.topBrands.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{item.brand || "Unknown"}</span>
                    <span className="text-muted-foreground">{item.count} items</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No brand data available yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Products by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            {productData?.productsByStatus && productData.productsByStatus.length > 0 ? (
              <div className="space-y-3">
                {productData.productsByStatus.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium capitalize">{item.status}</span>
                    <span className="text-muted-foreground">{item.count} items</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No inventory data available yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Thrift Stores */}
        <Card>
          <CardHeader>
            <CardTitle>Top Partner Stores</CardTitle>
          </CardHeader>
          <CardContent>
            {salesData?.topThriftStores && salesData.topThriftStores.length > 0 ? (
              <div className="space-y-3">
                {salesData.topThriftStores.slice(0, 5).map((store: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{store.storeName || 'Unknown Store'}</span>
                    <div className="text-right">
                      <span className="text-muted-foreground">{store.itemsSold} items</span>
                      <span className="text-orange-600 ml-2">${Number(store.revenue).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No partner store data available yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {salesData?.salesByCategory && salesData.salesByCategory.length > 0 ? (
              <div className="space-y-3">
                {salesData.salesByCategory.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium capitalize">{item.category}</span>
                    <span className="text-muted-foreground">${Number(item.total).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No sales data available yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>AI Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {insightsData?.insights ? (
            <div className="prose prose-sm max-w-none">
              <Streamdown>{String(insightsData.insights)}</Streamdown>
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Click "Generate Insights" to get AI-powered analysis of your business performance,
                including best-selling items, thrift store performance, and profit margin recommendations.
              </p>
              <Button onClick={handleGenerateInsights} disabled={isGenerating}>
                {isGenerating ? "Analyzing..." : "Generate Insights"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
