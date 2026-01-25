import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Package, DollarSign, ShoppingCart, Store, Plus, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const { data: salesData, isLoading: salesLoading } = trpc.analytics.sales.useQuery();
  const { data: productData, isLoading: productLoading } = trpc.analytics.products.useQuery();
  const { data: orders } = trpc.order.listAll.useQuery();
  const { data: thriftStores } = trpc.thriftStore.listAll.useQuery();

  const isLoading = salesLoading || productLoading;

  const stats = [
    {
      title: "Total Revenue",
      value: salesData ? `NZ${Number(salesData.totalSales).toFixed(2)}` : "NZ$0.00",
      icon: DollarSign,
      description: `${salesData?.orderCount || 0} orders`,
    },
    {
      title: "Products",
      value: productData?.productsByStatus?.reduce((acc, s) => acc + s.count, 0) || 0,
      icon: Package,
      description: `${productData?.productsByStatus?.find(s => s.status === "available")?.count || 0} available`,
    },
    {
      title: "Pending Orders",
      value: orders?.filter(o => o.status === "paid" || o.status === "processing").length || 0,
      icon: ShoppingCart,
      description: "Need attention",
    },
    {
      title: "Partner Stores",
      value: thriftStores?.length || 0,
      icon: Store,
      description: "Active partnerships",
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button asChild className="gap-2">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/admin/orders">
            View Orders
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 skeleton rounded w-1/2" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">NZ${order.total}</p>
                      <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No orders yet</p>
            )}
          </CardContent>
        </Card>

        {/* Top Thrift Stores */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Partner Stores</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/thrift-stores">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {thriftStores && thriftStores.length > 0 ? (
              <div className="space-y-3">
                {thriftStores.slice(0, 5).map((store) => (
                  <div
                    key={store.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium">{store.name}</p>
                      <p className="text-sm text-muted-foreground">{store.city || "No location"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">NZ${store.totalPayout}</p>
                      <p className="text-xs text-muted-foreground">Total payouts</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No partner stores yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      {productData && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Avg Markup</p>
                <p className="text-xl font-semibold">
                  {Number(productData.avgMarkup).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Profit/Item</p>
                <p className="text-xl font-semibold">
                  NZ${Number(productData.avgProfit).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items Sold</p>
                <p className="text-xl font-semibold">
                  {productData.productsByStatus?.find(s => s.status === "sold")?.count || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Brand</p>
                <p className="text-xl font-semibold truncate">
                  {productData.topBrands?.[0]?.brand || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
}
