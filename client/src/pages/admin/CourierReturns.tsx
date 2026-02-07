import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { 
  Package, Check, X, Truck, Eye, Loader2, 
  RefreshCw, DollarSign, Coins
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending_review: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  label_sent: "bg-purple-100 text-purple-800",
  in_transit: "bg-indigo-100 text-indigo-800",
  received: "bg-cyan-100 text-cyan-800",
  inspected: "bg-green-100 text-green-800",
  listed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  completed: "bg-gray-100 text-gray-800",
};

export default function AdminCourierReturns() {
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [inspectDialogOpen, setInspectDialogOpen] = useState(false);
  
  // Form states
  const [estimatedValue, setEstimatedValue] = useState("");
  const [courierService, setCourierService] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  
  const { data: returns, isLoading, refetch } = trpc.courierReturn.listAll.useQuery();
  
  const approveMutation = trpc.courierReturn.approve.useMutation({
    onSuccess: (data) => {
      toast.success(`Return approved! Tokens to award: ${data.tokensAwarded}`);
      setApproveDialogOpen(false);
      setEstimatedValue("");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const sendLabelMutation = trpc.courierReturn.sendLabel.useMutation({
    onSuccess: () => {
      toast.success("Shipping label sent to customer");
      setLabelDialogOpen(false);
      setCourierService("");
      setTrackingNumber("");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const markReceivedMutation = trpc.courierReturn.markReceived.useMutation({
    onSuccess: () => {
      toast.success("Return marked as received");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const completeInspectionMutation = trpc.courierReturn.completeInspection.useMutation({
    onSuccess: () => {
      toast.success("Inspection completed");
      setInspectDialogOpen(false);
      setInspectionNotes("");
      setRejectionReason("");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const completeMutation = trpc.courierReturn.complete.useMutation({
    onSuccess: () => {
      toast.success("Return completed");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const getStatusCounts = () => {
    if (!returns) return {};
    return returns.reduce((acc: Record<string, number>, r: any) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});
  };
  
  const statusCounts = getStatusCounts();
  
  const filterByStatus = (status: string) => {
    if (!returns) return [];
    if (status === "all") return returns;
    return returns.filter((r: any) => r.status === status);
  };
  
  const handleApprove = () => {
    if (!selectedReturn || !estimatedValue) return;
    approveMutation.mutate({
      id: selectedReturn.id,
      estimatedResaleValue: parseFloat(estimatedValue),
    });
  };
  
  const handleSendLabel = () => {
    if (!selectedReturn || !courierService || !trackingNumber) return;
    sendLabelMutation.mutate({
      id: selectedReturn.id,
      courierService,
      trackingNumber,
    });
  };
  
  const handleInspection = (approved: boolean) => {
    if (!selectedReturn) return;
    completeInspectionMutation.mutate({
      id: selectedReturn.id,
      approved,
      inspectionNotes: inspectionNotes || undefined,
      rejectionReason: !approved ? rejectionReason : undefined,
    });
  };
  
  const ReturnCard = ({ returnItem }: { returnItem: any }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Images */}
          <div className="flex gap-2">
            {returnItem.image1Url && (
              <img 
                src={returnItem.image1Url} 
                alt="Front" 
                className="w-20 h-20 object-cover rounded"
              />
            )}
            {returnItem.image2Url && (
              <img 
                src={returnItem.image2Url} 
                alt="Back" 
                className="w-20 h-20 object-cover rounded"
              />
            )}
            {!returnItem.image1Url && !returnItem.image2Url && (
              <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium">{returnItem.itemName}</h3>
                <p className="text-sm text-muted-foreground">
                  {returnItem.itemBrand && `${returnItem.itemBrand} · `}
                  {returnItem.itemCategory} · {returnItem.itemSize || 'No size'}
                </p>
              </div>
              <Badge className={STATUS_COLORS[returnItem.status] || ""}>
                {returnItem.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
              <div>
                <span className="text-muted-foreground">Condition:</span>{" "}
                <span className="capitalize">{returnItem.itemCondition.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="text-muted-foreground">User ID:</span>{" "}
                {returnItem.userId}
              </div>
              {returnItem.estimatedResaleValue && (
                <div>
                  <span className="text-muted-foreground">Est. Value:</span>{" "}
                  NZ${parseFloat(returnItem.estimatedResaleValue).toFixed(2)}
                </div>
              )}
              {returnItem.tokensAwarded && (
                <div>
                  <span className="text-muted-foreground">Tokens:</span>{" "}
                  {parseFloat(returnItem.tokensAwarded).toFixed(2)} <span className="text-xs text-muted-foreground">(NZ${(parseFloat(returnItem.tokensAwarded) * 0.5).toFixed(2)})</span>
                </div>
              )}
            </div>
            
            {returnItem.trackingNumber && (
              <p className="text-sm mb-3">
                <span className="text-muted-foreground">Tracking:</span>{" "}
                {returnItem.courierService} - {returnItem.trackingNumber}
              </p>
            )}
            
            {/* Actions based on status */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedReturn(returnItem);
                  setDialogOpen(true);
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              
              {returnItem.status === "pending_review" && (
                <Button 
                  size="sm"
                  onClick={() => {
                    setSelectedReturn(returnItem);
                    setApproveDialogOpen(true);
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              )}
              
              {returnItem.status === "approved" && (
                <Button 
                  size="sm"
                  onClick={() => {
                    setSelectedReturn(returnItem);
                    setLabelDialogOpen(true);
                  }}
                >
                  <Truck className="h-4 w-4 mr-1" />
                  Send Label
                </Button>
              )}
              
              {returnItem.status === "label_sent" && (
                <Button 
                  size="sm"
                  onClick={() => markReceivedMutation.mutate({ id: returnItem.id })}
                  disabled={markReceivedMutation.isPending}
                >
                  <Package className="h-4 w-4 mr-1" />
                  Mark Received
                </Button>
              )}
              
              {returnItem.status === "received" && (
                <Button 
                  size="sm"
                  onClick={() => {
                    setSelectedReturn(returnItem);
                    setInspectDialogOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Complete Inspection
                </Button>
              )}
              
              {returnItem.status === "inspected" && (
                <Button 
                  size="sm"
                  onClick={() => completeMutation.mutate({ id: returnItem.id })}
                  disabled={completeMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  if (isLoading) {
    return (
      <AdminLayout title="Courier Returns">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="Courier Returns">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Courier Returns</h1>
            <p className="text-muted-foreground">
              Manage customer garment returns and token awards
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{statusCounts.pending_review || 0}</div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{statusCounts.label_sent || 0}</div>
              <p className="text-sm text-muted-foreground">In Transit</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{statusCounts.received || 0}</div>
              <p className="text-sm text-muted-foreground">Awaiting Inspection</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{statusCounts.completed || 0}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Returns List */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({returns?.length || 0})</TabsTrigger>
            <TabsTrigger value="pending_review">Pending ({statusCounts.pending_review || 0})</TabsTrigger>
            <TabsTrigger value="received">To Inspect ({statusCounts.received || 0})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({statusCounts.completed || 0})</TabsTrigger>
          </TabsList>
          
          {["all", "pending_review", "received", "completed"].map((status) => (
            <TabsContent key={status} value={status}>
              {filterByStatus(status).length > 0 ? (
                filterByStatus(status).map((returnItem: any) => (
                  <ReturnCard key={returnItem.id} returnItem={returnItem} />
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No returns in this category</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* View Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Return Details</DialogTitle>
          </DialogHeader>
          {selectedReturn && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {selectedReturn.image1Url && (
                  <img src={selectedReturn.image1Url} alt="Front" className="w-full rounded" />
                )}
                {selectedReturn.image2Url && (
                  <img src={selectedReturn.image2Url} alt="Back" className="w-full rounded" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Item:</strong> {selectedReturn.itemName}</div>
                <div><strong>Brand:</strong> {selectedReturn.itemBrand || 'N/A'}</div>
                <div><strong>Category:</strong> {selectedReturn.itemCategory}</div>
                <div><strong>Size:</strong> {selectedReturn.itemSize || 'N/A'}</div>
                <div><strong>Condition:</strong> {selectedReturn.itemCondition}</div>
                <div><strong>Status:</strong> {selectedReturn.status}</div>
              </div>
              {selectedReturn.itemDescription && (
                <div>
                  <strong>Description:</strong>
                  <p className="text-sm text-muted-foreground">{selectedReturn.itemDescription}</p>
                </div>
              )}
              {selectedReturn.inspectionNotes && (
                <div>
                  <strong>Inspection Notes:</strong>
                  <p className="text-sm text-muted-foreground">{selectedReturn.inspectionNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Return</DialogTitle>
            <DialogDescription>
              Set the estimated resale value. Customer will receive 25% as tokens.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Resale Value ($)</label>
              <Input
                type="number"
                placeholder="e.g., 50.00"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                min="0"
                step="0.01"
              />
              {estimatedValue && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Tokens to award: {(parseFloat(estimatedValue) * 0.25).toFixed(2)}</p>
                  <p>NZD value of tokens: NZ${(parseFloat(estimatedValue) * 0.25 * 0.5).toFixed(2)} <span className="text-xs">(at NZ$0.50/token)</span></p>
                </div>
              )}
            </div>
            <Button 
              onClick={handleApprove} 
              className="w-full"
              disabled={approveMutation.isPending || !estimatedValue}
            >
              {approveMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Approve Return
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Send Label Dialog */}
      <Dialog open={labelDialogOpen} onOpenChange={setLabelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Shipping Label</DialogTitle>
            <DialogDescription>
              Enter courier details for the customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Courier Service</label>
              <Input
                placeholder="e.g., FedEx, UPS, USPS"
                value={courierService}
                onChange={(e) => setCourierService(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tracking Number</label>
              <Input
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSendLabel} 
              className="w-full"
              disabled={sendLabelMutation.isPending || !courierService || !trackingNumber}
            >
              {sendLabelMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Truck className="h-4 w-4 mr-2" />
              )}
              Send Label
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Inspection Dialog */}
      <Dialog open={inspectDialogOpen} onOpenChange={setInspectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Inspection</DialogTitle>
            <DialogDescription>
              Review the item and approve or reject the return.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Inspection Notes</label>
              <Textarea
                placeholder="Add notes about the item condition..."
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
              <Textarea
                placeholder="Reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
              />
            </div>
            {selectedReturn?.tokensAwarded && (
              <div className="text-sm p-3 bg-muted rounded space-y-1">
                <p>
                  <Coins className="h-4 w-4 inline mr-1" />
                  Tokens to award on approval: {parseFloat(selectedReturn.tokensAwarded).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground ml-5">
                  NZD value: NZ${(parseFloat(selectedReturn.tokensAwarded) * 0.5).toFixed(2)} (at NZ$0.50/token)
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                variant="destructive"
                onClick={() => handleInspection(false)} 
                className="flex-1"
                disabled={completeInspectionMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button 
                onClick={() => handleInspection(true)} 
                className="flex-1"
                disabled={completeInspectionMutation.isPending}
              >
                {completeInspectionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Approve & Award Tokens
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
