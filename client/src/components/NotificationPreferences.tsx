import { useState, useEffect } from "react";
import { Bell, ShoppingBag, Coins, Tag, FileText, Settings, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface PreferenceItem {
  key: "orderUpdates" | "tokenRewards" | "promotions" | "sellSubmissions" | "systemUpdates";
  label: string;
  description: string;
  icon: React.ReactNode;
}

const preferenceItems: PreferenceItem[] = [
  {
    key: "orderUpdates",
    label: "Order Updates",
    description: "Order confirmations, shipping updates, and delivery notifications",
    icon: <ShoppingBag className="h-5 w-5 text-blue-500" />,
  },
  {
    key: "tokenRewards",
    label: "Token & Rewards",
    description: "Token earnings, weekly rewards, and loyalty program updates",
    icon: <Coins className="h-5 w-5 text-amber-500" />,
  },
  {
    key: "promotions",
    label: "Promotions & Offers",
    description: "Sales, discounts, new arrivals, and special offers",
    icon: <Tag className="h-5 w-5 text-pink-500" />,
  },
  {
    key: "sellSubmissions",
    label: "Sell Submissions",
    description: "Updates on items you've submitted to sell",
    icon: <FileText className="h-5 w-5 text-purple-500" />,
  },
  {
    key: "systemUpdates",
    label: "System Updates",
    description: "Account updates, policy changes, and important announcements",
    icon: <Settings className="h-5 w-5 text-gray-500" />,
  },
];

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    orderUpdates: true,
    tokenRewards: true,
    promotions: true,
    sellSubmissions: true,
    systemUpdates: true,
  });

  const { data: savedPreferences, isLoading } = trpc.notification.getPreferences.useQuery();
  
  const updatePreferences = trpc.notification.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Notification preferences updated");
    },
    onError: () => {
      toast.error("Failed to update preferences");
    },
  });

  // Load saved preferences when data is fetched
  useEffect(() => {
    if (savedPreferences) {
      setPreferences({
        orderUpdates: savedPreferences.orderUpdates,
        tokenRewards: savedPreferences.tokenRewards,
        promotions: savedPreferences.promotions,
        sellSubmissions: savedPreferences.sellSubmissions,
        systemUpdates: savedPreferences.systemUpdates,
      });
    }
  }, [savedPreferences]);

  const handleToggle = (key: string, checked: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: checked }));
    updatePreferences.mutate({ [key]: checked });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose which types of notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {preferenceItems.map((item) => (
          <div
            key={item.key}
            className="flex items-start justify-between gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{item.icon}</div>
              <div className="space-y-1">
                <Label
                  htmlFor={item.key}
                  className="text-sm font-medium cursor-pointer"
                >
                  {item.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
            <Switch
              id={item.key}
              checked={preferences[item.key]}
              onCheckedChange={(checked) => handleToggle(item.key, checked)}
              disabled={updatePreferences.isPending}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
