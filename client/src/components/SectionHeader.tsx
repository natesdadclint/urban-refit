import { ReactNode } from "react";

/**
 * SectionHeader — Enforces consistent H2/H3 hierarchy within pages.
 *
 * Type scale (Sprint 1A):
 *   H2 section:    text-2xl md:text-3xl  (1.5rem → 1.875rem)  mb-6
 *   H3 subsection: text-xl  md:text-xl   (1.25rem)             mb-3
 *
 * Usage:
 *   <SectionHeader title="Featured Products" />
 *   <SectionHeader title="Shipping Info" level="h3" />
 *   <SectionHeader title="Our Process" subtitle="How we curate" centered />
 */

interface SectionHeaderProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  /** Heading level: h2 (default) or h3 */
  level?: "h2" | "h3";
  /** Center-align the heading and subtitle */
  centered?: boolean;
  /** Additional class names for the outer wrapper */
  className?: string;
  children?: ReactNode;
}

export default function SectionHeader({
  title,
  subtitle,
  level = "h2",
  centered = false,
  className = "",
  children,
}: SectionHeaderProps) {
  const align = centered ? "text-center" : "";

  if (level === "h3") {
    return (
      <div className={`mb-3 ${align} ${className}`}>
        <h3 className="text-lg md:text-xl font-serif font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
        {children}
      </div>
    );
  }

  return (
    <div className={`mb-6 ${align} ${className}`}>
      <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-2 text-base text-muted-foreground max-w-2xl ${centered ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
