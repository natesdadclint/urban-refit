import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FeedbackFormProps {
  onSuccess?: () => void;
}

export function FeedbackForm({ onSuccess }: FeedbackFormProps) {
  const [type, setType] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const submitFeedback = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      toast.success("Feedback submitted", {
        description: "Thank you for your feedback! We'll review it soon.",
      });
      // Reset form
      setType("");
      setCategory("");
      setSubject("");
      setMessage("");
      setEmail("");
      onSuccess?.();
    },    onError: (error: any) => {
      toast.error("Error", {
        description: error.message || "Failed to submit feedback",
      }); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!type || !subject || !message) {
      toast.error("Missing fields", {
        description: "Please fill in all required fields",
      });
      return;
    }

    submitFeedback.mutate({
      type: type as "bug" | "feature" | "general" | "compliment" | "complaint",
      category: category || undefined,
      subject,
      message,
      email: email || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Feedback</CardTitle>
        <CardDescription>
          Help us improve Urban Refit. Your feedback is valuable to us.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Feedback Type *</Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="general">General Feedback</SelectItem>
                <SelectItem value="compliment">Compliment</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="navigation">Navigation</SelectItem>
                <SelectItem value="checkout">Checkout Process</SelectItem>
                <SelectItem value="product">Product Pages</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="design">Design/UI</SelectItem>
                <SelectItem value="mobile">Mobile Experience</SelectItem>
                <SelectItem value="search">Search</SelectItem>
                <SelectItem value="account">Account/Profile</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your feedback"
              required
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us more about your feedback..."
              required
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              maxLength={255}
            />
            <p className="text-sm text-muted-foreground">
              Provide your email if you'd like us to follow up with you.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={submitFeedback.isPending}
          >
            {submitFeedback.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
