import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Eye, Check, X, Coins, Mail, MessageSquare, Image as ImageIcon } from "lucide-react";
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

  // All hooks must be called before any conditional returns
  const { data: submissions, isLoading, refetch } = trpc.sell.listAll.useQuery({
    status: selectedStatus === "all" ? undefined : selectedStatus,
  }, {
    enabled: !!user && user.role === "admin",
  });

  const { data: stats } = trpc.sell.stats.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });
  
  const updateStatusMutation = trpc.sell.updateStatus.useMutation();
  const acceptCounterMutation = trpc.sell.acceptCounterOffer.useMutation();

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    return submissions.filter((sub) =>
      sub.brand.toLowerCase().includes(searchBrand.toLowerCase())
    );
  }, [submissions, searchBrand]);

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
      setDialogOpen(false);
      setAdminNotes("");
      setSelectedSubmission(null);
    } catch (error) {
      toast.error("Failed to accept counter offer");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewing":
        return "bg-blue-100 text-blue-800";
      case "offer_made":
        return "bg-purple-100 text-purple-800";
      case "offer_accepted":
        return "bg-emerald-100 text-emerald-800";
      case "offer_rejected":
        return "bg-orange-100 text-orange-800";
      case "counter_offered":
        return "bg-indigo-100 text-indigo-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "offer_made":
        return "Token Offer Sent";
      case "offer_accepted":
        return "Offer Accepted";
      case "offer_rejected":
        return "Offer Rejected";
      case "counter_offered":
        return "Counter Offer";
      case "completed":
        return "Tokens Awarded";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
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
              Customers earn tokens (1 token = $1 NZD) to shop or donate. No cash payouts.
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
                            <><Coins className="w-3.5 h-3.5 text-amber-500" /> {submission.requestedTokens}</>
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
                          <span className="text-purple-700">Our Offer: {submission.tokenOffer} tokens</span>
                        </div>
                      )}
                      {submission.counterTokenOffer && (
                        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded">
                          <MessageSquare className="h-4 w-4 text-indigo-600" />
                          <span className="text-indigo-700">Counter: {submission.counterTokenOffer} tokens</span>
                        </div>
                      )}
                      {submission.finalTokens && (
                        <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded">
                          <Check className="h-4 w-4 text-amber-600" />
                          <span className="text-amber-700">Final: {submission.finalTokens} tokens</span>
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
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedSubmission.brand} - {selectedSubmission.itemName}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
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
                      {/* Main Image */}
                      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                        <img
                          src={images[selectedImageIndex]}
                          alt={`${selectedSubmission.brand} ${selectedSubmission.itemName} - Image ${selectedImageIndex + 1}`}
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
                          {selectedImageIndex + 1} / {images.length}
                        </div>
                      </div>
                      
                      {/* Thumbnails */}
                      {images.length > 1 && (
                        <div className="flex gap-2 justify-center">
                          {images.map((url, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedImageIndex(idx)}
                              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                idx === selectedImageIndex 
                                  ? "border-primary ring-2 ring-primary/20" 
                                  : "border-transparent hover:border-muted-foreground/30"
                              }`}
                            >
                              <img
                                src={url}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
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
                        <><Coins className="w-4 h-4" /> {selectedSubmission.requestedTokens}</>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  </div>
                </div>

                {selectedSubmission.description && (
                  <div className="border-t pt-4">
                    <p className="font-medium text-foreground mb-2">Description</p>
                    <p className="text-sm text-muted-foreground">{selectedSubmission.description}</p>
                  </div>
                )}

                {/* Customer Info */}
                <div className="border-t pt-4">
                  <p className="font-medium text-foreground mb-2">Customer Information</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p>{selectedSubmission.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p>{selectedSubmission.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p>{selectedSubmission.phone || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Response (if any) */}
                {selectedSubmission.customerResponse && (
                  <div className="border-t pt-4">
                    <p className="font-medium text-foreground mb-2">Customer Response</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          selectedSubmission.customerResponse === 'accepted' ? 'bg-green-100 text-green-800' :
                          selectedSubmission.customerResponse === 'rejected' ? 'bg-red-100 text-red-800' :
                          selectedSubmission.customerResponse === 'counter' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedSubmission.customerResponse === 'counter' ? 'Counter Offer' : 
                           selectedSubmission.customerResponse.charAt(0).toUpperCase() + selectedSubmission.customerResponse.slice(1)}
                        </span>
                        {selectedSubmission.customerRespondedAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(selectedSubmission.customerRespondedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {selectedSubmission.counterTokenOffer && (
                        <p className="text-sm flex items-center gap-2">
                          <Coins className="w-4 h-4 text-amber-500" />
                          <span>Counter offer: <strong>{selectedSubmission.counterTokenOffer} tokens</strong></span>
                        </p>
                      )}
                      {selectedSubmission.customerNotes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          "{selectedSubmission.customerNotes}"
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                <div className="border-t pt-4 space-y-4">
                  <p className="font-medium text-foreground">Admin Actions</p>
                  
                  {/* Token Offer Input */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground mb-1 block">Token Offer</label>
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-amber-500" />
                        <Input
                          type="number"
                          placeholder="Enter token amount"
                          value={tokenOffer}
                          onChange={(e) => setTokenOffer(e.target.value)}
                          className="w-32"
                        />
                        <span className="text-sm text-muted-foreground">tokens (= ${tokenOffer || "0"} NZD)</span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Admin Notes (internal)</label>
                    <Input
                      placeholder="Add internal notes..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {selectedSubmission.status === "pending" && (
                      <>
                        <Button
                          onClick={() => handleStatusUpdate(selectedSubmission.id, "reviewing", undefined, adminNotes, false)}
                          disabled={updatingId === selectedSubmission.id}
                          variant="outline"
                        >
                          {updatingId === selectedSubmission.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Mark as Reviewing
                        </Button>
                        <Button
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
                        onClick={() => handleStatusUpdate(selectedSubmission.id, "offer_made", tokenOffer, adminNotes, true)}
                        disabled={updatingId === selectedSubmission.id || !tokenOffer}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {updatingId === selectedSubmission.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                        Send Token Offer
                      </Button>
                    )}

                    {selectedSubmission.status === "counter_offered" && (
                      <>
                        <Button
                          onClick={() => handleAcceptCounter(selectedSubmission.id)}
                          disabled={updatingId === selectedSubmission.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updatingId === selectedSubmission.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                          Accept Counter ({selectedSubmission.counterTokenOffer} tokens)
                        </Button>
                        <Button
                          onClick={() => handleStatusUpdate(selectedSubmission.id, "offer_made", tokenOffer, adminNotes, true)}
                          disabled={updatingId === selectedSubmission.id || !tokenOffer}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send New Offer
                        </Button>
                        <Button
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
                        onClick={() => handleStatusUpdate(selectedSubmission.id, "completed", undefined, adminNotes, false)}
                        disabled={updatingId === selectedSubmission.id}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        {updatingId === selectedSubmission.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Coins className="h-4 w-4 mr-2" />}
                        Award Tokens ({selectedSubmission.tokenOffer || selectedSubmission.finalTokens})
                      </Button>
                    )}
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
