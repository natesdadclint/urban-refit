import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, User, LogOut, Settings, Heart, RefreshCw, Mail, Loader2, ArrowRight, Check, Package } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: React.ReactNode;
}

// Category values must match the database enum: tops, bottoms, dresses, outerwear, accessories, shoes, bags, other
const categories = [
  { name: "All", href: "/shop" },
  { name: "Tops", href: "/shop?category=tops" },
  { name: "Bottoms", href: "/shop?category=bottoms" },
  { name: "Outerwear", href: "/shop?category=outerwear" },
  { name: "Shoes", href: "/shop?category=shoes" },
  { name: "Accessories", href: "/shop?category=accessories" },
];

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [location] = useLocation();

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  
  const { data: cartCount } = trpc.cart.count.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      toast.success(data.alreadySubscribed ? "Already Subscribed" : "Subscribed!", {
        description: data.message,
      });
      setNewsletterEmail("");
      setSubscriptionSuccess(true);
      // Reset success state after 5 seconds
      setTimeout(() => setSubscriptionSuccess(false), 5000);
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to subscribe. Please try again.",
      });
    },
  });

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    subscribeMutation.mutate({
      email: newsletterEmail,
      source: "footer",
      newArrivals: true,
      exclusiveOffers: true,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        {/* Row 1: Logo + Desktop Nav + Actions */}
        <div className="container px-4">
          <div className="flex items-center justify-between h-14 xl:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 md:gap-3 shrink-0">
              <span className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-black"></span>
              <span className="text-lg sm:text-xl md:text-4xl font-serif font-bold tracking-tight whitespace-nowrap">
                Urban Refit
              </span>
              <span className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-black"></span>
            </Link>

            {/* Desktop Navigation — hidden below xl */}
            <nav className="hidden xl:flex items-center gap-3 2xl:gap-5 ml-6 shrink">
              <Link
                href="/shop"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.startsWith("/shop") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Shop
              </Link>
              {categories.slice(1, 5).map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location === cat.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/blog"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.startsWith("/blog") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Blog
              </Link>
              <Link
                href="/about"
                className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                  location === "/about" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                About Us
              </Link>
              <Link
                href="/charities"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === "/charities" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Charities
              </Link>
              <Link
                href="/sell"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === "/sell" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Sell
              </Link>
              <Link
                href="/how-tokens-work"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === "/how-tokens-work" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Tokens
              </Link>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              {/* Notifications */}
              {isAuthenticated && <NotificationBell />}
              
              {/* Cart */}
              {isAuthenticated && (
                <Link href="/cart" className="relative">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingBag className="h-5 w-5" />
                    {cartCount && cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
              )}

              {/* User menu */}
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              ) : isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        My Profile & Rewards
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="cursor-pointer">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/courier-return" className="cursor-pointer">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Return Garments
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/charities" className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        Donate Tokens
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-submissions" className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        My Submissions
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button asChild variant="outline" size="sm" className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm">
                    <Link href="/join">Join</Link>
                  </Button>
                  <Button asChild variant="default" size="sm" className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm">
                    <a href={getLoginUrl()}>Sign In</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Scrollable nav — visible on mobile/tablet, hidden on xl+ (where desktop nav shows) */}
        <nav className="xl:hidden border-t border-border/50">
          <div className="flex items-center overflow-x-auto scrollbar-hide px-4 gap-1">
            {[
              { label: "Shop", href: "/shop", match: (loc: string) => loc.startsWith("/shop") },
              { label: "Tops", href: "/shop?category=tops", match: (loc: string) => loc === "/shop?category=tops" },
              { label: "Bottoms", href: "/shop?category=bottoms", match: (loc: string) => loc === "/shop?category=bottoms" },
              { label: "Outerwear", href: "/shop?category=outerwear", match: (loc: string) => loc === "/shop?category=outerwear" },
              { label: "Shoes", href: "/shop?category=shoes", match: (loc: string) => loc === "/shop?category=shoes" },
              { label: "Blog", href: "/blog", match: (loc: string) => loc.startsWith("/blog") },
              { label: "About", href: "/about", match: (loc: string) => loc === "/about" },
              { label: "Charities", href: "/charities", match: (loc: string) => loc === "/charities" },
              { label: "Sell", href: "/sell", match: (loc: string) => loc === "/sell" },
              { label: "Tokens", href: "/how-tokens-work", match: (loc: string) => loc === "/how-tokens-work" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  item.match(location)
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30">
        <div className="container py-8 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {/* Brand and Newsletter */}
            <div className="col-span-2 md:col-span-2">
              <h3 className="text-lg sm:text-xl font-serif font-semibold mb-3 sm:mb-4">Urban Refit</h3>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-md mb-4 sm:mb-6">
                Curated Premium brands. We source the finest pre-loved fashion
                from local thrift stores, giving garments a second life while supporting
                our community partners.
              </p>
              
              {/* Newsletter Signup */}
              <div className="max-w-sm">
                <h4 className="font-semibold mb-3 text-sm">Stay Updated</h4>
                
                {subscriptionSuccess ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">Successfully subscribed!</p>
                      <p className="text-xs text-green-600 dark:text-green-400">You'll receive updates about new arrivals and offers.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          className="pl-10 bg-background"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        size="icon" 
                        disabled={subscribeMutation.isPending}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {subscribeMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
                      </Button>
                    </form>
                    <p className="text-xs text-muted-foreground mt-2">
                      Get notified about new arrivals and exclusive offers.
                    </p>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Shop</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                {categories.slice(0, 5).map((cat) => (
                  <li key={cat.href}>
                    <Link href={cat.href} className="hover:text-primary transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Company</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <Link href="/reviews" className="hover:text-primary transition-colors">
                    Reviews
                  </Link>
                </li>
                <li>
                  <Link href="/partners" className="hover:text-primary transition-colors">
                    Our Partners
                  </Link>
                </li>
                <li>
                  <Link href="/sustainability" className="hover:text-primary transition-colors">
                    Sustainability
                  </Link>
                </li>
                <li>
                  <Link href="/how-tokens-work" className="hover:text-primary transition-colors">
                    How Tokens Work
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/roadmap" className="hover:text-primary transition-colors">
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link href="/our-process" className="hover:text-primary transition-colors">
                    Our Process
                  </Link>
                </li>
                <li>
                  <Link href="/quality-standards" className="hover:text-primary transition-colors">
                    Quality Standards
                  </Link>
                </li>
                <li>
                  <Link href="/founder" className="hover:text-primary transition-colors">
                    Meet the Founder
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/refund-policy" className="hover:text-primary transition-colors">
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Join Us</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/join" className="hover:text-primary transition-colors">
                    Become a Member
                  </Link>
                </li>
                <li>
                  <Link href="/charities" className="hover:text-primary transition-colors">
                    Charity Partners
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Urban Refit. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              5% of every sale goes back to our thrift store partners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
