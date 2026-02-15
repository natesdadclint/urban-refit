import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Layout from "@/components/Layout";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  User, Coins, Gift, TrendingUp, Package, Heart, 
  ArrowRight, Loader2, Calendar, Mail, Phone, MapPin,
  Sparkles, RefreshCw, ShoppingBag, Bell, Pencil
} from "lucide-react";
import { NotificationPreferences } from "@/components/NotificationPreferences";
import { ReferralCard } from "@/components/ReferralCard";

const CATEGORIES = ["tops", "bottoms", "dresses", "outerwear", "accessories", "shoes", "bags"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function Profile() {
  const { user, loading: authLoading, isAuthenticated, refresh: refreshAuth } = useAuth();
  
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
  
  const updateDetailsMutation = trpc.customerProfile.updateDetails.useMutation({
    onSuccess: () => {
      toast.success("Account details updated successfully");
      refetchProfile();
      refreshAuth();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update account details");
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
  
  // Form state - preferences
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [emailMarketing, setEmailMarketing] = useState(true);
  const [smsMarketing, setSmsMarketing] = useState(false);
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [preferredSizes, setPreferredSizes] = useState<string[]>([]);
  const [convertAmount, setConvertAmount] = useState("");
  
  // Form state - account details
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPhone, setAccountPhone] = useState("");
  const [accountAddress, setAccountAddress] = useState("");
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  
  // Initialize form from profile
  useEffect(() => {
    if (profile) {
      setGender(profile.gender || "");
      setDateOfBirth(profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "");
      setEmailMarketing(profile.emailMarketing ?? true);
      setSmsMarketing(profile.smsMarketing ?? false);
      try {
        setPreferredCategories(profile.preferredCategories ? JSON.parse(profile.preferredCategories) : []);
        setPreferredSizes(profile.preferredSizes ? JSON.parse(profile.preferredSizes) : []);
      } catch {
        setPreferredCategories([]);
        setPreferredSizes([]);
      }
      // Initialize account details from profile
      setAccountName(profile.userName || "");
      setAccountEmail(profile.userEmail || "");
      setAccountPhone(profile.userPhone || "");
      setAccountAddress(profile.userShippingAddress || "");
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
  
  const handleSaveDetails = () => {
    updateDetailsMutation.mutate({
      name: accountName || undefined,
      email: accountEmail || undefined,
      phone: accountPhone || undefined,
      shippingAddress: accountAddress || undefined,
    });
    setIsEditingDetails(false);
  };
  
  const handleCancelEdit = () => {
    // Reset to profile values
    setAccountName(profile?.userName || "");
    setAccountEmail(profile?.userEmail || "");
    setAccountPhone(profile?.userPhone || "");
    setAccountAddress(profile?.userShippingAddress || "");
    setIsEditingDetails(false);
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
        <PageBreadcrumb className="mb-6" segments={[{ label: "My Profile" }]} />
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
                  <p className="font-medium">{profile?.userName || user?.name || 'Member'}</p>
                  <p className="text-sm text-muted-foreground">{profile?.userEmail || user?.email}</p>
                  {profile?.userPhone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {profile.userPhone}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button asChild>
                  <Link href="/sell">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Sell Your Items
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/my-submissions">
                    <Package className="h-4 w-4 mr-2" />
                    My Submissions
                  </Link>
                </Button>
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
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto">
            <TabsTrigger value="account" className="flex-shrink-0 px-4">Account</TabsTrigger>
            <TabsTrigger value="rewards" className="flex-shrink-0 px-4">Rewards</TabsTrigger>
            <TabsTrigger value="preferences" className="flex-shrink-0 px-4">Preferences</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-shrink-0 px-4">Notifications</TabsTrigger>
            <TabsTrigger value="orders" className="flex-shrink-0 px-4">Orders</TabsTrigger>
            <TabsTrigger value="returns" className="flex-shrink-0 px-4">Returns</TabsTrigger>
            <TabsTrigger value="donations" className="flex-shrink-0 px-4">Donations</TabsTrigger>
          </TabsList>
          
          {/* Account Details Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Details
                  </CardTitle>
                  <CardDescription>
                    Your personal information and contact details
                  </CardDescription>
                </div>
                {!isEditingDetails && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingDetails(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditingDetails ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountName">Full Name</Label>
                        <Input
                          id="accountName"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountEmail">Email Address</Label>
                        <Input
                          id="accountEmail"
                          type="email"
                          value={accountEmail}
                          onChange={(e) => setAccountEmail(e.target.value)}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountPhone">Phone Number</Label>
                        <Input
                          id="accountPhone"
                          type="tel"
                          value={accountPhone}
                          onChange={(e) => setAccountPhone(e.target.value)}
                          placeholder="+64 21 123 4567"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="accountAddress">Shipping Address</Label>
                      <Textarea
                        id="accountAddress"
                        value={accountAddress}
                        onChange={(e) => setAccountAddress(e.target.value)}
                        placeholder="Enter your shipping address"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleSaveDetails}
                        disabled={updateDetailsMutation.isPending}
                      >
                        {updateDetailsMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Details"
                        )}
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Full Name</p>
                          <p className="font-medium">{profile?.userName || "Not set"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email Address</p>
                          <p className="font-medium">{profile?.userEmail || "Not set"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone Number</p>
                          <p className="font-medium">{profile?.userPhone || "Not set"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Shipping Address</p>
                          <p className="font-medium whitespace-pre-line">{profile?.userShippingAddress || "Not set"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="font-medium">
                          {profile?.memberSince 
                            ? new Date(profile.memberSince).toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })
                            : "Unknown"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            {/* Referral Program - TOP PRIORITY */}
            <ReferralCard />
            
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
                  {convertAmount && parseFloat(convertAmount) > 0 && (
                    <p className="text-sm text-primary font-medium">
                      {parseFloat(convertAmount).toFixed(2)} tokens = NZ${(parseFloat(convertAmount) * 0.50).toFixed(2)} spend limit
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    1 token = NZ$0.50 spend limit. Spend limit can be used on orders of 3+ items.
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
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5 border-primary/20">
                    <div className="flex items-center gap-3">
                      <Coins className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="font-medium">Sell Your Items</p>
                        <p className="text-sm text-muted-foreground">Trade pre-loved fashion for tokens</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/sell">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
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
                    No token activity yet. Shop or return items to start earning rewards!
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
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationPreferences />
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
                    <p className="text-muted-foreground mb-4">No orders yet – your sustainable wardrobe awaits</p>
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
                    <p className="text-muted-foreground mb-4">No returns yet – that's a good sign!</p>
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
          
          {/* Donations Tab */}
          <TabsContent value="donations">
            {/* Donation Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 dark:bg-pink-950 rounded-lg">
                      <Heart className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Donated</p>
                      <p className="text-2xl font-bold">
                        NZ${charityDonations ? charityDonations.reduce((sum: number, d: any) => sum + parseFloat(d.donation.dollarValue), 0).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                      <Sparkles className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tax Credits Earned</p>
                      <p className="text-2xl font-bold text-green-600">
                        NZ${charityDonations ? (charityDonations.reduce((sum: number, d: any) => sum + parseFloat(d.donation.dollarValue), 0) * 0.33).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Coins className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tokens Donated</p>
                      <p className="text-2xl font-bold">
                        {charityDonations ? charityDonations.reduce((sum: number, d: any) => sum + parseFloat(d.donation.tokenAmount), 0).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Tax Credit Info Banner */}
            <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-green-600" />
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">33% Tax Credit Rebate</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Under NZ tax law, donations of NZ$5+ to approved charities qualify for a 33.33% tax credit. 
                Urban Refit provides donation receipts for your IRD tax return.
              </p>
            </div>
            
            {/* Donation History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Donation History</CardTitle>
                  <CardDescription>Your charitable contributions and tax credits</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/charities">
                    <Heart className="h-4 w-4 mr-2" />
                    Donate Now
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {charityDonations && charityDonations.length > 0 ? (
                  <div className="space-y-4">
                    {charityDonations.map((item: any) => {
                      const dollarValue = parseFloat(item.donation.dollarValue);
                      const taxCredit = dollarValue * 0.33;
                      return (
                        <div key={item.donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{item.charity.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.donation.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {parseFloat(item.donation.tokenAmount).toFixed(2)} tokens
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">
                              NZ${dollarValue.toFixed(2)}
                            </p>
                            <p className="text-sm text-green-600 font-medium">
                              Tax credit: NZ${taxCredit.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">No donations yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Donate your tokens to charity and earn a 33% tax credit rebate!
                    </p>
                    <Button asChild>
                      <Link href="/charities">Browse Charities</Link>
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
