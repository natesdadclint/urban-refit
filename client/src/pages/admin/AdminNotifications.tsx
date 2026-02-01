import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, Filter, ShoppingCart, Package, MessageSquare, AlertTriangle, Shield, DollarSign, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

const typeIcons: Record<string, React.ReactNode> = {
  new_order: <ShoppingCart className="h-5 w-5 text-green-500" />,
  order_cancelled: <X className="h-5 w-5 text-red-500" />,
  new_submission: <Package className="h-5 w-5 text-blue-500" />,
  submission_approved: <Check className="h-5 w-5 text-green-500" />,
  submission_rejected: <X className="h-5 w-5 text-red-500" />,
  new_contact: <MessageSquare className="h-5 w-5 text-purple-500" />,
  low_stock: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  payout_due: <DollarSign className="h-5 w-5 text-orange-500" />,
  system_alert: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  security_alert: <Shield className="h-5 w-5 text-red-500" />,
};

const typeLabels: Record<string, string> = {
  new_order: "New Order",
  order_cancelled: "Order Cancelled",
  new_submission: "New Submission",
  submission_approved: "Submission Approved",
  submission_rejected: "Submission Rejected",
  new_contact: "New Contact",
  low_stock: "Low Stock",
  payout_due: "Payout Due",
  system_alert: "System Alert",
  security_alert: "Security Alert",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700 border-gray-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminNotificationsPage() {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "system_alert" as const,
    priority: "medium" as const,
  });
  
  const { data: notifications, refetch } = trpc.admin.getAdminNotifications.useQuery({
    unreadOnly: showUnreadOnly || undefined,
    type: filterType !== "all" ? filterType : undefined,
    priority: filterPriority !== "all" ? filterPriority : undefined,
    limit: 100,
  });
  
  const { data: stats } = trpc.admin.getNotificationStats.useQuery();
  
  const markAsRead = trpc.admin.markNotificationAsRead.useMutation({
    onSuccess: () => refetch(),
  });
  
  const markAllAsRead = trpc.admin.markAllNotificationsAsRead.useMutation({
    onSuccess: (data) => {
      toast.success(`Marked ${data.count} notifications as read`);
      refetch();
    },
  });
  
  const deleteNotification = trpc.admin.deleteNotification.useMutation({
    onSuccess: () => {
      toast.success("Notification deleted");
      refetch();
    },
  });
  
  const createNotification = trpc.admin.createTestNotification.useMutation({
    onSuccess: () => {
      toast.success("Notification created");
      setIsCreateDialogOpen(false);
      setNewNotification({ title: "", message: "", type: "system_alert", priority: "medium" });
      refetch();
    },
  });
  
  return (
    <AdminLayout title="Admin Alerts">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-semibold">Admin Alerts</h2>
            <p className="text-muted-foreground mt-1">System notifications for orders, submissions, and alerts</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => markAllAsRead.mutate()}
              disabled={!stats?.unread}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Test Alert</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Title</Label>
                    <Input 
                      value={newNotification.title}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Alert title"
                    />
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Textarea 
                      value={newNotification.message}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Alert message"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select 
                        value={newNotification.type}
                        onValueChange={(value: any) => setNewNotification(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(typeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select 
                        value={newNotification.priority}
                        onValueChange={(value: any) => setNewNotification(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => createNotification.mutate(newNotification)}
                    disabled={!newNotification.title || !newNotification.message}
                  >
                    Create Alert
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unread</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.unread || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {(stats?.byPriority?.high || 0) + (stats?.byPriority?.critical || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(stats?.byType?.new_order || 0) + (stats?.byType?.order_cancelled || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant={showUnreadOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              >
                Unread Only
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Notifications List */}
        <Card>
          <CardContent className="pt-4">
            {notifications && notifications.length > 0 ? (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`py-4 flex items-start gap-4 ${!notification.isRead ? "bg-blue-50/30" : ""}`}
                  >
                    <div className="mt-1">
                      {typeIcons[notification.type] || <Bell className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`font-semibold ${!notification.isRead ? "" : "text-muted-foreground"}`}>
                          {notification.title}
                        </span>
                        <Badge variant="outline" className={priorityColors[notification.priority]}>
                          {notification.priority}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {typeLabels[notification.type] || notification.type}
                        </Badge>
                        {!notification.isRead && (
                          <Badge variant="default" className="text-xs bg-blue-500">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span>{format(new Date(notification.createdAt), "MMM d, yyyy h:mm a")}</span>
                        <span>({formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })})</span>
                        {notification.link && (
                          <a href={notification.link} className="text-blue-500 hover:underline">
                            View Details →
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead.mutate({ notificationId: notification.id })}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification.mutate({ notificationId: notification.id })}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No alerts found</p>
                <p className="text-sm">Alerts will appear here when events occur (new orders, submissions, etc.)</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
