import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShoppingCart,
  Coins,
  TrendingUp,
  Package,
  Clock,
  ChevronRight,
  Crown,
} from "lucide-react";

function tierColor(tier: string) {
  switch (tier) {
    case "platinum": return "bg-violet-100 text-violet-800 border-violet-300";
    case "gold": return "bg-amber-100 text-amber-800 border-amber-300";
    case "silver": return "bg-gray-100 text-gray-600 border-gray-300";
    default: return "bg-orange-50 text-orange-700 border-orange-200";
  }
}

function roleColor(role: string) {
  return role === "admin"
    ? "bg-red-100 text-red-800 border-red-300"
    : "bg-blue-100 text-blue-800 border-blue-300";
}

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NZ", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function formatDateTime(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-NZ", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { data: allUsers, isLoading } = trpc.users.list.useQuery();
  const { data: userDetails, isLoading: detailsLoading } = trpc.users.getById.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId }
  );

  const utils = trpc.useUtils();
  const updateRole = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated");
      utils.users.list.invalidate();
      utils.users.getById.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter((u) => {
      const matchesSearch =
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toString() === search;
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [allUsers, search, roleFilter]);

  const stats = useMemo(() => {
    if (!allUsers) return { total: 0, admins: 0, customers: 0 };
    return {
      total: allUsers.length,
      admins: allUsers.filter(u => u.role === "admin").length,
      customers: allUsers.filter(u => u.role === "user").length,
    };
  }, [allUsers]);

  return (
    <AdminLayout title="Users">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">View and manage all registered customers and admins</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Customers</p>
          <p className="text-2xl font-bold text-blue-600">{stats.customers}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Admins</p>
          <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "user", "admin"] as const).map((r) => (
            <Button
              key={r}
              variant={roleFilter === r ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(r)}
            >
              {r === "all" ? "All" : r === "user" ? "Customers" : "Admins"}
            </Button>
          ))}
        </div>
      </div>

      {/* User List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No users found</p>
          <p className="text-sm">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedUserId(u.id)}
              className="w-full text-left bg-card border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                  {u.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold truncate">{u.name || "Unnamed"}</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${roleColor(u.role)}`}>
                      {u.role}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${tierColor(u.membershipTier)}`}>
                      {u.membershipTier}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {u.email || "No email"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      {parseFloat(u.tokenBalance).toFixed(0)} tokens
                    </span>
                    <span className="flex items-center gap-1 hidden sm:flex">
                      <Clock className="h-3 w-3" />
                      Last seen {formatDate(u.lastSignedIn)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details
            </DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shrink-0">
                  {userDetails.user.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold">{userDetails.user.name || "Unnamed"}</h3>
                    <Badge variant="outline" className={roleColor(userDetails.user.role)}>
                      {userDetails.user.role === "admin" && <Crown className="h-3 w-3 mr-1" />}
                      {userDetails.user.role}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {userDetails.user.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> {userDetails.user.email}
                      </p>
                    )}
                    {userDetails.user.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {userDetails.user.phone}
                      </p>
                    )}
                    <p className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Joined {formatDate(userDetails.user.createdAt)}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Last seen {formatDateTime(userDetails.user.lastSignedIn)}
                    </p>
                  </div>
                  {userDetails.user.shippingAddress && (
                    <p className="text-xs text-muted-foreground mt-2 bg-background p-2 rounded border">
                      <strong>Shipping:</strong> {userDetails.user.shippingAddress}
                    </p>
                  )}
                </div>
              </div>

              {/* Role Management */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Role</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={userDetails.user.role === "user" ? "default" : "outline"}
                    onClick={() => updateRole.mutate({ userId: userDetails.user.id, role: "user" })}
                    disabled={updateRole.isPending || userDetails.user.role === "user"}
                  >
                    Customer
                  </Button>
                  <Button
                    size="sm"
                    variant={userDetails.user.role === "admin" ? "default" : "outline"}
                    onClick={() => updateRole.mutate({ userId: userDetails.user.id, role: "admin" })}
                    disabled={updateRole.isPending || userDetails.user.role === "admin"}
                  >
                    Admin
                  </Button>
                </div>
              </div>

              {/* Token Stats */}
              {userDetails.profile && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                    <Coins className="h-4 w-4" /> Token Balance
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-card border rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="text-lg font-bold text-amber-600">
                        {parseFloat(userDetails.profile.tokenBalance).toFixed(0)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        NZ${(parseFloat(userDetails.profile.tokenBalance) * 0.5).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-card border rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Earned</p>
                      <p className="text-lg font-bold text-green-600">
                        {parseFloat(userDetails.profile.totalTokensEarned).toFixed(0)}
                      </p>
                    </div>
                    <div className="bg-card border rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Spent</p>
                      <p className="text-lg font-bold text-blue-600">
                        {parseFloat(userDetails.profile.totalTokensSpent).toFixed(0)}
                      </p>
                    </div>
                    <div className="bg-card border rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Donated</p>
                      <p className="text-lg font-bold text-pink-600">
                        {parseFloat(userDetails.profile.totalTokensDonated).toFixed(0)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className={tierColor(userDetails.profile.membershipTier)}>
                      {userDetails.profile.membershipTier} tier
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Spend limit: NZ${parseFloat(userDetails.profile.spendLimit).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Orders */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <ShoppingCart className="h-4 w-4" /> Orders ({userDetails.orders.length})
                </h4>
                {userDetails.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-3">No orders yet</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {userDetails.orders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-card border rounded-lg text-sm">
                        <div>
                          <span className="font-medium">Order #{order.id}</span>
                          <span className="text-muted-foreground ml-2">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            NZ${parseFloat(order.totalAmount || "0").toFixed(2)}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sell Submissions */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <Package className="h-4 w-4" /> Sell Submissions ({userDetails.sellSubmissions.length})
                </h4>
                {userDetails.sellSubmissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-3">No sell submissions</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {userDetails.sellSubmissions.map((sub: any) => (
                      <div key={sub.id} className="flex items-center justify-between p-3 bg-card border rounded-lg text-sm">
                        <div>
                          <span className="font-medium">{sub.brand} - {sub.itemName}</span>
                          <span className="text-muted-foreground ml-2">{formatDate(sub.createdAt)}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {sub.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Token Transactions */}
              {userDetails.recentTokenTransactions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" /> Recent Token Activity
                  </h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {userDetails.recentTokenTransactions.map((txn: any) => (
                      <div key={txn.id} className="flex items-center justify-between p-2.5 bg-card border rounded text-xs">
                        <div>
                          <span className="font-medium capitalize">{txn.type.replace(/_/g, " ")}</span>
                          {txn.description && (
                            <span className="text-muted-foreground ml-1.5">— {txn.description}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${parseFloat(txn.amount) >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {parseFloat(txn.amount) >= 0 ? "+" : ""}{parseFloat(txn.amount).toFixed(0)} tokens
                          </span>
                          <span className="text-muted-foreground">{formatDate(txn.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">User not found</p>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
