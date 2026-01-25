import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Search, Eye, Truck, CheckCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: orders, isLoading } = trpc.order.listAll.useQuery();
  const utils = trpc.useUtils();

  const updateStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      utils.order.listAll.invalidate();
      toast.success("Order status updated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    return orders.filter((order) => {
      const matchesSearch =
        !searchQuery ||
        order.id.toString().includes(searchQuery) ||
        order.shippingName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shippingCity?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatus.mutate({
      id: orderId,
      status: newStatus as any,
    });
  };

  return (
    <AdminLayout title="Orders">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "No orders match your filters."
              : "No orders yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Thrift Payout</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.shippingName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.shippingCity}, {order.shippingState}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <Badge className={statusColors[order.status] || "bg-gray-100"}>
                            {order.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.slice(1).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      NZ${order.total}
                    </TableCell>
                    <TableCell className="text-right text-orange-600">
                      NZ${(parseFloat(order.subtotal) * 0.1).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredOrders.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>{filteredOrders.length} orders</span>
          <span>•</span>
          <span>
            Total: NZ${filteredOrders.reduce((sum, o) => sum + parseFloat(o.total), 0).toFixed(2)}
          </span>
          <span>•</span>
          <span>
            Thrift payouts: NZ${filteredOrders.reduce((sum, o) => sum + parseFloat(o.subtotal) * 0.1, 0).toFixed(2)}
          </span>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={statusColors[selectedOrder.status] || "bg-gray-100"}>
                  {selectedOrder.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Shipping Address</h4>
                <p className="text-sm">{selectedOrder.shippingName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.shippingAddress}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingZip}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.shippingCountry}
                </p>
                {selectedOrder.shippingPhone && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Phone: {selectedOrder.shippingPhone}
                  </p>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>NZ${selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>NZ${selectedOrder.shippingCost}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>NZ${selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Thrift Store Payouts</h4>
                <div className="text-sm">
                  <div className="flex justify-between text-orange-600">
                    <span>Total Payout Due</span>
                    <span>NZ${(parseFloat(selectedOrder.subtotal) * 0.1).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    10% of subtotal goes to partner thrift stores
                  </p>
                </div>
              </div>

              {selectedOrder.paidAt && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Paid on {new Date(selectedOrder.paidAt).toLocaleDateString()}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {selectedOrder.status === "paid" && (
                  <Button
                    className="gap-2"
                    onClick={() => {
                      handleStatusChange(selectedOrder.id, "processing");
                      setSelectedOrder(null);
                    }}
                  >
                    <Truck className="h-4 w-4" />
                    Mark Processing
                  </Button>
                )}
                {selectedOrder.status === "processing" && (
                  <Button
                    className="gap-2"
                    onClick={() => {
                      handleStatusChange(selectedOrder.id, "shipped");
                      setSelectedOrder(null);
                    }}
                  >
                    <Truck className="h-4 w-4" />
                    Mark Shipped
                  </Button>
                )}
                {selectedOrder.status === "shipped" && (
                  <Button
                    className="gap-2"
                    onClick={() => {
                      handleStatusChange(selectedOrder.id, "delivered");
                      setSelectedOrder(null);
                    }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark Delivered
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
