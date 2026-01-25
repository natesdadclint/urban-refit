import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Plus, DollarSign, CheckCircle, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
};

export default function AdminPayouts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [notes, setNotes] = useState("");

  const { data: thriftStores } = trpc.thriftStore.listAll.useQuery();
  const { data: payouts, isLoading } = trpc.payout.list.useQuery();
  const utils = trpc.useUtils();

  const createPayout = trpc.payout.create.useMutation({
    onSuccess: () => {
      utils.payout.list.invalidate();
      utils.thriftStore.listAll.invalidate();
      toast.success("Payout created!");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create payout");
    },
  });

  const markPaid = trpc.payout.markPaid.useMutation({
    onSuccess: () => {
      utils.payout.list.invalidate();
      utils.thriftStore.listAll.invalidate();
      toast.success("Payout marked as paid!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark payout as paid");
    },
  });

  const resetForm = () => {
    setSelectedStoreId("");
    setPayoutAmount("");
    setPaymentMethod("");
    setPaymentReference("");
    setNotes("");
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoreId) {
      toast.error("Please select a thrift store");
      return;
    }
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    createPayout.mutate({
      thriftStoreId: parseInt(selectedStoreId),
      amount: parseFloat(payoutAmount),
      paymentMethod: paymentMethod || undefined,
      paymentReference: paymentReference || undefined,
      notes: notes || undefined,
    });
  };

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!payouts) return { pending: 0, paid: 0, total: 0 };
    
    const pending = payouts
      .filter((p: { status: string }) => p.status === "pending" || p.status === "processing")
      .reduce((sum: number, p: { amount: string }) => sum + parseFloat(p.amount), 0);
    
    const paid = payouts
      .filter((p: { status: string }) => p.status === "paid")
      .reduce((sum: number, p: { amount: string }) => sum + parseFloat(p.amount), 0);
    
    return { pending, paid, total: pending + paid };
  }, [payouts]);

  // Get store name by ID
  const getStoreName = (storeId: number) => {
    return thriftStores?.find((s) => s.id === storeId)?.name || `Store #${storeId}`;
  };

  return (
    <AdminLayout title="Thrift Store Payouts">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Payouts
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              NZ${stats.pending.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Out
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              NZ${stats.paid.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payouts
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NZ${stats.total.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end mb-6">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Payout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Payout</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="store">Thrift Store *</Label>
                <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                  <SelectContent>
                    {thriftStores?.map((store) => (
                      <SelectItem key={store.id} value={store.id.toString()}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="method">Payment Method</Label>
                <Input
                  id="method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="e.g., Bank Transfer, Check"
                />
              </div>
              <div>
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Transaction or check number"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPayout.isPending}>
                  Create Payout
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payouts Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : !payouts || payouts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No payouts yet. Create your first payout when you're ready to pay a partner store.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Thrift Store</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout: any) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-medium">#{payout.id}</TableCell>
                    <TableCell>
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStoreName(payout.thriftStoreId)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[payout.status] || "bg-gray-100"}>
                        {payout.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      NZ${payout.amount}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payout.paymentMethod || "-"}
                    </TableCell>
                    <TableCell>
                      {payout.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markPaid.mutate({ id: payout.id })}
                          disabled={markPaid.isPending}
                        >
                          Mark Paid
                        </Button>
                      )}
                      {payout.status === "paid" && payout.paidAt && (
                        <span className="text-xs text-muted-foreground">
                          Paid {new Date(payout.paidAt).toLocaleDateString()}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
        <h4 className="font-medium mb-2">About Thrift Store Payouts</h4>
        <p className="text-sm text-muted-foreground">
          Each thrift store partner receives 10% of the sale price for garments sourced from their store.
          Create payouts when you're ready to transfer funds to your partners. Track pending and completed
          payouts here.
        </p>
      </div>
    </AdminLayout>
  );
}
