import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { 
  Heart, Plus, Edit, Trash2, Loader2, Globe, DollarSign
} from "lucide-react";

export default function AdminCharities() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState<any>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  const { data: charities, isLoading, refetch } = trpc.charity.list.useQuery();
  
  const createMutation = trpc.charity.create.useMutation({
    onSuccess: () => {
      toast.success("Charity added successfully");
      resetForm();
      setDialogOpen(false);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const updateMutation = trpc.charity.update.useMutation({
    onSuccess: () => {
      toast.success("Charity updated successfully");
      resetForm();
      setDialogOpen(false);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  
  // Note: Delete functionality can be added by creating a charity.delete route
  
  const resetForm = () => {
    setName("");
    setDescription("");
    setWebsite("");
    setLogoUrl("");
    setCategory("");
    setIsActive(true);
    setEditingCharity(null);
  };
  
  const handleEdit = (charity: any) => {
    setEditingCharity(charity);
    setName(charity.name);
    setDescription(charity.description || "");
    setWebsite(charity.website || "");
    setLogoUrl(charity.logoUrl || "");
    setCategory(charity.category || "");
    setIsActive(charity.isActive);
    setDialogOpen(true);
  };
  
  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    
    const data = {
      name,
      description: description || undefined,
      website: website || undefined,
      logoUrl: logoUrl || undefined,
      category: category || undefined,
      isActive,
    };
    
    if (editingCharity) {
      updateMutation.mutate({ id: editingCharity.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  const handleDelete = (id: number) => {
    toast.info("Delete functionality coming soon");
  };
  
  const totalDonations = charities?.reduce(
    (sum: number, c: any) => sum + parseFloat(c.totalDonationsReceived || "0"),
    0
  ) || 0;
  
  if (isLoading) {
    return (
      <AdminLayout title="Charities">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="Charities">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Charity Partners</h1>
            <p className="text-muted-foreground">
              Manage charity organizations for token donations
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Charity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCharity ? "Edit Charity" : "Add New Charity"}
                </DialogTitle>
                <DialogDescription>
                  {editingCharity 
                    ? "Update the charity information" 
                    : "Add a new charity partner for token donations"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    placeholder="Charity name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Brief description of the charity's mission"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <Input
                      placeholder="https://..."
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      placeholder="e.g., Environment, Education"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Logo URL</label>
                  <Input
                    placeholder="https://..."
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Active</p>
                    <p className="text-sm text-muted-foreground">
                      Show this charity to customers
                    </p>
                  </div>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
                <Button 
                  onClick={handleSubmit} 
                  className="w-full"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {editingCharity ? "Update Charity" : "Add Charity"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Heart className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Charities</p>
                  <p className="text-2xl font-bold">{charities?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Donated</p>
                  <p className="text-2xl font-bold">NZ${totalDonations.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">
                    {charities?.filter((c: any) => c.isActive).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charities List */}
        {charities && charities.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {charities.map((charity: any) => (
              <Card key={charity.id}>
                {charity.logoUrl && (
                  <div className="h-32 bg-muted">
                    <img 
                      src={charity.logoUrl} 
                      alt={charity.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{charity.name}</CardTitle>
                      {charity.category && (
                        <Badge variant="outline" className="mt-1">
                          {charity.category}
                        </Badge>
                      )}
                    </div>
                    <Badge variant={charity.isActive ? "default" : "secondary"}>
                      {charity.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {charity.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {charity.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Total received:</span>
                    <span className="font-medium">
                      NZ${parseFloat(charity.totalDonationsReceived || "0").toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(charity)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(charity.id)}
                      
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Charities Yet</h3>
              <p className="text-muted-foreground mb-4">
                Add charity partners so customers can donate their tokens.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Charity
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
