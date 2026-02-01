import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, X, ShoppingCart, Package, MessageSquare, AlertTriangle, Shield, DollarSign, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface AdminNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date | string;
}

const typeIcons: Record<string, React.ReactNode> = {
  new_order: <ShoppingCart className="h-4 w-4 text-green-500" />,
  order_cancelled: <X className="h-4 w-4 text-red-500" />,
  new_submission: <Package className="h-4 w-4 text-blue-500" />,
  submission_approved: <Check className="h-4 w-4 text-green-500" />,
  submission_rejected: <X className="h-4 w-4 text-red-500" />,
  new_contact: <MessageSquare className="h-4 w-4 text-purple-500" />,
  low_stock: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  payout_due: <DollarSign className="h-4 w-4 text-orange-500" />,
  system_alert: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  security_alert: <Shield className="h-4 w-4 text-red-500" />,
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-orange-100 text-orange-600",
  critical: "bg-red-100 text-red-600",
};

export function AdminNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: notifications, refetch } = trpc.admin.getAdminNotifications.useQuery(
    { limit: 20 },
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );
  
  const { data: unreadCount } = trpc.admin.getUnreadNotificationCount.useQuery(
    undefined,
    { refetchInterval: 30000 }
  );
  
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
  
  const handleNotificationClick = (notification: AdminNotification) => {
    if (!notification.isRead) {
      markAsRead.mutate({ notificationId: notification.id });
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
    setIsOpen(false);
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount && unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount && unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllAsRead.mutate()}
              className="text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications && notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notification.isRead ? "bg-blue-50/50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {typeIcons[notification.type] || <Bell className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                          {notification.title}
                        </span>
                        <Badge variant="outline" className={`text-xs ${priorityColors[notification.priority]}`}>
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification.mutate({ notificationId: notification.id });
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t">
          <Button 
            variant="ghost" 
            className="w-full text-sm"
            onClick={() => {
              window.location.href = "/admin/notifications";
              setIsOpen(false);
            }}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
