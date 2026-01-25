import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  User, Coins, Gift, TrendingUp, Package, Heart, 
  ArrowRight, Loader2, Calendar, Mail, Phone, MapPin,
  Sparkles, RefreshCw, ShoppingBag
} from "lucide-react";

const CATEGORIES = ["tops", "bottoms", "dresses", "outerwear", "accessories", "shoes", "bags"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function Profile() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = trpc.customerProfile.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const { data: transactions } = trpc.customerProfile.getTokenTransactions.useQuery(
    { limit: 10 },
    { enabled: isAuthenticated }
  );
  
  const { data: orders } = trpc.order.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const { data: courierReturns } = trpc.courierReturn.getUserReturns.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const { data: charityDonations } = trpc.charity.getUserDonations.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const updateProfileMutation = trpc.customerProfile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      refetchProfile();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
  
  const convertTokensMutation = trpc.customerProfile.convertTokensToSpendLimit.useMutation({
    onSuccess: () => {
      toast.success("Tokens converted to spend limit");
      refetchProfile();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to convert tokens");
    },
  });
  
  // Form state
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [emailMarketing, setEmailMarketing] = useState(true);
  const [smsMarketing, setSmsMarketing] = useState(false);
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [preferredSizes, setPreferredSizes] = useState<string[]>([]);
  const [convertAmount, setConvertAmount] = useState("");
  
  // Initialize form from profile
  useEffect(() => {
    if (profile) {
      setGender(profile.gender || "");
      setDateOfBirth(profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "");
      setEmailMarketing(profile.emailMarketing);
      setSmsMarketing(profile.smsMarketing);
      try {
        setPreferredCategories(profile.preferredCategories ? JSON.parse(profile.preferredCategories) : []);
        setPreferredSizes(profile.preferredSizes ? JSON.parse(profile.preferredSizes) : []);
      } catch {
        setPreferredCategories([]);
        setPreferredSizes([]);
      }
    }
  }, [profile]);
  
  if (authLoading || profileLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="max-w-md mx-auto text-center">
            <User className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-2xl font-serif font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-8">
              Please sign in to access your profile, rewards, and exclusive member benefits.
            </p>
            <Button asChild size="lg">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  const tokenBalance = parseFloat(profile?.tokenBalance || "0");
  const spendLimit = parseFloat(profile?.spendLimit || "0");
  const totalEarned = parseFloat(profile?.totalTokensEarned || "0");
  const totalDonated = parseFloat(profile?.totalTokensDonated || "0");
  
  const handleSavePreferences = () => {
    updateProfileMutation.mutate({
      gender,
      dateOfBirth: dateOfBirth || undefined,
      emailMarketing,
      smsMarketing,
      preferredCategories,
      preferredSizes,
    });
  };
  
  const handleConvertTokens = () => {
    const amount = parseFloat(convertAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amount > tokenBalance) {
      toast.error("Insufficient token balance");
      return;
    }
    convertTokensMutation.mutate({ amount });
    setConvertAmount("");
  };
  
  const toggleCategory = (cat: string) => {
    setPreferredCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };
  
  const toggleSize = (size: string) => {
    setPreferredSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };
  
  const getMembershipColor = (tier: string) => {
    switch (tier) {
      case "platinum": return "bg-gradient-to-r from-slate-300 to-slate-500 text-white";
      case "gold": return "bg-gradient-to-r from-yellow-400 to-amber-500 text-white";
      case "silver": return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800";
      default: return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
    }
  };
  
  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account, rewards, and preferences
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Token Balance</p>
                  <p className="text-2xl font-bold">{tokenBalance.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Spend Limit</p>
                  <p className="text-2xl font-bold">${spendLimit.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold">{totalEarned.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Heart className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Donated</p>
                  <p className="text-2xl font-bold">{totalDonated.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Membership Badge */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Badge className={`px-4 py-2 text-lg capitalize ${getMembershipColor(profile?.membershipTier || 'bronze')}`}>
                  {profile?.membershipTier || 'Bronze'} Member
                </Badge>
                <div>
                  <p className="font-medium">{user?.name || 'Member'}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/courier-return">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Return Garments
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/charities">
                    <Heart className="h-4 w-4 mr-2" />
                    Donate Tokens
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="rewards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
          </TabsList>
          
          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Convert Tokens */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Convert Tokens
                  </CardTitle>
                  <CardDescription>
                    Convert your tokens to spend limit for future purchases
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Available Tokens</p>
                    <p className="text-3xl font-bold">{tokenBalance.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount to convert"
                      value={convertAmount}
                      onChange={(e) => setConvertAmount(e.target.value)}
                      min="0"
                      max={tokenBalance}
                      step="0.01"
                    />
                    <Button 
                      onClick={handleConvertTokens}
                      disabled={convertTokensMutation.isPending || !convertAmount}
                    >
                      {convertTokensMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Convert"
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    1 token = NZ$1 spend limit. Spend limit can be used on orders of 3+ items.
                  </p>
                </CardContent>
              </Card>
              
              {/* Earn More Tokens */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Earn More Tokens
                  </CardTitle>
                  <CardDescription>
                    Ways to earn tokens and rewards
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Return Garments</p>
                        <p className="text-sm text-muted-foreground">Earn 25% of resale value</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/courier-return">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Buy 3+ Items</p>
                        <p className="text-sm text-muted-foreground">Get bonus tokens on bulk orders</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/shop">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Token Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`font-bold ${parseFloat(tx.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {parseFloat(tx.amount) >= 0 ? '+' : ''}{parseFloat(tx.amount).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No token activity yet. Start earning by returning garments or making purchases!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Help us personalize your shopping experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <Label>Preferred Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <Badge
                        key={cat}
                        variant={preferredCategories.includes(cat) ? "default" : "outline"}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleCategory(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Preferred Sizes</Label>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((size) => (
                      <Badge
                        key={size}
                        variant={preferredSizes.includes(size) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleSize(size)}
                      >
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <Label>Communication Preferences</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Marketing</p>
                        <p className="text-sm text-muted-foreground">
                          Receive exclusive offers and new arrivals
                        </p>
                      </div>
                      <Switch
                        checked={emailMarketing}
                        onCheckedChange={setEmailMarketing}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Marketing</p>
                        <p className="text-sm text-muted-foreground">
                          Get flash sale alerts via text
                        </p>
                      </div>
                      <Switch
                        checked={smsMarketing}
                        onCheckedChange={setSmsMarketing}
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSavePreferences}
                  disabled={updateProfileMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order: any) => {
                      const total = parseFloat(order.total);
                      const gstAmount = order.gstAmount ? parseFloat(order.gstAmount) : (parseFloat(order.subtotal) * (15 / 115));
                      return (
                        <div key={order.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">Order #{order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>NZ${parseFloat(order.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>(Includes GST:</span>
                              <span>NZ${gstAmount.toFixed(2)})</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shipping:</span>
                              <span>NZ${parseFloat(order.shippingCost).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-foreground pt-1 border-t">
                              <span>Total:</span>
                              <span>NZ${total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Button asChild>
                      <Link href="/shop">Start Shopping</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Returns Tab */}
          <TabsContent value="returns">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Courier Returns</CardTitle>
                  <CardDescription>Track your garment returns and token earnings</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/courier-return">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    New Return
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {courierReturns && courierReturns.length > 0 ? (
                  <div className="space-y-4">
                    {courierReturns.map((returnItem: any) => (
                      <div key={returnItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{returnItem.itemName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(returnItem.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {returnItem.tokensAwarded && (
                            <p className="font-bold text-green-600">
                              +{parseFloat(returnItem.tokensAwarded).toFixed(2)} tokens
                            </p>
                          )}
                          <Badge variant="outline" className="capitalize">
                            {returnItem.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <RefreshCw className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No returns yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Return garments you no longer wear and earn 25% of the resale value in tokens!
                    </p>
                    <Button asChild>
                      <Link href="/courier-return">Start a Return</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
