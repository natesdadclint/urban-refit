import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Megaphone, Package, Coins, Tag, Info, AlertTriangle, Check, Send } from "lucide-react";
import { format } from "date-fns";

const notificationTypes = [
  { value: "info", label: "Info", icon: Info, color: "text-gray-500" },
  { value: "success", label: "Success", icon: Check, color: "text-green-500" },
  { value: "warning", label: "Warning", icon: AlertTriangle, color: "text-orange-500" },
  { value: "promo", label: "Promotion", icon: Megaphone, color: "text-pink-500" },
  { value: "order", label: "Order Update", icon: Package, color: "text-blue-500" },
  { value: "tokens", label: "Tokens", icon: Coins, color: "text-amber-500" },
  { value: "submission", label: "Submission", icon: Tag, color: "text-purple-500" },
];

export default function AdminNotifications() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as string,
    link: "",
  });
  
  const { data: broadcasts = [], refetch } = trpc.notification.listBroadcasts.useQuery();
  
  const createBroadcast = trpc.notification.createBroadcast.useMutation({
    onSuccess: () => {
      toast.success("Broadcast notification sent to all users!");
      setIsCreateOpen(false);
      setFormData({ title: "", message: "", type: "info", link: "" });
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to create notification", { description: error.message });
    },
  });
  
  const deleteBroadcast = trpc.notification.deleteBroadcast.useMutation({
    onSuccess: () => {
      toast.success("Notification deleted");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to delete notification", { description: error.message });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    createBroadcast.mutate({
      title: formData.title.trim(),
      message: formData.message.trim(),
      type: formData.type as any,
      link: formData.link.trim() || undefined,
    });
  };
  
  const getTypeIcon = (type: string) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    if (!typeConfig) return <Info className="h-4 w-4 text-gray-500" />;
    const Icon = typeConfig.icon;
    return <Icon className={`h-4 w-4 ${typeConfig.color}`} />;
  };
  
  return (
    <AdminLayout title="Notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-semibold">Broadcast Notifications</h2>
            <p className="text-muted-foreground mt-1">
              Send announcements to all users
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Broadcast
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create Broadcast Notification</DialogTitle>
                  <DialogDescription>
                    This notification will be sent to all users on the platform.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className={`h-4 w-4 ${type.color}`} />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., New Collection Available!"
                      maxLength={255}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Enter the notification message..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="link">Link (optional)</Label>
                    <Input
                      id="link"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      placeholder="/shop or /blog/new-arrivals"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground">
                      Users will be taken to this page when they click the notification
                    </p>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createBroadcast.isPending}>
                    <Send className="h-4 w-4 mr-2" />
                    {createBroadcast.isPending ? "Sending..." : "Send to All Users"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Broadcasts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sent Broadcasts</CardTitle>
            <CardDescription>
              History of all broadcast notifications sent to users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {broadcasts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No broadcast notifications sent yet</p>
                <p className="text-sm mt-1">Create your first broadcast to announce something to all users</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {broadcasts.map((broadcast) => (
                    <TableRow key={broadcast.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(broadcast.type)}
                          <span className="text-xs capitalize">{broadcast.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-[150px] truncate">
                        {broadcast.title}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {broadcast.message}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {broadcast.link || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(broadcast.createdAt), "MMM d, yyyy h:mm a")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm("Delete this broadcast notification?")) {
                              deleteBroadcast.mutate({ id: broadcast.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {/* Tips Card */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Tips for Effective Notifications</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Keep titles short and attention-grabbing (under 50 characters)</p>
            <p>• Use clear, actionable language in your messages</p>
            <p>• Include a link when you want users to take action</p>
            <p>• Use appropriate notification types for better visual distinction</p>
            <p>• Don't over-notify - save broadcasts for important announcements</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
