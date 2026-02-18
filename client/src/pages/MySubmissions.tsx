import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Package, Clock, Check, X, Coins, ArrowRight, MessageSquare, ShoppingBag, Heart, Send } from "lucide-react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";

export default function MySubmissions() {
  const { user, isAuthenticated, loading } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [counterTokens, setCounterTokens] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyCounterTokens, setReplyCounterTokens] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const repliesEndRef = useRef<HTMLDivElement>(null);

  const { data: submissions, isLoading, refetch } = trpc.sell.mySubmissions.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: replies, refetch: refetchReplies } = trpc.sell.getReplies.useQuery(
    { submissionId: selectedSubmission?.id ?? 0 },
    { enabled: !!selectedSubmission && dialogOpen }
  );

  const respondMutation = trpc.sell.respondToOffer.useMutation();
  const customerReplyMutation = trpc.sell.customerReply.useMutation();

  // Scroll to bottom of replies when new ones arrive
  useEffect(() => {
    if (replies && repliesEndRef.current) {
      repliesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [replies]);

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
          <PageHeader
            title="My Submissions"
            subtitle="Sign in to view your submissions and respond to token offers from Urban Refit."
            variant="compact"
            className="text-center"
          />
          <Button asChild size="lg" className="mt-8">
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
      refetchReplies();
      setDialogOpen(false);
      setCounterTokens("");
      setCustomerNotes("");
    } catch (error: any) {
      toast.error(error.message || "Failed to respond to offer");
    } finally {
      setRespondingId(null);
    }
  };

  const handleSendReply = async () => {
    if (!selectedSubmission || !replyMessage.trim()) return;
    setSendingReply(true);
    try {
      await customerReplyMutation.mutateAsync({
        submissionId: selectedSubmission.id,
        message: replyMessage.trim(),
        counterTokenOffer: replyCounterTokens ? parseInt(replyCounterTokens) : undefined,
      });
      toast.success("Message sent to Urban Refit!");
      setReplyMessage("");
      setReplyCounterTokens("");
      refetchReplies();
      refetch();
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSendingReply(false);
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

  const openConversation = (submission: any) => {
    setSelectedSubmission(submission);
    setReplyMessage("");
    setReplyCounterTokens("");
    setCounterTokens("");
    setCustomerNotes("");
    setDialogOpen(true);
  };

  return (
    <Layout>
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="My Submissions"
            subtitle="Track your submissions and respond to token offers from Urban Refit."
            variant="compact"
            className="mb-8"
          />

          {/* Token Info Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Earn Tokens, Not Cash</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Urban Refit operates on a circular economy. When we accept your items, you earn tokens (1 token = $1.00 NZD) 
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
              <SectionHeader
                title="No Submissions Yet"
                subtitle="Have quality pre-loved items? Submit them to Urban Refit and earn tokens for your next wardrobe refresh."
                centered
                className="mb-6"
              />
              <Button asChild size="lg" className="gap-2">
                <Link href="/sell">
                  Trade Your Items for Tokens
                  <ArrowRight className="h-4 w-4" />
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
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-purple-700 font-medium">Our Token Offer</p>
                                <p className="text-2xl font-bold text-purple-900 flex items-center gap-2">
                                  <Coins className="w-6 h-6 text-amber-500" />
                                  {submission.tokenOffer} tokens
                                </p>
                                <p className="text-xs text-purple-600">= ${(submission.tokenOffer * 1.0).toFixed(2)} NZD store credit</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConversation(submission)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1.5" />
                            View Conversation
                          </Button>
                          {submission.status === 'offer_made' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleRespond(submission.id, 'accepted')}
                                disabled={respondingId === submission.id}
                              >
                                {respondingId === submission.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                                Accept Offer
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRespond(submission.id, 'rejected')}
                                disabled={respondingId === submission.id}
                              >
                                Decline
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Conversation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setSelectedSubmission(null);
          setReplyMessage("");
          setReplyCounterTokens("");
        }
      }}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="w-5 h-5" />
                  {selectedSubmission.brand} - {selectedSubmission.itemName}
                </DialogTitle>
              </DialogHeader>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto space-y-3 py-2 min-h-[200px] max-h-[400px]">
                {/* System message: submission created */}
                <div className="flex justify-center">
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    Submitted {new Date(selectedSubmission.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Token offer system message */}
                {selectedSubmission.tokenOffer && !replies?.some((r: any) => r.senderRole === "admin" && r.tokenOffer) && (
                  <div className="flex justify-center">
                    <span className="text-xs text-purple-700 bg-purple-50 px-3 py-1 rounded-full flex items-center gap-1">
                      <Coins className="w-3 h-3" /> Token offer: {selectedSubmission.tokenOffer} (NZ${(selectedSubmission.tokenOffer * 0.5).toFixed(2)})
                    </span>
                  </div>
                )}

                {/* Reply messages */}
                {replies && replies.length > 0 ? (
                  replies.map((reply: any) => (
                    <div
                      key={reply.id}
                      className={`flex ${reply.senderRole === "customer" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                          reply.senderRole === "customer"
                            ? "bg-stone-900 text-white rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold opacity-80">
                            {reply.senderRole === "admin" ? "Urban Refit" : "You"}
                          </span>
                          <span className="text-xs opacity-50">
                            {new Date(reply.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                        {reply.tokenOffer && (
                          <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${
                            reply.senderRole === "customer"
                              ? "bg-amber-500/20 text-amber-200"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            <Coins className="w-3.5 h-3.5" />
                            {reply.senderRole === "admin" ? "Offer" : "Counter"}: {reply.tokenOffer} tokens (NZ${(reply.tokenOffer * 0.5).toFixed(2)})
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center py-6">
                    <p className="text-sm text-muted-foreground">No messages yet. Send a message below.</p>
                  </div>
                )}
                <div ref={repliesEndRef} />
              </div>

              {/* Reply input */}
              <div className="border-t pt-3 space-y-2">
                <Textarea
                  placeholder="Type your message..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="resize-none text-sm min-h-[50px]"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 flex-1">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <Input
                      type="number"
                      placeholder="Counter offer (optional)"
                      value={replyCounterTokens}
                      onChange={(e) => setReplyCounterTokens(e.target.value)}
                      className="w-44 h-8 text-sm"
                    />
                    {replyCounterTokens && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        = NZ${(parseFloat(replyCounterTokens) * 0.5).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyMessage.trim()}
                    className="bg-stone-900 hover:bg-stone-800"
                  >
                    {sendingReply ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1.5" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Press Cmd/Ctrl + Enter to send
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
