import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Megaphone, Info, Tag, AlertTriangle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const typeOptions = [
  { value: "info", label: "Info", icon: Info, color: "bg-sky-100 text-sky-800" },
  { value: "promo", label: "Promo", icon: Tag, color: "bg-emerald-100 text-emerald-800" },
  { value: "warning", label: "Warning", icon: AlertTriangle, color: "bg-amber-100 text-amber-800" },
  { value: "urgent", label: "Urgent", icon: AlertCircle, color: "bg-red-100 text-red-800" },
];

interface BannerFormData {
  title: string;
  message: string;
  type: "info" | "promo" | "warning" | "urgent";
  linkUrl: string;
  linkText: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

const defaultForm: BannerFormData = {
  title: "",
  message: "",
  type: "info",
  linkUrl: "",
  linkText: "",
  isActive: true,
  startDate: "",
  endDate: "",
};

export default function AdminBanners() {
  const utils = trpc.useUtils();
  const { data: banners, isLoading } = trpc.banners.getAll.useQuery();
  const createMutation = trpc.banners.create.useMutation({
    onSuccess: () => {
      utils.banners.getAll.invalidate();
      utils.banners.getActive.invalidate();
      toast.success("Banner created");
      setDialogOpen(false);
      setForm(defaultForm);
      setEditingId(null);
    },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.banners.update.useMutation({
    onSuccess: () => {
      utils.banners.getAll.invalidate();
      utils.banners.getActive.invalidate();
      toast.success("Banner updated");
      setDialogOpen(false);
      setForm(defaultForm);
      setEditingId(null);
    },
    onError: (err) => toast.error(err.message),
  });
  const toggleMutation = trpc.banners.toggleActive.useMutation({
    onSuccess: () => {
      utils.banners.getAll.invalidate();
      utils.banners.getActive.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.banners.delete.useMutation({
    onSuccess: () => {
      utils.banners.getAll.invalidate();
      utils.banners.getActive.invalidate();
      toast.success("Banner deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BannerFormData>(defaultForm);

  const handleEdit = (banner: any) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      message: banner.message,
      type: banner.type,
      linkUrl: banner.linkUrl || "",
      linkText: banner.linkText || "",
      isActive: banner.isActive,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : "",
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const payload = {
      title: form.title,
      message: form.message,
      type: form.type,
      linkUrl: form.linkUrl || undefined,
      linkText: form.linkText || undefined,
      isActive: form.isActive,
      startDate: form.startDate ? new Date(form.startDate) : undefined,
      endDate: form.endDate ? new Date(form.endDate) : undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const getTypeConfig = (type: string) => {
    return typeOptions.find((t) => t.value === type) || typeOptions[0];
  };

  return (
    <AdminLayout title="Site Banners">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-semibold tracking-tight">Site Banners</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage announcement banners displayed at the top of the site
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNew} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-serif">
                  {editingId ? "Edit Banner" : "Create Banner"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Free Shipping Weekend"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="e.g. Use code FREESHIP at checkout"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={form.type}
                      onValueChange={(v) => setForm({ ...form, type: v as BannerFormData["type"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-2">
                              <opt.icon className="h-3.5 w-3.5" />
                              {opt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={form.isActive}
                        onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                      />
                      <Label>Active</Label>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="linkUrl">Link URL (optional)</Label>
                    <Input
                      id="linkUrl"
                      value={form.linkUrl}
                      onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                      placeholder="/shop or https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkText">Link Text (optional)</Label>
                    <Input
                      id="linkText"
                      value={form.linkText}
                      onChange={(e) => setForm({ ...form, linkText: e.target.value })}
                      placeholder="Shop Now"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date (optional)</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date (optional)</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <Label className="text-xs text-muted-foreground">Preview</Label>
                  <div className={`mt-1 rounded-md px-3 py-2 text-sm ${
                    form.type === "info" ? "bg-sky-600 text-white" :
                    form.type === "promo" ? "bg-emerald-600 text-white" :
                    form.type === "warning" ? "bg-amber-500 text-amber-950" :
                    "bg-red-600 text-white"
                  }`}>
                    <span className="font-semibold">{form.title || "Title"}</span>
                    {" "}
                    <span className="opacity-90">{form.message || "Message text"}</span>
                    {form.linkText && (
                      <span className="ml-2 underline">{form.linkText}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!form.title || !form.message || createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingId ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Banner List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !banners || banners.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Megaphone className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="font-serif font-semibold text-lg mb-1">No banners yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first announcement banner to display at the top of the site.
              </p>
              <Button onClick={handleNew} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Create Banner
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {banners.map((banner) => {
              const typeConf = getTypeConfig(banner.type);
              const TypeIcon = typeConf.icon;
              const isExpired = banner.endDate && new Date(banner.endDate) < new Date();
              const isScheduled = banner.startDate && new Date(banner.startDate) > new Date();

              return (
                <Card key={banner.id} className={!banner.isActive ? "opacity-60" : ""}>
                  <CardContent className="flex items-start gap-4 py-4">
                    <div className={`p-2 rounded-md ${typeConf.color}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">{banner.title}</h3>
                        <Badge variant={banner.isActive ? "default" : "secondary"} className="text-xs shrink-0">
                          {banner.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {isExpired && (
                          <Badge variant="destructive" className="text-xs shrink-0">Expired</Badge>
                        )}
                        {isScheduled && (
                          <Badge variant="outline" className="text-xs shrink-0">Scheduled</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{banner.message}</p>
                      {(banner.startDate || banner.endDate) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {banner.startDate && `From: ${new Date(banner.startDate).toLocaleDateString()}`}
                          {banner.startDate && banner.endDate && " — "}
                          {banner.endDate && `Until: ${new Date(banner.endDate).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={banner.isActive}
                        onCheckedChange={() => toggleMutation.mutate({ id: banner.id })}
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("Delete this banner?")) {
                            deleteMutation.mutate({ id: banner.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
