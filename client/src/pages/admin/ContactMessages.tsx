import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Search, Mail, MailOpen, MessageSquareReply, Archive, Clock, CheckCircle2, Eye, Send, History } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  unread: "bg-blue-100 text-blue-800",
  read: "bg-yellow-100 text-yellow-800",
  replied: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
};

const statusIcons: Record<string, React.ReactNode> = {
  unread: <Mail className="h-4 w-4" />,
  read: <MailOpen className="h-4 w-4" />,
  replied: <MessageSquareReply className="h-4 w-4" />,
  archived: <Archive className="h-4 w-4" />,
};

const statusOptions = [
  { value: "all", label: "All Messages" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
];

export default function AdminContactMessages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  
  // Reply dialog state
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [replySubject, setReplySubject] = useState("Re: Your inquiry to Urban Refit");
  const [replyContent, setReplyContent] = useState("");
  const [showRepliesDialog, setShowRepliesDialog] = useState(false);

  const { data: messages, isLoading } = trpc.contact.list.useQuery();
  const { data: stats } = trpc.contact.stats.useQuery();
  const { data: replies, isLoading: repliesLoading } = trpc.contact.getReplies.useQuery(
    { messageId: selectedMessage?.id || 0 },
    { enabled: !!selectedMessage && showRepliesDialog }
  );
  const utils = trpc.useUtils();

  const updateStatus = trpc.contact.updateStatus.useMutation({
    onSuccess: () => {
      utils.contact.list.invalidate();
      utils.contact.stats.invalidate();
      toast.success("Message status updated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const sendReply = trpc.contact.sendReply.useMutation({
    onSuccess: (data) => {
      utils.contact.list.invalidate();
      utils.contact.stats.invalidate();
      utils.contact.getReplies.invalidate({ messageId: selectedMessage?.id });
      
      if (data.emailSent) {
        toast.success("Reply sent successfully!");
      } else {
        toast.warning(`Reply saved but email failed: ${data.error || "Unknown error"}. Please check your Resend API key.`);
      }
      
      setShowReplyDialog(false);
      setReplyContent("");
      setSelectedMessage(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send reply");
    },
  });

  const markAllAsRead = trpc.contact.markAllAsRead.useMutation({
    onSuccess: (data) => {
      utils.contact.list.invalidate();
      utils.contact.stats.invalidate();
      if (data.count > 0) {
        toast.success(`Marked ${data.count} message${data.count === 1 ? '' : 's'} as read`);
      } else {
        toast.info("No unread messages to mark");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark messages as read");
    },
  });

  const filteredMessages = useMemo(() => {
    if (!messages) return [];
    
    return messages.filter((message) => {
      const matchesSearch =
        !searchQuery ||
        message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || message.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [messages, searchQuery, statusFilter]);

  const handleViewMessage = (message: any) => {
    setSelectedMessage(message);
    setAdminNotes(message.adminNotes || "");
    
    // Auto-mark as read if unread
    if (message.status === "unread") {
      updateStatus.mutate({ id: message.id, status: "read" });
    }
  };

  const handleUpdateStatus = (status: "unread" | "read" | "replied" | "archived") => {
    if (!selectedMessage) return;
    updateStatus.mutate({ 
      id: selectedMessage.id, 
      status,
      adminNotes: adminNotes || undefined,
    });
    setSelectedMessage(null);
  };

  const handleOpenReplyDialog = () => {
    setReplySubject("Re: Your inquiry to Urban Refit");
    setReplyContent("");
    setShowReplyDialog(true);
  };

  const handleSendReply = () => {
    if (!selectedMessage || !replyContent.trim()) {
      toast.error("Please enter a reply message");
      return;
    }
    
    sendReply.mutate({
      messageId: selectedMessage.id,
      subject: replySubject,
      content: replyContent,
    });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-NZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Contact Messages">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Contact Messages">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Manage customer inquiries and feedback
            </p>
          </div>
        {(stats?.unread || 0) > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {markAllAsRead.isPending ? "Marking..." : `Mark All As Read (${stats?.unread})`}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.unread || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replied</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.replied || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
            <Archive className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats?.archived || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by email or message content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Messages Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Message Preview</TableHead>
              <TableHead className="hidden sm:table-cell">Newsletter</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMessages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No messages found
                </TableCell>
              </TableRow>
            ) : (
              filteredMessages.map((message) => (
                <TableRow 
                  key={message.id} 
                  className={message.status === "unread" ? "bg-blue-50/50" : ""}
                >
                  <TableCell>
                    <Badge className={statusColors[message.status]}>
                      <span className="flex items-center gap-1">
                        {statusIcons[message.status]}
                        {message.status}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{message.email}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs truncate text-muted-foreground">
                    {message.message.substring(0, 60)}...
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {message.subscribedToNewsletter ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        No
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(message.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewMessage(message)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage && !showReplyDialog && !showRepliesDialog} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Message from {selectedMessage?.email}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Received: {formatDate(selectedMessage.createdAt)}</span>
                <Badge className={statusColors[selectedMessage.status]}>
                  {selectedMessage.status}
                </Badge>
                {selectedMessage.subscribedToNewsletter && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Newsletter subscriber
                  </Badge>
                )}
              </div>
              
              <div className="bg-stone-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              
              {selectedMessage.repliedAt && (
                <p className="text-sm text-muted-foreground">
                  Replied on: {formatDate(selectedMessage.repliedAt)}
                </p>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  placeholder="Add internal notes about this message..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2 flex-1 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateStatus("unread")}
                disabled={selectedMessage?.status === "unread"}
              >
                <Mail className="h-4 w-4 mr-1" />
                Mark Unread
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateStatus("archived")}
                disabled={selectedMessage?.status === "archived"}
              >
                <Archive className="h-4 w-4 mr-1" />
                Archive
              </Button>
              {selectedMessage?.status === "replied" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRepliesDialog(true)}
                >
                  <History className="h-4 w-4 mr-1" />
                  View Replies
                </Button>
              )}
            </div>
            <Button
              variant="default"
              onClick={handleOpenReplyDialog}
            >
              <Send className="h-4 w-4 mr-1" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Reply to {selectedMessage?.email}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-stone-50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Original message:</p>
              <p className="text-sm whitespace-pre-wrap line-clamp-3">{selectedMessage?.message}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Reply</label>
              <Textarea
                placeholder="Type your reply here..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This reply will be sent directly to the customer's email address.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReplyDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendReply}
              disabled={sendReply.isPending || !replyContent.trim()}
            >
              {sendReply.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Send Reply
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply History Dialog */}
      <Dialog open={showRepliesDialog} onOpenChange={setShowRepliesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Reply History for {selectedMessage?.email}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {repliesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-900"></div>
              </div>
            ) : replies && replies.length > 0 ? (
              replies.map((reply: any) => (
                <div key={reply.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{reply.subject}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                  <div className="flex items-center gap-2 text-xs">
                    {reply.emailSent ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Email sent
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Email failed
                      </Badge>
                    )}
                    {reply.sentByName && (
                      <span className="text-muted-foreground">
                        by {reply.sentByName}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No replies sent yet
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRepliesDialog(false)}
            >
              Close
            </Button>
            <Button onClick={() => {
              setShowRepliesDialog(false);
              handleOpenReplyDialog();
            }}>
              <Send className="h-4 w-4 mr-1" />
              Send Another Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}
