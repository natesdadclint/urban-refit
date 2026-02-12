import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { X, Info, Tag, AlertTriangle, AlertCircle, ArrowRight } from "lucide-react";

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
  },
  promo: {
    icon: Tag,
    bg: "bg-emerald-600",
    text: "text-white",
    border: "border-emerald-700",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-500",
    text: "text-amber-950",
    border: "border-amber-600",
  },
  urgent: {
    icon: AlertCircle,
    bg: "bg-red-600",
    text: "text-white",
    border: "border-red-700",
  },
};

export default function AnnouncementBanner() {
  const { data: banners } = trpc.banners.getActive.useQuery(undefined, {
    staleTime: 60_000, // refresh every minute
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
