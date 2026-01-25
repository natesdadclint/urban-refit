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
import { Search, Mail, MailOpen, MessageSquareReply, Archive, Clock, CheckCircle2, Eye } from "lucide-react";
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

  const { data: messages, isLoading } = trpc.contact.list.useQuery();
  const { data: stats } = trpc.contact.stats.useQuery();
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contact Messages</h1>
          <p className="text-muted-foreground">
            Manage customer inquiries and feedback
          </p>
        </div>
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
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
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
            <div className="flex gap-2 flex-1">
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
                onClick={() => handleUpdateStatus("replied")}
                disabled={selectedMessage?.status === "replied"}
              >
                <MessageSquareReply className="h-4 w-4 mr-1" />
                Mark Replied
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
            </div>
            <Button
              variant="default"
              onClick={() => {
                window.location.href = `mailto:${selectedMessage?.email}?subject=Re: Your inquiry to Urban Refit`;
              }}
            >
              <Mail className="h-4 w-4 mr-1" />
              Reply via Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
