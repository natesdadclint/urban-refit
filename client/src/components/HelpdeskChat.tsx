import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function HelpdeskChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => nanoid());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { id: nanoid(), role: "assistant", content: data.message },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || sendMessage.isPending) return;

    const userMessage = input.trim();
    setMessages((prev) => [
      ...prev,
      { id: nanoid(), role: "user", content: userMessage },
    ]);
    setInput("");

    sendMessage.mutate({ sessionId, message: userMessage });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Add welcome message when chat opens for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hello, I am Refit, your personal style assistant at Urban Refit. How can I help you today? I can check our current stock, answer questions about shipping and returns, or help you find the perfect pre-loved piece. Please note that I assist multiple customers at once, so if you find something you like, I recommend purchasing it quickly as all items are one-of-a-kind.",
        },
      ]);
    }
  }, [isOpen, messages.length]);

  return (
    <>
      {/* Floating Chat Button - compact icon with hover label */}
      {!isOpen && (
        <div className="group fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-neutral-800 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-neutral-900"
            title="Chat with Urban Refit"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <div className="absolute bottom-12 right-0 mb-2 px-3 py-1.5 bg-neutral-800 text-white text-xs font-medium rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
            Chat with Urban Refit
          </div>
        </div>
      )}

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl bg-background border border-border shadow-2xl transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-500 to-neutral-400 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Urban Refit</h3>
              <p className="text-xs text-white/70">Style assistant</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/10 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="h-[350px] p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    message.role === "user"
                      ? "bg-gradient-to-r from-neutral-500 to-neutral-400 text-white rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {sendMessage.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-3">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="flex-1 rounded-full border-muted-foreground/20 focus-visible:ring-neutral-400"
              disabled={sendMessage.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || sendMessage.isPending}
              size="icon"
              className="rounded-full bg-gradient-to-r from-neutral-500 to-neutral-400 text-white hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Powered by AI • Responses may vary
          </p>
        </div>
      </div>
    </>
  );
}
