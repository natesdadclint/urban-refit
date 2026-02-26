import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface QualityComparisonChartProps {
  brand: string;
}

const conditionLabels: Record<string, string> = {
  like_new: "Like New",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
};

const conditionColors: Record<string, string> = {
  like_new: "#10b981", // emerald
  excellent: "#3b82f6", // blue
  good: "#f59e0b", // amber
  fair: "#f97316", // orange
};

export default function QualityComparisonChart({ brand }: QualityComparisonChartProps) {
  const { data: comparisonData, isLoading, error } = trpc.product.priceComparison.useQuery({ brand });

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!comparisonData) return [];
    
    return comparisonData.map((item) => ({
      condition: conditionLabels[item.condition] || item.condition,
      conditionKey: item.condition,
      avgPrice: parseFloat(item.avgPrice),
      minPrice: parseFloat(item.minPrice),
      maxPrice: parseFloat(item.maxPrice),
      count: item.count,
    }));
  }, [comparisonData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Comparison by Quality</CardTitle>
          <CardDescription>{brand}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Comparison by Quality</CardTitle>
          <CardDescription>{brand}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No price comparison data available for this brand.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Comparison by Quality</CardTitle>
        <CardDescription>
          Average prices across condition levels for {brand}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="condition" 
                tick={{ fill: "var(--color-foreground)", fontSize: 12 }}
              />
              <YAxis 
                label={{ value: "Price ($)", angle: -90, position: "insideLeft" }}
                tick={{ fill: "var(--color-foreground)", fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "var(--color-background)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="square"
              />
              <Bar 
                dataKey="minPrice" 
                fill="#d1d5db" 
                name="Min Price"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="avgPrice" 
                fill="#6366f1" 
                name="Avg Price"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="maxPrice" 
                fill="#8b5cf6" 
                name="Max Price"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Data Table */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-semibold">Condition</th>
                <th className="text-right py-2 px-2 font-semibold">Avg Price</th>
                <th className="text-right py-2 px-2 font-semibold">Min Price</th>
                <th className="text-right py-2 px-2 font-semibold">Max Price</th>
                <th className="text-right py-2 px-2 font-semibold">Items</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => (
                <tr key={row.conditionKey} className="border-b border-border hover:bg-muted/50">
                  <td className="py-2 px-2">
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium" 
                      style={{ backgroundColor: `${conditionColors[row.conditionKey]}20`, color: conditionColors[row.conditionKey] }}>
                      {row.condition}
                    </span>
                  </td>
                  <td className="text-right py-2 px-2 font-semibold">${row.avgPrice.toFixed(2)}</td>
                  <td className="text-right py-2 px-2 text-muted-foreground">${row.minPrice.toFixed(2)}</td>
                  <td className="text-right py-2 px-2 text-muted-foreground">${row.maxPrice.toFixed(2)}</td>
                  <td className="text-right py-2 px-2 text-muted-foreground">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Savings Insight */}
        {chartData.length > 1 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-semibold text-foreground mb-2">💡 Savings Insight</p>
            <p className="text-sm text-muted-foreground">
              Choosing a "Good" condition item instead of "Like New" could save you an average of{" "}
              <span className="font-semibold text-foreground">
                ${Math.abs(
                  parseFloat(chartData.find(d => d.conditionKey === "good")?.avgPrice || "0") -
                  parseFloat(chartData.find(d => d.conditionKey === "like_new")?.avgPrice || "0")
                ).toFixed(2)}
              </span>
              .
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
