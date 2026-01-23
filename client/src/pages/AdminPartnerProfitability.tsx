import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Store, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Tag
} from "lucide-react";

export default function AdminPartnerProfitability() {
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  
  const { data: profitabilityData, isLoading: loadingProfitability } = trpc.admin.getPartnerProfitability.useQuery();
  const { data: summaryData, isLoading: loadingSummary } = trpc.admin.getSalesAttributionSummary.useQuery();
  const { data: storeDetails, isLoading: loadingDetails } = trpc.admin.getStoreDetailedAnalytics.useQuery(
    { thriftStoreId: selectedStoreId! },
    { enabled: !!selectedStoreId }
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loadingProfitability || loadingSummary) {
    return (
      <AdminLayout title="Partner Profitability">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Partner Profitability">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Partner Profitability</h1>
          <p className="text-muted-foreground">
            Sales attribution and profitability analysis by thrift store partner
          </p>
        </div>

        {/* Summary Cards */}
        {summaryData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summaryData.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  From {summaryData.totalItemsSold} items sold
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summaryData.totalGrossProfit)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatPercent(summaryData.overallProfitMargin)} margin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Revenue/Item</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summaryData.avgRevenuePerItem)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(summaryData.avgProfitPerItem)} profit/item
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profitabilityData?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Thrift store partners
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top & Bottom Performers */}
        {summaryData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                  Top Performing Partners
                </CardTitle>
                <CardDescription>Highest gross profit contributors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summaryData.topPerformingStores.map((store, idx) => (
                    <div key={store.storeId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                          {idx + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{store.storeName}</p>
                          <p className="text-xs text-muted-foreground">{store.itemsSold} items sold</p>
                        </div>
                      </div>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(store.grossProfit)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-orange-600" />
                  Needs Attention
                </CardTitle>
                <CardDescription>Lowest performing partners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summaryData.bottomPerformingStores.map((store, idx) => (
                    <div key={store.storeId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0">
                          {idx + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{store.storeName}</p>
                          <p className="text-xs text-muted-foreground">{store.itemsSold} items sold</p>
                        </div>
                      </div>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(store.grossProfit)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profit by Category */}
        {summaryData && summaryData.profitByCategory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Profit by Category
              </CardTitle>
              <CardDescription>Revenue and profit breakdown by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Items Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryData.profitByCategory.map((cat) => (
                    <TableRow key={cat.category}>
                      <TableCell className="font-medium capitalize">{cat.category}</TableCell>
                      <TableCell className="text-right">{cat.itemsSold}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cat.revenue)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cat.cost)}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {formatCurrency(cat.profit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {cat.revenue > 0 ? formatPercent((cat.profit / cat.revenue) * 100) : '0%'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Partner Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Partners</CardTitle>
            <CardDescription>
              Detailed profitability metrics for each thrift store partner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Sell-Through</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead className="text-right">Avg Days to Sell</TableHead>
                  <TableHead>Top Category</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profitabilityData?.map((partner) => (
                  <TableRow key={partner.thriftStoreId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{partner.storeName}</p>
                        {partner.city && (
                          <p className="text-xs text-muted-foreground">{partner.city}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{partner.totalProductsSourced}</TableCell>
                    <TableCell className="text-right">{partner.productsSold}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={partner.sellThroughRate >= 50 ? "default" : "secondary"}>
                        {formatPercent(partner.sellThroughRate)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(partner.totalRevenue)}</TableCell>
                    <TableCell className="text-right">
                      <span className={partner.grossProfit >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(partner.grossProfit)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatPercent(partner.profitMargin)}</TableCell>
                    <TableCell className="text-right">
                      {partner.avgDaysToSell !== null ? (
                        <span className="flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.round(partner.avgDaysToSell)}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {partner.topCategory && (
                        <Badge variant="outline" className="capitalize">
                          <Tag className="h-3 w-3 mr-1" />
                          {partner.topCategory}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedStoreId(partner.thriftStoreId)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Store Details Dialog */}
        <Dialog open={!!selectedStoreId} onOpenChange={() => setSelectedStoreId(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {storeDetails?.store.name || 'Store'} - Detailed Analytics
              </DialogTitle>
              <DialogDescription>
                Performance breakdown and top selling products
              </DialogDescription>
            </DialogHeader>

            {loadingDetails ? (
              <div className="space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-48" />
              </div>
            ) : storeDetails ? (
              <div className="space-y-6">
                {/* Store Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{storeDetails.store.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">{storeDetails.store.contactPerson || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Payout</p>
                    <p className="font-medium">{formatCurrency(Number(storeDetails.store.totalPayout))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={storeDetails.store.isActive ? "default" : "secondary"}>
                      {storeDetails.store.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                {/* Category Breakdown */}
                {storeDetails.categoryBreakdown.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Sales by Category</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Sold</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                          <TableHead className="text-right">Profit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {storeDetails.categoryBreakdown.map((cat) => (
                          <TableRow key={cat.category}>
                            <TableCell className="capitalize">{cat.category}</TableCell>
                            <TableCell className="text-right">{cat.count}</TableCell>
                            <TableCell className="text-right">{formatCurrency(cat.revenue)}</TableCell>
                            <TableCell className="text-right text-green-600">
                              {formatCurrency(cat.profit)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Top Selling Products */}
                {storeDetails.topSellingProducts.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Top Selling Products</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead className="text-right">Sale Price</TableHead>
                          <TableHead className="text-right">Profit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {storeDetails.topSellingProducts.slice(0, 5).map((product) => (
                          <TableRow key={product.productId}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.brand || '-'}</TableCell>
                            <TableCell className="text-right">{formatCurrency(product.salePrice)}</TableCell>
                            <TableCell className="text-right text-green-600">
                              {formatCurrency(product.profit)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Monthly Performance */}
                {storeDetails.monthlyPerformance.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Monthly Performance (Last 12 Months)</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead className="text-right">Items Sold</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                          <TableHead className="text-right">Profit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {storeDetails.monthlyPerformance.map((month) => (
                          <TableRow key={month.month}>
                            <TableCell>{month.month}</TableCell>
                            <TableCell className="text-right">{month.itemsSold}</TableCell>
                            <TableCell className="text-right">{formatCurrency(month.revenue)}</TableCell>
                            <TableCell className="text-right text-green-600">
                              {formatCurrency(month.profit)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
