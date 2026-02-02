import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

interface BadgeDisplayProps {
  badge: Badge;
  earned?: boolean;
  progress?: number; // 0-100 for progress towards badge
}

export function BadgeDisplay({ badge, earned = false, progress }: BadgeDisplayProps) {
  const tierColors = {
    bronze: "from-amber-600 to-amber-700",
    silver: "from-gray-400 to-gray-500",
    gold: "from-yellow-400 to-yellow-500",
    platinum: "from-blue-400 to-blue-500",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`
          w-16 h-16 rounded-full flex items-center justify-center text-3xl
          ${earned ? `bg-gradient-to-br ${tierColors[badge.tier]} shadow-lg` : "bg-gray-200 opacity-50"}
          transition-all duration-300 hover:scale-110
        `}
      >
        {badge.icon}
      </div>
      <div className="text-center">
        <p className={`font-semibold text-sm ${earned ? "text-gray-900" : "text-gray-500"}`}>
          {badge.name}
        </p>
        <p className="text-xs text-gray-600">{badge.description}</p>
      </div>
      {progress !== undefined && !earned && (
        <div className="w-full max-w-xs">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">{progress}% progress</p>
        </div>
      )}
    </div>
  );
}

interface BadgeGridProps {
  badges: Badge[];
  earnedBadgeIds?: Set<string>;
}

export function BadgeGrid({ badges, earnedBadgeIds = new Set() }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {badges.map((badge) => (
        <BadgeDisplay
          key={badge.id}
          badge={badge}
          earned={earnedBadgeIds.has(badge.id)}
        />
      ))}
    </div>
  );
}

interface BadgeTierSectionProps {
  tier: "bronze" | "silver" | "gold" | "platinum";
  badges: Badge[];
  earnedBadgeIds?: Set<string>;
}

export function BadgeTierSection({ tier, badges, earnedBadgeIds = new Set() }: BadgeTierSectionProps) {
  const tierBadges = badges.filter((b) => b.tier === tier);

  const tierNames = {
    bronze: "Bronze Tier",
    silver: "Silver Tier",
    gold: "Gold Tier",
    platinum: "Platinum Tier",
  };

  const tierDescriptions = {
    bronze: "Starting your sustainability journey",
    silver: "Building environmental impact",
    gold: "Major contributor to sustainability",
    platinum: "Legendary environmental champion",
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{tierNames[tier]}</h3>
        <p className="text-sm text-gray-600">{tierDescriptions[tier]}</p>
      </div>
      <BadgeGrid badges={tierBadges} earnedBadgeIds={earnedBadgeIds} />
    </div>
  );
}

interface UserBadgesDisplayProps {
  earnedBadges: Badge[];
  allBadges: Badge[];
}

export function UserBadgesDisplay({ earnedBadges, allBadges }: UserBadgesDisplayProps) {
  const earnedBadgeIds = new Set(earnedBadges.map((b) => b.id));
  const tiers: Array<"bronze" | "silver" | "gold" | "platinum"> = [
    "bronze",
    "silver",
    "gold",
    "platinum",
  ];

  return (
    <div className="space-y-8">
      {tiers.map((tier) => (
        <BadgeTierSection
          key={tier}
          tier={tier}
          badges={allBadges}
          earnedBadgeIds={earnedBadgeIds}
        />
      ))}
    </div>
  );
}
