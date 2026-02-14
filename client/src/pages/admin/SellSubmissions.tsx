import { useState, useMemo, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Eye, Check, X, Coins, Mail, MessageSquare, Image as ImageIcon, Send, ArrowRight } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

export default function AdminSellSubmissions() {
  const { user, loading: authLoading } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchBrand, setSearchBrand] = useState("");
  const [tokenOffer, setTokenOffer] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyTokenOffer, setReplyTokenOffer] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const repliesEndRef = useRef<HTMLDivElement>(null);

  // All hooks must be called before any conditional returns
  const { data: submissions, isLoading, refetch } = trpc.sell.listAll.useQuery({
    status: selectedStatus === "all" ? undefined : selectedStatus,
  }, {
    enabled: !!user && user.role === "admin",
  });

  const { data: stats } = trpc.sell.stats.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const { data: replies, refetch: refetchReplies } = trpc.sell.getReplies.useQuery(
    { submissionId: selectedSubmission?.id ?? 0 },
    { enabled: !!selectedSubmission && dialogOpen }
  );
  
  const updateStatusMutation = trpc.sell.updateStatus.useMutation();
  const acceptCounterMutation = trpc.sell.acceptCounterOffer.useMutation();
  const adminReplyMutation = trpc.sell.adminReply.useMutation();

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    return submissions.filter((sub) =>
      sub.brand.toLowerCase().includes(searchBrand.toLowerCase())
    );
  }, [submissions, searchBrand]);

  // Scroll to bottom of replies when new ones arrive
  useEffect(() => {
    if (replies && repliesEndRef.current) {
      repliesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [replies]);

  // Now we can have conditional returns after all hooks
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground">You must be an admin to access this page.</p>
      </div>
    );
  }

  const handleStatusUpdate = async (
    submissionId: number,
    newStatus: string,
    tokens?: string,
    notes?: string,
    sendEmail: boolean = true
  ) => {
    setUpdatingId(submissionId);
    try {
      await updateStatusMutation.mutateAsync({
        id: submissionId,
        status: newStatus as any,
        tokenOffer: tokens ? parseInt(tokens) : undefined,
        adminNotes: notes,
        sendEmail,
      });
      
      if (newStatus === 'offer_made' && sendEmail) {
        toast.success("Token offer sent! Customer will receive an email notification.");
      } else {
        toast.success("Submission updated successfully");
      }
      
      refetch();
      refetchReplies();
      setDialogOpen(false);
      setTokenOffer("");
      setAdminNotes("");
      setSelectedSubmission(null);
    } catch (error) {
      toast.error("Failed to update submission");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAcceptCounter = async (submissionId: number) => {
    setUpdatingId(submissionId);
    try {
      await acceptCounterMutation.mutateAsync({
        id: submissionId,
        adminNotes: adminNotes || undefined,
      });
      toast.success("Counter offer accepted! Customer will receive tokens after shipping.");
      refetch();
      refetchReplies();
      setDialogOpen(false);
      setAdminNotes("");
      setSelectedSubmission(null);
    } catch (error) {
      toast.error("Failed to accept counter offer");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSendReply = async () => {
    if (!selectedSubmission || !replyMessage.trim()) return;
    setSendingReply(true);
    try {
      await adminReplyMutation.mutateAsync({
        submissionId: selectedSubmission.id,
        message: replyMessage.trim(),
        tokenOffer: replyTokenOffer ? parseInt(replyTokenOffer) : undefined,
      });
      toast.success(
        replyTokenOffer
          ? "Reply sent with token offer! Customer will be notified."
          : "Reply sent to customer!"
      );
      setReplyMessage("");
      setReplyTokenOffer("");
      refetchReplies();
      refetch();
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "reviewing": return "bg-blue-100 text-blue-800";
      case "offer_made": return "bg-purple-100 text-purple-800";
      case "offer_accepted": return "bg-emerald-100 text-emerald-800";
      case "offer_rejected": return "bg-orange-100 text-orange-800";
      case "counter_offered": return "bg-indigo-100 text-indigo-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "completed": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "offer_made": return "Token Offer Sent";
      case "offer_accepted": return "Offer Accepted";
      case "offer_rejected": return "Offer Rejected";
      case "counter_offered": return "Counter Offer";
      case "completed": return "Tokens Awarded";
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getSubmissionImages = (submission: any): string[] => {
    return [submission.image1Url, submission.image2Url, submission.image3Url, submission.image4Url]
      .filter((url): url is string => Boolean(url));
  };

  const openReviewDialog = (submission: any) => {
    setSelectedSubmission(submission);
    setTokenOffer(submission.tokenOffer?.toString() || "");
    setAdminNotes(submission.adminNotes || "");
    setSelectedImageIndex(0);
    setReplyMessage("");
    setReplyTokenOffer("");
    setDialogOpen(true);
  };

  return (
    <AdminLayout title="Sell Submissions">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sell Submissions</h1>
        <p className="text-muted-foreground">Review customer submissions and offer tokens (not cash)</p>
      </div>

      {/* Token Info Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <Coins className="w-6 h-6 text-amber-600" />
          <div>
            <p className="font-medium text-amber-900">Circular Economy Model</p>
            <p className="text-sm text-amber-700">
              Customers earn tokens (1 token = NZ$0.50) to shop or donate. No cash payouts.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Reviewing</p>
            <p className="text-2xl font-bold text-blue-600">{stats.reviewing}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Accepted</p>
            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-amber-600">{stats.completed}</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="offer_made">Token Offer Sent</SelectItem>
            <SelectItem value="offer_accepted">Offer Accepted</SelectItem>
            <SelectItem value="offer_rejected">Offer Rejected</SelectItem>
            <SelectItem value="counter_offered">Counter Offer</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Tokens Awarded</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search by brand..."
          value={searchBrand}
          onChange={(e) => setSearchBrand(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Submissions List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No submissions to review right now</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => {
            const images = getSubmissionImages(submission);
            return (
              <Card key={submission.id} className="p-4">
                <div className="flex items-start gap-4">
                  {/* Thumbnail preview */}
                  <div className="flex-shrink-0">
                    {images.length > 0 ? (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border bg-muted">
                        <img
                          src={images[0]}
                          alt={`${submission.brand} ${submission.itemName}`}
                          className="w-full h-full object-cover"
                        />
                        {images.length > 1 && (
                          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            +{images.length - 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg border bg-muted flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg truncate">
                        {submission.brand} - {submission.itemName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(submission.status)}`}>
                        {getStatusLabel(submission.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm text-muted-foreground mb-3">
                      <div>
                        <p className="font-medium text-foreground">Type</p>
                        <p className="capitalize">{submission.itemType}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Size</p>
                        <p>{submission.size}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Condition</p>
                        <p className="capitalize">{submission.condition.replace(/_/g, " ")}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Requested Tokens</p>
                        <p className="flex items-center gap-1">
                          {submission.requestedTokens ? (
                            <><Coins className="w-3.5 h-3.5 text-amber-500" /> {submission.requestedTokens} <span className="text-xs text-muted-foreground">(NZ${(submission.requestedTokens * 0.5).toFixed(2)})</span></>
                          ) : (
                            "Not set"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Submitted</p>
                        <p>{new Date(submission.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {/* Token Offer/Counter info */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {submission.tokenOffer && (
                        <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded">
                          <Coins className="h-4 w-4 text-amber-500" />
                          <span className="text-purple-700">Our Offer: {submission.tokenOffer} tokens (NZ${(submission.tokenOffer * 0.5).toFixed(2)})</span>
                        </div>
                      )}
                      {submission.counterTokenOffer && (
                        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded">
                          <MessageSquare className="h-4 w-4 text-indigo-600" />
                          <span className="text-indigo-700">Counter: {submission.counterTokenOffer} tokens (NZ${(submission.counterTokenOffer * 0.5).toFixed(2)})</span>
                        </div>
                      )}
                      {submission.finalTokens && (
                        <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded">
                          <Check className="h-4 w-4 text-amber-600" />
                          <span className="text-amber-700">Final: {submission.finalTokens} tokens (NZ${(submission.finalTokens * 0.5).toFixed(2)})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Review Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openReviewDialog(submission)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setSelectedSubmission(null);
          setTokenOffer("");
          setAdminNotes("");
          setSelectedImageIndex(0);
          setReplyMessage("");
          setReplyTokenOffer("");
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span>{selectedSubmission.brand} - {selectedSubmission.itemName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.status)}`}>
                    {getStatusLabel(selectedSubmission.status)}
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Images + Details */}
                <div className="space-y-4">
                  {/* Images Gallery */}
                  {(() => {
                    const images = getSubmissionImages(selectedSubmission);
                    if (images.length === 0) {
                      return (
                        <div className="bg-muted rounded-lg p-8 text-center">
                          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">No images uploaded</p>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-3">
                        <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                          <img
                            src={images[selectedImageIndex]}
                            alt={`${selectedSubmission.brand} ${selectedSubmission.itemName} - Image ${selectedImageIndex + 1}`}
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
                            {selectedImageIndex + 1} / {images.length}
                          </div>
                        </div>
                        {images.length > 1 && (
                          <div className="flex gap-2 justify-center">
                            {images.map((url, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedImageIndex(idx)}
                                className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                                  idx === selectedImageIndex 
                                    ? "border-primary ring-2 ring-primary/20" 
                                    : "border-transparent hover:border-muted-foreground/30"
                                }`}
                              >
                                <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Item Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">Brand</p>
                      <p>{selectedSubmission.brand}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Type</p>
                      <p className="capitalize">{selectedSubmission.itemType}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Size</p>
                      <p>{selectedSubmission.size}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Condition</p>
                      <p className="capitalize">{selectedSubmission.condition.replace(/_/g, " ")}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Original Price</p>
                      <p>{selectedSubmission.originalPrice ? `$${selectedSubmission.originalPrice}` : "Not provided"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Requested Tokens</p>
                      <p className="font-semibold text-amber-600 flex items-center gap-1">
                        {selectedSubmission.requestedTokens ? (
                          <><Coins className="w-4 h-4" /> {selectedSubmission.requestedTokens} <span className="text-xs font-normal text-muted-foreground">(NZ${(selectedSubmission.requestedTokens * 0.5).toFixed(2)})</span></>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                    </div>
                  </div>

                  {selectedSubmission.description && (
                    <div className="border-t pt-3">
                      <p className="font-medium text-foreground text-sm mb-1">Description</p>
                      <p className="text-sm text-muted-foreground">{selectedSubmission.description}</p>
                    </div>
                  )}

                  {/* Customer Info */}
                  <div className="border-t pt-3">
                    <p className="font-medium text-foreground text-sm mb-2">Customer</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Name</p>
                        <p>{selectedSubmission.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="truncate">{selectedSubmission.email}</p>
                      </div>
                      {selectedSubmission.phone && (
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p>{selectedSubmission.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Label (if generated) */}
                  {selectedSubmission.shippingLabelUrl && (
                    <div className="border-t pt-3">
                      <p className="font-medium text-foreground text-sm mb-2">Shipping Label</p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-900">Prepaid Label Generated</p>
                            <p className="text-sm text-blue-700">Tracking: {selectedSubmission.trackingNumber}</p>
                            {selectedSubmission.labelSentAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Sent: {new Date(selectedSubmission.labelSentAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <a
                            href={selectedSubmission.shippingLabelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            View Label
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Conversation Thread + Actions */}
                <div className="flex flex-col h-full">
                  {/* Conversation Thread */}
                  <div className="border rounded-lg flex flex-col flex-1 min-h-0">
                    <div className="px-4 py-3 border-b bg-muted/30">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Conversation with {selectedSubmission.name}
                      </h3>
                    </div>

                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px] min-h-[200px]">
                      {/* System message: submission created */}
                      <div className="flex justify-center">
                        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                          Submission created {new Date(selectedSubmission.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Existing offer/counter info as system messages */}
                      {selectedSubmission.tokenOffer && !replies?.some((r: any) => r.senderRole === "admin" && r.tokenOffer) && (
                        <div className="flex justify-center">
                          <span className="text-xs text-purple-700 bg-purple-50 px-3 py-1 rounded-full flex items-center gap-1">
                            <Coins className="w-3 h-3" /> Token offer: {selectedSubmission.tokenOffer} (NZ${(selectedSubmission.tokenOffer * 0.5).toFixed(2)})
                          </span>
                        </div>
                      )}

                      {selectedSubmission.customerResponse && selectedSubmission.customerResponse !== "pending" && !replies?.some((r: any) => r.senderRole === "customer") && (
                        <div className="flex justify-center">
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            selectedSubmission.customerResponse === "accepted" ? "text-green-700 bg-green-50" :
                            selectedSubmission.customerResponse === "rejected" ? "text-red-700 bg-red-50" :
                            "text-indigo-700 bg-indigo-50"
                          }`}>
                            Customer {selectedSubmission.customerResponse === "counter" ? "counter offered" : selectedSubmission.customerResponse}
                            {selectedSubmission.counterTokenOffer && ` — ${selectedSubmission.counterTokenOffer} tokens`}
                          </span>
                        </div>
                      )}

                      {/* Reply messages */}
                      {replies && replies.length > 0 ? (
                        replies.map((reply: any) => (
                          <div
                            key={reply.id}
                            className={`flex ${reply.senderRole === "admin" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                                reply.senderRole === "admin"
                                  ? "bg-stone-900 text-white rounded-br-md"
                                  : "bg-muted text-foreground rounded-bl-md"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold opacity-80">
                                  {reply.senderRole === "admin" ? "Urban Refit" : reply.senderName || selectedSubmission.name}
                                </span>
                                <span className="text-xs opacity-50">
                                  {new Date(reply.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                              {reply.tokenOffer && (
                                <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${
                                  reply.senderRole === "admin"
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
                          <p className="text-sm text-muted-foreground">No messages yet. Start the conversation below.</p>
                        </div>
                      )}
                      <div ref={repliesEndRef} />
                    </div>

                    {/* Reply input */}
                    <div className="border-t p-3 space-y-2">
                      <Textarea
                        placeholder="Type your reply to the customer..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="resize-none text-sm min-h-[60px]"
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
                            placeholder="Token offer (optional)"
                            value={replyTokenOffer}
                            onChange={(e) => setReplyTokenOffer(e.target.value)}
                            className="w-40 h-8 text-sm"
                          />
                          {replyTokenOffer && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              = NZ${(parseFloat(replyTokenOffer) * 0.5).toFixed(2)}
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
                              Reply
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Press Cmd/Ctrl + Enter to send. Attach a token offer to update the formal offer.
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t pt-4 mt-4 space-y-3">
                    <p className="font-medium text-sm text-foreground">Quick Actions</p>
                    
                    {/* Admin Notes */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Internal Notes (not visible to customer)</label>
                      <Input
                        placeholder="Add internal notes..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {selectedSubmission.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(selectedSubmission.id, "reviewing", undefined, adminNotes, false)}
                            disabled={updatingId === selectedSubmission.id}
                            variant="outline"
                          >
                            {updatingId === selectedSubmission.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                            Mark as Reviewing
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(selectedSubmission.id, "rejected", undefined, adminNotes, false)}
                            disabled={updatingId === selectedSubmission.id}
                            variant="destructive"
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {(selectedSubmission.status === "pending" || selectedSubmission.status === "reviewing") && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(selectedSubmission.id, "offer_made", tokenOffer, adminNotes, true)}
                          disabled={updatingId === selectedSubmission.id || !tokenOffer}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {updatingId === selectedSubmission.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Mail className="h-3.5 w-3.5 mr-1.5" />}
                          Send Token Offer
                        </Button>
                      )}

                      {selectedSubmission.status === "counter_offered" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptCounter(selectedSubmission.id)}
                            disabled={updatingId === selectedSubmission.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {updatingId === selectedSubmission.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Check className="h-3.5 w-3.5 mr-1.5" />}
                            Accept Counter ({selectedSubmission.counterTokenOffer} tokens)
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(selectedSubmission.id, "offer_made", tokenOffer, adminNotes, true)}
                            disabled={updatingId === selectedSubmission.id || !tokenOffer}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Mail className="h-3.5 w-3.5 mr-1.5" />
                            New Offer
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(selectedSubmission.id, "rejected", undefined, adminNotes, false)}
                            disabled={updatingId === selectedSubmission.id}
                            variant="destructive"
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {selectedSubmission.status === "offer_accepted" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(selectedSubmission.id, "completed", undefined, adminNotes, false)}
                          disabled={updatingId === selectedSubmission.id}
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          {updatingId === selectedSubmission.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Coins className="h-3.5 w-3.5 mr-1.5" />}
                          Award Tokens ({selectedSubmission.tokenOffer || selectedSubmission.finalTokens})
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
