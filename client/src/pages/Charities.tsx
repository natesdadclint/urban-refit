import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { 
  Heart, Coins, Loader2, ExternalLink, Globe
} from "lucide-react";

export default function Charities() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [selectedCharity, setSelectedCharity] = useState<any>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: charities, isLoading: charitiesLoading } = trpc.charity.list.useQuery();
  
  const { data: profile, refetch: refetchProfile } = trpc.customerProfile.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const { data: donations, refetch: refetchDonations } = trpc.charity.getUserDonations.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const donateMutation = trpc.charity.donate.useMutation({
    onSuccess: () => {
      toast.success(`Thank you for your donation to ${selectedCharity?.name}!`);
      setDialogOpen(false);
      setDonationAmount("");
      setSelectedCharity(null);
      refetchProfile();
      refetchDonations();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process donation");
    },
  });
  
  const handleDonate = () => {
    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (!selectedCharity) {
      toast.error("Please select a charity");
      return;
    }
    
    donateMutation.mutate({
      charityId: selectedCharity.id,
      tokenAmount: amount,
    });
  };
  
  const tokenBalance = parseFloat(profile?.tokenBalance || "0");
  
  if (authLoading || charitiesLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Donate Your Tokens
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Make a difference by donating your earned tokens to charitable organizations. 
            Every token counts towards creating positive change.
          </p>
        </div>
        
        {/* Token Balance Card */}
        {isAuthenticated && (
          <Card className="max-w-md mx-auto mb-12">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Coins className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available to Donate</p>
                    <p className="text-2xl font-bold">{tokenBalance.toFixed(2)} tokens</p>
                  </div>
                </div>
                <Badge variant="secondary">1 token = $1</Badge>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Charities Grid */}
        {charities && charities.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {charities.map((charity: any) => (
              <Card key={charity.id} className="overflow-hidden">
                {charity.logoUrl && (
                  <div className="h-40 bg-muted">
                    <img 
                      src={charity.logoUrl} 
                      alt={charity.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{charity.name}</CardTitle>
                      {charity.category && (
                        <Badge variant="outline" className="mt-1 capitalize">
                          {charity.category}
                        </Badge>
                      )}
                    </div>
                    {charity.website && (
                      <a 
                        href={charity.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {charity.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {charity.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Total received: </span>
                      <span className="font-medium">
                        ${parseFloat(charity.totalDonationsReceived || "0").toFixed(2)}
                      </span>
                    </div>
                    {isAuthenticated ? (
                      <Dialog open={dialogOpen && selectedCharity?.id === charity.id} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (open) setSelectedCharity(charity);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Heart className="h-4 w-4 mr-2" />
                            Donate
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Donate to {charity.name}</DialogTitle>
                            <DialogDescription>
                              Enter the number of tokens you'd like to donate. 
                              Each token equals $1 in donation value.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="p-4 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground mb-1">Your Token Balance</p>
                              <p className="text-2xl font-bold">{tokenBalance.toFixed(2)}</p>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Donation Amount</label>
                              <Input
                                type="number"
                                placeholder="Enter token amount"
                                value={donationAmount}
                                onChange={(e) => setDonationAmount(e.target.value)}
                                min="0.01"
                                max={tokenBalance}
                                step="0.01"
                              />
                              <div className="flex gap-2">
                                {[5, 10, 25, 50].map((amount) => (
                                  <Button
                                    key={amount}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDonationAmount(Math.min(amount, tokenBalance).toString())}
                                    disabled={tokenBalance < amount}
                                  >
                                    {amount}
                                  </Button>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDonationAmount(tokenBalance.toString())}
                                  disabled={tokenBalance <= 0}
                                >
                                  All
                                </Button>
                              </div>
                            </div>
                            <Button 
                              onClick={handleDonate} 
                              className="w-full"
                              disabled={donateMutation.isPending || !donationAmount || parseFloat(donationAmount) <= 0}
                            >
                              {donateMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Heart className="h-4 w-4 mr-2" />
                                  Donate {donationAmount ? `$${parseFloat(donationAmount).toFixed(2)}` : ''}
                                </>
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button size="sm" asChild>
                        <a href={getLoginUrl()}>Sign in to Donate</a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-medium mb-2">No Charities Yet</h2>
            <p className="text-muted-foreground">
              Charity partners will be added soon. Check back later!
            </p>
          </div>
        )}
        
        {/* User's Donation History */}
        {isAuthenticated && donations && donations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Donation History</CardTitle>
              <CardDescription>
                Thank you for making a difference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {donations.map((item: any) => (
                  <div key={item.donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.charity.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {parseFloat(item.donation.tokenAmount).toFixed(2)} tokens
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${parseFloat(item.donation.dollarValue).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Info Section */}
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">About Token Donations</h3>
          <p className="text-sm text-muted-foreground">
            When you donate tokens, they are converted to their dollar equivalent and 
            contributed to your chosen charity. Urban Refit processes all donations 
            and provides receipts for tax purposes. Your generosity helps support 
            important causes while participating in sustainable fashion.
          </p>
        </div>
      </div>
    </Layout>
  );
}
