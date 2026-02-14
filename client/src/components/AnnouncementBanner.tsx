import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { X, Info, Tag, AlertTriangle, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

const DISMISSED_KEY = "ur-dismissed-banners";

function getDismissedIds(): number[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function dismissBanner(id: number) {
  const dismissed = getDismissedIds();
  if (!dismissed.includes(id)) {
    dismissed.push(id);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
  }
}

const typeConfig = {
  info: {
    icon: Info,
    bg: "bg-sky-600",
    text: "text-white",
    border: "border-sky-700",
    isPromo: false,
  },
  promo: {
    icon: Sparkles,
    bg: "bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900",
    text: "text-white",
    border: "border-stone-700",
    isPromo: true,
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-500",
    text: "text-amber-950",
    border: "border-amber-600",
    isPromo: false,
  },
  urgent: {
    icon: AlertCircle,
    bg: "bg-red-600",
    text: "text-white",
    border: "border-red-700",
    isPromo: false,
  },
};

export default function AnnouncementBanner() {
  const { data: banners } = trpc.banners.getActive.useQuery(undefined, {
    staleTime: 60_000,
  });

  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  useEffect(() => {
    setDismissedIds(getDismissedIds());
  }, []);

  if (!banners || banners.length === 0) return null;

  const visibleBanners = banners.filter((b) => !dismissedIds.includes(b.id));
  if (visibleBanners.length === 0) return null;

  const handleDismiss = (id: number) => {
    dismissBanner(id);
    setDismissedIds((prev) => [...prev, id]);
  };

  return (
    <div className="w-full">
      {visibleBanners.map((banner) => {
        const config = typeConfig[banner.type as keyof typeof typeConfig] || typeConfig.info;
        const Icon = config.icon;

        if (config.isPromo) {
          // Enhanced seasonal promo banner
          return (
            <div
              key={banner.id}
              className={`${config.bg} ${config.border} border-b relative overflow-hidden`}
            >
              {/* Subtle animated shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[promo-shimmer_3s_ease-in-out_infinite]" />
              
              <div className="container relative flex items-center justify-between gap-2 py-1 sm:py-1.5 px-4">
                <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-center">
                  <Sparkles className="h-3 w-3 text-amber-400 shrink-0 animate-pulse" />
                  <p className="text-xs font-medium text-white text-center">
                    <span className="font-bold tracking-wide uppercase text-amber-300">{banner.title}</span>
                    {banner.message && (
                      <span className="ml-1.5 text-white/90 font-normal">{banner.message}</span>
                    )}
                  </p>
                  {banner.linkUrl && (
                    <a
                      href={banner.linkUrl}
                      className="text-amber-300 hover:text-amber-200 underline underline-offset-2 text-xs font-semibold shrink-0 flex items-center gap-0.5 transition-colors"
                    >
                      {banner.linkText || "Shop Now"}
                      <ArrowRight className="h-2.5 w-2.5" />
                    </a>
                  )}
                  <Sparkles className="h-3 w-3 text-amber-400 shrink-0 animate-pulse hidden sm:block" />
                </div>
                <button
                  onClick={() => handleDismiss(banner.id)}
                  className="text-white/60 hover:text-white transition-colors shrink-0 p-0.5"
                  aria-label="Dismiss banner"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        }

        // Standard banner (info, warning, urgent)
        return (
          <div
            key={banner.id}
            className={`${config.bg} ${config.text} ${config.border} border-b`}
          >
            <div className="container flex items-center justify-between gap-3 py-2 px-4">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Icon className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium truncate">
                  <span className="font-semibold">{banner.title}</span>
                  {banner.message && (
                    <span className="ml-1.5 opacity-90">{banner.message}</span>
                  )}
                </p>
                {banner.linkUrl && (
                  <a
                    href={banner.linkUrl}
                    className={`${config.text} underline underline-offset-2 text-sm font-medium shrink-0 flex items-center gap-1 hover:opacity-80 transition-opacity`}
                  >
                    {banner.linkText || "Learn more"}
                    <ArrowRight className="h-3 w-3" />
                  </a>
                )}
              </div>
              <button
                onClick={() => handleDismiss(banner.id)}
                className={`${config.text} hover:opacity-70 transition-opacity shrink-0 p-0.5`}
                aria-label="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
