import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, DollarSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminThriftStores() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    email: "",
    phone: "",
    contactPerson: "",
    bankName: "",
    bankAccount: "",
    bankRouting: "",
    notes: "",
  });

  const { data: stores, isLoading } = trpc.thriftStore.listAll.useQuery();
  const utils = trpc.useUtils();

  const createStore = trpc.thriftStore.create.useMutation({
    onSuccess: () => {
      utils.thriftStore.listAll.invalidate();
      toast.success("Thrift store added!");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add store");
    },
  });

  const updateStore = trpc.thriftStore.update.useMutation({
    onSuccess: () => {
      utils.thriftStore.listAll.invalidate();
      toast.success("Thrift store updated!");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update store");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      email: "",
      phone: "",
      contactPerson: "",
      bankName: "",
      bankAccount: "",
      bankRouting: "",
      notes: "",
    });
    setEditingStore(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (store: any) => {
    setEditingStore(store);
    setFormData({
      name: store.name || "",
      address: store.address || "",
      city: store.city || "",
      email: store.email || "",
      phone: store.phone || "",
      contactPerson: store.contactPerson || "",
      bankName: store.bankName || "",
      bankAccount: store.bankAccount || "",
      bankRouting: store.bankRouting || "",
      notes: store.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Store name is required");
      return;
    }

    const data = {
      name: formData.name,
      address: formData.address || undefined,
      city: formData.city || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      contactPerson: formData.contactPerson || undefined,
      bankName: formData.bankName || undefined,
      bankAccount: formData.bankAccount || undefined,
      bankRouting: formData.bankRouting || undefined,
      notes: formData.notes || undefined,
    };

    if (editingStore) {
      updateStore.mutate({ id: editingStore.id, ...data });
    } else {
      createStore.mutate(data);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AdminLayout title="Thrift Store Partners">
      {/* Actions */}
      <div className="flex justify-end mb-6">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Store
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingStore ? "Edit Thrift Store" : "Add New Thrift Store"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Store Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Goodwill Downtown"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g., Portland"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g., (555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="store@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="Manager name"
                  />
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Bank Details (for payouts)</p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      placeholder="e.g., Chase Bank"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bankAccount">Account Number</Label>
                      <Input
                        id="bankAccount"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleInputChange}
                        placeholder="Account #"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bankRouting">Routing Number</Label>
                      <Input
                        id="bankRouting"
                        name="bankRouting"
                        value={formData.bankRouting}
                        onChange={handleInputChange}
                        placeholder="Routing #"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createStore.isPending || updateStore.isPending}
                >
                  {editingStore ? "Update Store" : "Add Store"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stores Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : !stores || stores.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No thrift store partners yet. Add your first partner!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Payouts</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{store.name}</p>
                        {store.contactPerson && (
                          <p className="text-xs text-muted-foreground">
                            {store.contactPerson}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {store.city || store.address || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {store.email && <p>{store.email}</p>}
                        {store.phone && (
                          <p className="text-muted-foreground">{store.phone}</p>
                        )}
                        {!store.email && !store.phone && "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={store.isActive ? "default" : "secondary"}>
                        {store.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{store.totalPayout}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(store)}
                      >
                        <Pencil className="h-4 w-4" />
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
      {stores && stores.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          {stores.length} partner {stores.length === 1 ? "store" : "stores"} • 
          Total payouts: ${stores.reduce((sum, s) => sum + parseFloat(s.totalPayout), 0).toFixed(2)}
        </div>
      )}
    </AdminLayout>
  );
}
