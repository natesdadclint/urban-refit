import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, X, Package, Coins, Tag, Info, AlertTriangle, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface NotificationBellProps {
  className?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  order: <Package className="h-4 w-4 text-blue-500" />,
  submission: <Tag className="h-4 w-4 text-purple-500" />,
  tokens: <Coins className="h-4 w-4 text-amber-500" />,
  promo: <Megaphone className="h-4 w-4 text-pink-500" />,
  success: <Check className="h-4 w-4 text-green-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-orange-500" />,
  info: <Info className="h-4 w-4 text-gray-500" />,
};

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: unreadCount = 0 } = trpc.notification.unreadCount.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  const { data: notifications = [], refetch } = trpc.notification.list.useQuery(
    { limit: 10 },
    { enabled: isOpen }
  );
  
  const markAsRead = trpc.notification.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });
  
  const markAllAsRead = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  });
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead.mutate({ id: notification.id });
    }
    if (notification.link) {
      setIsOpen(false);
    }
  };
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
      
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg shadow-xl z-[100] max-h-[70vh] overflow-hidden flex flex-col border border-gray-200"
          style={{ backgroundColor: '#ffffff' }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between px-4 py-3 border-b border-gray-200"
            style={{ backgroundColor: '#ffffff' }}
          >
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-gray-900"
                onClick={() => markAllAsRead.mutate()}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          
          {/* Notification list */}
          <div 
            className="overflow-y-auto flex-1"
            style={{ backgroundColor: '#ffffff' }}
          >
            {notifications.length === 0 ? (
              <div 
                className="px-4 py-8 text-center"
                style={{ backgroundColor: '#ffffff' }}
              >
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification: any) => (
                  <li key={notification.id}>
                    {notification.link ? (
                      <Link
                        href={notification.link}
                        onClick={() => handleNotificationClick(notification)}
                        className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${
                          !notification.isRead ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <NotificationContent notification={notification} />
                      </Link>
                    ) : (
                      <div
                        onClick={() => handleNotificationClick(notification)}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                          !notification.isRead ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <NotificationContent notification={notification} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Footer */}
          {notifications.length > 0 && (
            <div 
              className="px-4 py-2 border-t border-gray-200 text-center"
              style={{ backgroundColor: '#ffffff' }}
            >
              <Link
                href="/notifications"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationContent({ notification }: { notification: any }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-0.5">
        {typeIcons[notification.type] || typeIcons.info}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium truncate ${!notification.isRead ? "text-gray-900" : "text-gray-600"}`}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500" />
          )}
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
