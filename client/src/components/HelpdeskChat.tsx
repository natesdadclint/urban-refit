import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { MessageCircle, X, Send, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";
import { useLocation } from "wouter";

interface ChatProduct {
  id: number;
  name: string;
  brand: string | null;
  salePrice: string;
  image1Url: string | null;
  category: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: ChatProduct[];
}

export function HelpdeskChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => nanoid());
  const [showLabel, setShowLabel] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const labelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [, navigate] = useLocation();

  const sendMessage = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: nanoid(),
          role: "assistant",
          content: data.message,
          products: data.products && data.products.length > 0 ? data.products : undefined,
        },
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

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
    setIsOpen(false);
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
          content: "Hello, I am Refit, your personal style assistant at Urban Refit. How can I help you today? I can check our current stock, suggest complete outfits, answer questions about shipping and returns, or help you find the perfect pre-loved piece. Please note that I assist multiple customers at once, so if you find something you like, I recommend purchasing it quickly as all items are one-of-a-kind.",
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const handleButtonTouchStart = () => {
    setShowLabel(true);
    if (labelTimeoutRef.current) clearTimeout(labelTimeoutRef.current);
    labelTimeoutRef.current = setTimeout(() => setShowLabel(false), 3000);
  };

  const handleButtonTouchEnd = () => {
    if (labelTimeoutRef.current) clearTimeout(labelTimeoutRef.current);
  };

  return (
    <>
      {/* Floating Chat Button - compact icon with hover/touch label */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            onTouchStart={handleButtonTouchStart}
            onTouchEnd={handleButtonTouchEnd}
            className="group flex items-center justify-center h-10 w-10 rounded-full bg-neutral-800 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-neutral-900 active:bg-neutral-950"
            title="Chat with Urban Refit"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <div className={cn("absolute bottom-12 right-0 mb-2 px-3 py-1.5 bg-neutral-800 text-white text-xs font-medium rounded-full whitespace-nowrap transition-opacity duration-200 pointer-events-none shadow-lg", showLabel ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
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
              <div key={message.id}>
                <div
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

                {/* Product Cards */}
                {message.products && message.products.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors text-left group"
                      >
                        {product.image1Url ? (
                          <img
                            src={product.image1Url}
                            alt={product.name}
                            className="w-14 h-14 rounded-lg object-cover shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <span className="text-xs text-muted-foreground">No img</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.brand || "Unbranded"} &middot; {product.category}
                          </p>
                          <p className="text-sm font-semibold text-foreground">${product.salePrice}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
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
              placeholder="Ask about stock, outfits, sizes..."
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
            Powered by AI &middot; Responses may vary
          </p>
        </div>
      </div>
    </>
  );
}
