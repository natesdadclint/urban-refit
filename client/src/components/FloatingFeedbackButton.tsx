import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FeedbackForm } from "./FeedbackForm";

export function FloatingFeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button with tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            className="fixed right-6 bottom-20 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all bg-amber-600 hover:bg-amber-700 text-white"
            size="icon"
            aria-label="Send feedback"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={8}>
          <p>Send Feedback</p>
        </TooltipContent>
      </Tooltip>

      {/* Feedback dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feedback</DialogTitle>
            <DialogDescription>
              We'd love to hear from you! Share your thoughts, report bugs, or suggest new features.
            </DialogDescription>
          </DialogHeader>
          <FeedbackForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
