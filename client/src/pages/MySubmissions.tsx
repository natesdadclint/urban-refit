import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Package, Clock, Check, X, Coins, ArrowRight, MessageSquare, ShoppingBag, Heart } from "lucide-react";
import { Link } from "wouter";
import Layout from "@/components/Layout";

export default function MySubmissions() {
  const { user, isAuthenticated, loading } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [counterTokens, setCounterTokens] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: submissions, isLoading, refetch } = trpc.sell.mySubmissions.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const respondMutation = trpc.sell.respondToOffer.useMutation();

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">My Submissions</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Sign in to view your submissions and respond to token offers from Urban Refit.
          </p>
          <Button asChild size="lg">
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </Layout>
    );
  }

  const handleRespond = async (submissionId: number, response: 'accepted' | 'rejected' | 'counter') => {
    setRespondingId(submissionId);
    try {
      await respondMutation.mutateAsync({
        id: submissionId,
        response,
        counterTokenOffer: response === 'counter' ? parseInt(counterTokens) : undefined,
        customerNotes: customerNotes || undefined,
      });
      
      if (response === 'accepted') {
        toast.success("Token offer accepted! We'll be in touch with shipping details.");
      } else if (response === 'rejected') {
        toast.success("Offer declined. Thank you for considering Urban Refit.");
      } else {
        toast.success("Counter offer sent! We'll review and get back to you.");
      }
      
      refetch();
      setDialogOpen(false);
      setCounterTokens("");
      setCustomerNotes("");
    } catch (error: any) {
      toast.error(error.message || "Failed to respond to offer");
    } finally {
      setRespondingId(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "Pending Review", color: "bg-yellow-100 text-yellow-800", icon: Clock };
      case "reviewing":
        return { label: "Under Review", color: "bg-blue-100 text-blue-800", icon: Package };
      case "offer_made":
        return { label: "Token Offer Received", color: "bg-purple-100 text-purple-800", icon: Coins };
      case "offer_accepted":
        return { label: "Offer Accepted", color: "bg-emerald-100 text-emerald-800", icon: Check };
      case "offer_rejected":
        return { label: "Offer Declined", color: "bg-orange-100 text-orange-800", icon: X };
      case "counter_offered":
        return { label: "Counter Sent", color: "bg-indigo-100 text-indigo-800", icon: MessageSquare };
      case "accepted":
        return { label: "Accepted", color: "bg-green-100 text-green-800", icon: Check };
      case "rejected":
        return { label: "Not Accepted", color: "bg-red-100 text-red-800", icon: X };
      case "completed":
        return { label: "Tokens Awarded", color: "bg-amber-100 text-amber-800", icon: Coins };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800", icon: Package };
    }
  };

  return (
    <Layout>
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Submissions</h1>
            <p className="text-muted-foreground">
              Track your submissions and respond to token offers from Urban Refit.
            </p>
          </div>

          {/* Token Info Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Earn Tokens, Not Cash</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Urban Refit operates on a circular economy. When we accept your items, you earn tokens (1 token = $1 NZD) 
                  that you can use to shop our collection or donate to our partner charities.
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <ShoppingBag className="w-4 h-4" /> Shop with tokens
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <Heart className="w-4 h-4" /> Donate to charity
                  </span>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !submissions || submissions.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No Submissions Yet</h2>
              <p className="text-muted-foreground mb-6">
                Have quality pre-loved items? Submit them to Urban Refit and earn tokens for your next wardrobe refresh.
              </p>
              <Button asChild>
                <Link href="/sell-to-us">
                  Trade Your Items for Tokens
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => {
                const statusInfo = getStatusInfo(submission.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <Card key={submission.id} className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image */}
                      {submission.image1Url && (
                        <div className="w-full md:w-32 h-32 flex-shrink-0">
                          <img
                            src={submission.image1Url}
                            alt={submission.itemName}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}
                      
                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {submission.brand} - {submission.itemName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Submitted {new Date(submission.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusInfo.label}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                          <div>
                            <p className="text-muted-foreground">Type</p>
                            <p className="capitalize">{submission.itemType}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Size</p>
                            <p>{submission.size}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Condition</p>
                            <p className="capitalize">{submission.condition.replace(/_/g, " ")}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Requested Tokens</p>
                            <p className="font-medium flex items-center gap-1">
                              {submission.requestedTokens ? (
                                <><Coins className="w-3.5 h-3.5 text-amber-500" /> {submission.requestedTokens}</>
                              ) : (
                                "Not set"
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Token Offer Section */}
                        {submission.status === 'offer_made' && submission.tokenOffer && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-sm text-purple-700 font-medium">Our Token Offer</p>
                                <p className="text-2xl font-bold text-purple-900 flex items-center gap-2">
                                  <Coins className="w-6 h-6 text-amber-500" />
                                  {submission.tokenOffer} tokens
                                </p>
                                <p className="text-xs text-purple-600">= ${submission.tokenOffer} NZD store credit</p>
                              </div>
                              <Dialog open={dialogOpen && selectedSubmission?.id === submission.id} onOpenChange={(open) => {
                                setDialogOpen(open);
                                if (open) setSelectedSubmission(submission);
                              }}>
                                <DialogTrigger asChild>
                                  <Button className="bg-purple-600 hover:bg-purple-700">
                                    Respond to Offer
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Respond to Token Offer</DialogTitle>
                                  </DialogHeader>
                                  
                                  <div className="space-y-4 py-4">
                                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 text-center">
                                      <p className="text-sm text-muted-foreground mb-1">Token Offer</p>
                                      <p className="text-3xl font-bold flex items-center justify-center gap-2">
                                        <Coins className="w-8 h-8 text-amber-500" />
                                        {submission.tokenOffer}
                                      </p>
                                      <p className="text-sm text-muted-foreground mt-1">= ${submission.tokenOffer} NZD to shop or donate</p>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      <Button
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        size="lg"
                                        onClick={() => handleRespond(submission.id, 'accepted')}
                                        disabled={respondingId === submission.id}
                                      >
                                        {respondingId === submission.id ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <Check className="h-4 w-4 mr-2" />
                                        )}
                                        Accept Token Offer
                                      </Button>
                                      
                                      <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                          <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                          <span className="bg-background px-2 text-muted-foreground">Or</span>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Make a Counter Offer</label>
                                        <div className="flex gap-2">
                                          <div className="relative flex-1">
                                            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                                            <Input
                                              type="number"
                                              placeholder="Your token request"
                                              value={counterTokens}
                                              onChange={(e) => setCounterTokens(e.target.value)}
                                              className="pl-10"
                                              min="1"
                                            />
                                          </div>
                                          <Button
                                            variant="outline"
                                            onClick={() => handleRespond(submission.id, 'counter')}
                                            disabled={respondingId === submission.id || !counterTokens}
                                          >
                                            {respondingId === submission.id ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              "Send"
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium">Add a Note (optional)</label>
                                        <textarea
                                          placeholder="Any additional comments..."
                                          value={customerNotes}
                                          onChange={(e) => setCustomerNotes(e.target.value)}
                                          className="w-full px-3 py-2 border rounded-md text-sm"
                                          rows={2}
                                        />
                                      </div>
                                      
                                      <Button
                                        variant="outline"
                                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleRespond(submission.id, 'rejected')}
                                        disabled={respondingId === submission.id}
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Decline Offer
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                            <p className="text-sm text-purple-700">
                              Review our token offer and accept, decline, or make a counter offer.
                            </p>
                          </div>
                        )}

                        {/* Counter Offer Sent */}
                        {submission.status === 'counter_offered' && (
                          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-indigo-600" />
                              <p className="text-sm font-medium text-indigo-700">Counter Offer Sent</p>
                            </div>
                            <p className="text-lg font-bold text-indigo-900 mb-1 flex items-center gap-2">
                              <Coins className="w-5 h-5 text-amber-500" />
                              {submission.counterTokenOffer || 0} tokens
                            </p>
                            <p className="text-sm text-indigo-700">
                              We're reviewing your counter offer. We'll get back to you soon.
                            </p>
                          </div>
                        )}

                        {/* Accepted */}
                        {(submission.status === 'offer_accepted' || submission.status === 'accepted') && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <p className="text-sm font-medium text-green-700">Offer Accepted</p>
                            </div>
                            <p className="text-lg font-bold text-green-900 mb-1 flex items-center gap-2">
                              <Coins className="w-5 h-5 text-amber-500" />
                              {submission.finalTokens || submission.tokenOffer || 0} tokens
                            </p>
                            <p className="text-sm text-green-700">
                              Check your email for shipping instructions. Tokens will be added after we receive your item.
                            </p>
                          </div>
                        )}

                        {/* Completed */}
                        {submission.status === 'completed' && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Coins className="h-4 w-4 text-amber-600" />
                              <p className="text-sm font-medium text-amber-700">Tokens Awarded!</p>
                            </div>
                            <p className="text-lg font-bold text-amber-900 mb-1 flex items-center gap-2">
                              <Coins className="w-5 h-5 text-amber-500" />
                              {submission.finalTokens || submission.tokenOffer || 0} tokens added
                            </p>
                            <p className="text-sm text-amber-700">
                              Thank you for keeping fashion circular! Use your tokens to shop or donate.
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline" asChild>
                                <Link href="/shop">
                                  <ShoppingBag className="w-4 h-4 mr-1" /> Shop Now
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <Link href="/donate-tokens">
                                  <Heart className="w-4 h-4 mr-1" /> Donate
                                </Link>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Have more items to trade?</p>
            <Button asChild variant="outline">
              <Link href="/sell-to-us">
                Submit Another Item
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </Layout>
  );
}
