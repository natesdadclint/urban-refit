import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Eye, Check, X, DollarSign, Mail, MessageSquare } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

export default function AdminSellSubmissions() {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchBrand, setSearchBrand] = useState("");
  const [offerAmount, setOfferAmount] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground">You must be an admin to access this page.</p>
      </div>
    );
  }

  const { data: submissions, isLoading, refetch } = trpc.sell.listAll.useQuery({
    status: selectedStatus === "all" ? undefined : selectedStatus,
  });

  const { data: stats } = trpc.sell.stats.useQuery();
  const updateStatusMutation = trpc.sell.updateStatus.useMutation();
  const acceptCounterMutation = trpc.sell.acceptCounterOffer.useMutation();

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    return submissions.filter((sub) =>
      sub.brand.toLowerCase().includes(searchBrand.toLowerCase())
    );
  }, [submissions, searchBrand]);

  const handleStatusUpdate = async (
    submissionId: number,
    newStatus: string,
    amount?: string,
    notes?: string,
    sendEmail: boolean = true
  ) => {
    setUpdatingId(submissionId);
    try {
      await updateStatusMutation.mutateAsync({
        id: submissionId,
        status: newStatus as any,
        offerAmount: amount,
        adminNotes: notes,
        sendEmail,
      });
      
      if (newStatus === 'offer_made' && sendEmail) {
        toast.success("Offer sent! Customer will receive an email notification.");
      } else {
        toast.success("Submission updated successfully");
      }
      
      refetch();
      setDialogOpen(false);
      setOfferAmount("");
      setAdminNotes("");
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
      toast.success("Counter offer accepted! Customer will receive an email notification.");
      refetch();
      setDialogOpen(false);
      setAdminNotes("");
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
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "offer_made":
        return "Offer Sent";
      case "offer_accepted":
        return "Offer Accepted";
      case "offer_rejected":
        return "Offer Rejected";
      case "counter_offered":
        return "Counter Offer";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <AdminLayout title="Sell Submissions">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sell Submissions</h1>
        <p className="text-muted-foreground">Review customer submissions and make offers</p>
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
            <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
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
            <SelectItem value="offer_made">Offer Sent</SelectItem>
            <SelectItem value="offer_accepted">Offer Accepted</SelectItem>
            <SelectItem value="offer_rejected">Offer Rejected</SelectItem>
            <SelectItem value="counter_offered">Counter Offer</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
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
          <p className="text-muted-foreground">No submissions found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {submission.brand} - {submission.itemName}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.status)}`}>
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
                      <p className="font-medium text-foreground">Asking Price</p>
                      <p>{submission.askingPrice ? `$${submission.askingPrice}` : "Not set"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Submitted</p>
                      <p>{new Date(submission.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {/* Offer/Counter info */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {submission.offerAmount && (
                      <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                        <span className="text-purple-700">Our Offer: ${submission.offerAmount}</span>
                      </div>
                    )}
                    {submission.counterOfferAmount && (
                      <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded">
                        <MessageSquare className="h-4 w-4 text-indigo-600" />
                        <span className="text-indigo-700">Counter: ${submission.counterOfferAmount}</span>
                      </div>
                    )}
                    {submission.finalAmount && (
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-700">Final: ${submission.finalAmount}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOfferAmount(submission.offerAmount || "");
                        setAdminNotes(submission.adminNotes || "");
                        setDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {submission.brand} - {submission.itemName}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      {/* Images */}
                      <div className="grid grid-cols-2 gap-4">
                        {[submission.image1Url, submission.image2Url, submission.image3Url, submission.image4Url]
                          .filter((url): url is string => Boolean(url))
                          .map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Submission image ${idx + 1}`}
                              className="w-full h-48 object-cover rounded border"
                            />
                          ))}
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-foreground">Brand</p>
                          <p>{submission.brand}</p>
                        </div>
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
                          <p className="font-medium text-foreground">Original Price</p>
                          <p>{submission.originalPrice ? `$${submission.originalPrice}` : "Not provided"}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Asking Price</p>
                          <p className="font-semibold text-primary">{submission.askingPrice ? `$${submission.askingPrice}` : "Not provided"}</p>
                        </div>
                      </div>

                      {submission.description && (
                        <div className="border-t pt-4">
                          <p className="font-medium text-foreground mb-2">Description</p>
                          <p className="text-sm text-muted-foreground">{submission.description}</p>
                        </div>
                      )}

                      {/* Customer Info */}
                      <div className="border-t pt-4">
                        <p className="font-medium text-foreground mb-2">Customer Information</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Name</p>
                            <p>{submission.name}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Email</p>
                            <p>{submission.email}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Phone</p>
                            <p>{submission.phone || "Not provided"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Customer Response (if any) */}
                      {submission.customerResponse && (
                        <div className="border-t pt-4">
                          <p className="font-medium text-foreground mb-2">Customer Response</p>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                submission.customerResponse === 'accepted' ? 'bg-green-100 text-green-800' :
                                submission.customerResponse === 'rejected' ? 'bg-red-100 text-red-800' :
                                submission.customerResponse === 'counter' ? 'bg-indigo-100 text-indigo-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {submission.customerResponse === 'counter' ? 'Counter Offer' : submission.customerResponse}
                              </span>
                              {submission.customerRespondedAt && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(submission.customerRespondedAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                            {submission.counterOfferAmount && (
                              <p className="text-lg font-semibold text-indigo-700 mb-2">
                                Counter Offer: ${submission.counterOfferAmount}
                              </p>
                            )}
                            {submission.customerNotes && (
                              <p className="text-sm text-muted-foreground">{submission.customerNotes}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Admin Actions */}
                      <div className="border-t pt-4 space-y-4">
                        <p className="font-medium text-foreground">Admin Actions</p>

                        <div>
                          <label className="text-sm font-medium">Offer Amount (NZD)</label>
                          <Input
                            type="number"
                            placeholder="Enter offer amount"
                            value={offerAmount}
                            onChange={(e) => setOfferAmount(e.target.value)}
                            step="0.01"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Admin Notes (internal)</label>
                          <textarea
                            placeholder="Add internal notes..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md text-sm"
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {/* Show different actions based on status */}
                          {(submission.status === 'pending' || submission.status === 'reviewing') && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(submission.id, "reviewing", undefined, adminNotes, false)}
                                disabled={updatingId === submission.id}
                              >
                                {updatingId === submission.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Mark Reviewing
                              </Button>

                              <Button
                                className="bg-purple-600 hover:bg-purple-700"
                                size="sm"
                                onClick={() => handleStatusUpdate(submission.id, "offer_made", offerAmount, adminNotes, true)}
                                disabled={updatingId === submission.id || !offerAmount}
                              >
                                {updatingId === submission.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Mail className="h-4 w-4 mr-2" />
                                )}
                                Send Offer
                              </Button>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleStatusUpdate(submission.id, "rejected", undefined, adminNotes, false)}
                                disabled={updatingId === submission.id}
                              >
                                {updatingId === submission.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4 mr-2" />
                                )}
                                Reject
                              </Button>
                            </>
                          )}

                          {submission.status === 'offer_made' && (
                            <p className="text-sm text-muted-foreground">Waiting for customer response...</p>
                          )}

                          {submission.status === 'counter_offered' && (
                            <>
                              <Button
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                                onClick={() => handleAcceptCounter(submission.id)}
                                disabled={updatingId === submission.id}
                              >
                                {updatingId === submission.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4 mr-2" />
                                )}
                                Accept Counter (${submission.counterOfferAmount})
                              </Button>

                              <Button
                                className="bg-purple-600 hover:bg-purple-700"
                                size="sm"
                                onClick={() => handleStatusUpdate(submission.id, "offer_made", offerAmount, adminNotes, true)}
                                disabled={updatingId === submission.id || !offerAmount}
                              >
                                {updatingId === submission.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Mail className="h-4 w-4 mr-2" />
                                )}
                                Send New Offer
                              </Button>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleStatusUpdate(submission.id, "rejected", undefined, adminNotes, false)}
                                disabled={updatingId === submission.id}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}

                          {(submission.status === 'offer_accepted' || submission.status === 'accepted') && (
                            <>
                              <Button
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                                onClick={() => handleStatusUpdate(submission.id, "completed", undefined, adminNotes, false)}
                                disabled={updatingId === submission.id}
                              >
                                {updatingId === submission.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4 mr-2" />
                                )}
                                Mark Completed
                              </Button>
                            </>
                          )}

                          {submission.status === 'offer_rejected' && (
                            <>
                              <Button
                                className="bg-purple-600 hover:bg-purple-700"
                                size="sm"
                                onClick={() => handleStatusUpdate(submission.id, "offer_made", offerAmount, adminNotes, true)}
                                disabled={updatingId === submission.id || !offerAmount}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Send New Offer
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(submission.id, "rejected", undefined, adminNotes, false)}
                                disabled={updatingId === submission.id}
                              >
                                Close Submission
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
