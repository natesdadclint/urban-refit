import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Award,
  AlertTriangle,
  Store,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatRatio(value: number): string {
  if (value === Infinity) return '∞';
  return `${value.toFixed(1)}x`;
}

function getTierColor(tier: string): string {
  switch (tier) {
    case 'platinum': return 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-900';
    case 'gold': return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900';
    case 'silver': return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
    case 'bronze': return 'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900';
    case 'review': return 'bg-gradient-to-r from-red-400 to-red-500 text-white';
    default: return 'bg-gray-200 text-gray-800';
  }
}

function getTierIcon(tier: string) {
  switch (tier) {
    case 'platinum':
    case 'gold':
    case 'silver':
    case 'bronze':
      return <Award className="h-4 w-4" />;
    case 'review':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return null;
  }
}

export default function AdminStorePerformance() {
  const { data: metrics, isLoading: metricsLoading } = trpc.thriftStore.performanceMetrics.useQuery();
  const { data: summary, isLoading: summaryLoading } = trpc.thriftStore.performanceSummary.useQuery();

  const isLoading = metricsLoading || summaryLoading;

  return (
    <AdminLayout title="Store Performance">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Store Performance Metrics</h1>
          <p className="text-muted-foreground mt-1">
            Revenue-to-payout analysis for performance-based partnership scaling
          </p>
        </div>

        {/* Summary Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">From {summary.totalStores} partner stores</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Total Payouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalPayouts)}</div>
                <p className="text-xs text-muted-foreground">Paid to partner stores</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Net Contribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalNetContribution)}</div>
                <p className="text-xs text-muted-foreground">{formatPercent(summary.avgContributionMargin)} margin</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Revenue/Payout Ratio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatRatio(summary.avgRevenueToPayoutRatio)}</div>
                <p className="text-xs text-muted-foreground">Average across all stores</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tier Breakdown */}
        {summary && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Partnership Tier Distribution</CardTitle>
              <CardDescription>Store classification based on performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Badge className={getTierColor('platinum')}>
                    <Award className="h-3 w-3 mr-1" />
                    Platinum
                  </Badge>
                  <span className="text-sm font-medium">{summary.tierBreakdown.platinum}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getTierColor('gold')}>
                    <Award className="h-3 w-3 mr-1" />
                    Gold
                  </Badge>
                  <span className="text-sm font-medium">{summary.tierBreakdown.gold}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getTierColor('silver')}>
                    <Award className="h-3 w-3 mr-1" />
                    Silver
                  </Badge>
                  <span className="text-sm font-medium">{summary.tierBreakdown.silver}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getTierColor('bronze')}>
                    <Award className="h-3 w-3 mr-1" />
                    Bronze
                  </Badge>
                  <span className="text-sm font-medium">{summary.tierBreakdown.bronze}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getTierColor('review')}>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Review
                  </Badge>
                  <span className="text-sm font-medium">{summary.tierBreakdown.review}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Store Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Individual Store Performance</CardTitle>
            <CardDescription>
              Sorted by net contribution (revenue - payouts). Higher ratio = better performing partner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : metrics && metrics.length > 0 ? (
              <div className="space-y-4">
                {metrics.map((store) => (
                  <div 
                    key={store.storeId} 
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{store.storeName}</h3>
                          <Badge className={getTierColor(store.partnershipTier)}>
                            {getTierIcon(store.partnershipTier)}
                            <span className="ml-1 capitalize">{store.partnershipTier}</span>
                          </Badge>
                        </div>
                        {store.city && (
                          <p className="text-sm text-muted-foreground mb-2">{store.city}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{store.tierReason}</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Revenue</p>
                          <p className="font-semibold">{formatCurrency(store.totalRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Payouts</p>
                          <p className="font-semibold">{formatCurrency(store.totalPayouts)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Net Contribution</p>
                          <p className={`font-semibold ${store.netContribution >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(store.netContribution)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Rev/Payout Ratio</p>
                          <p className="font-semibold flex items-center gap-1">
                            {formatRatio(store.revenueToPayoutRatio)}
                            {store.revenueToPayoutRatio >= 7 ? (
                              <ArrowUpRight className="h-3 w-3 text-green-600" />
                            ) : store.revenueToPayoutRatio < 3 ? (
                              <ArrowDownRight className="h-3 w-3 text-red-600" />
                            ) : null}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground">Items Sold</p>
                        <p className="font-medium">{store.itemsSold}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Available</p>
                        <p className="font-medium">{store.itemsAvailable}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gross Profit</p>
                        <p className="font-medium">{formatCurrency(store.grossProfit)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Profit Margin</p>
                        <p className="font-medium">{formatPercent(store.profitMargin)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Contribution Margin</p>
                        <p className="font-medium">{formatPercent(store.contributionMargin)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No store performance data available yet.</p>
                <p className="text-sm">Add products and make sales to see metrics.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Explanation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Understanding the Metrics</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Key Performance Indicators</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Revenue/Payout Ratio:</strong> How much revenue Urban Refit generates for every dollar paid to the store. Higher is better.</li>
                  <li><strong>Net Contribution:</strong> Revenue minus payouts - what Urban Refit keeps from this partnership.</li>
                  <li><strong>Contribution Margin:</strong> Net contribution as a percentage of revenue.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Partnership Tiers</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Platinum:</strong> 10x+ ratio, 80%+ margin - Top performers, consider exclusive deals</li>
                  <li><strong>Gold:</strong> 7x+ ratio, 70%+ margin - Strong partners, maintain relationship</li>
                  <li><strong>Silver:</strong> 5x+ ratio, 60%+ margin - Good partners, room for growth</li>
                  <li><strong>Bronze:</strong> 3x+ ratio, 40%+ margin - Acceptable, monitor closely</li>
                  <li><strong>Review:</strong> Below targets - Consider renegotiating terms or reducing volume</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
