import { ReactNode } from "react";

/**
 * PageHeader — Enforces a single H1 per page with consistent type scale.
 *
 * Type scale (Sprint 1A):
 *   H1 page title: text-4xl md:text-5xl (2.25rem → 3rem)
 *   Subtitle:      text-base md:text-lg  (1rem → 1.125rem)
 *
 * Usage:
 *   <PageHeader title="Shop" subtitle="Browse our curated collection" />
 *   <PageHeader title="Product Name" subtitle="Brand • Category" variant="compact" />
 */

interface PageHeaderProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  /** "default" = full hero-style header with gradient bg; "compact" = inline header without bg */
  variant?: "default" | "compact";
  /** Additional class names for the outer wrapper */
  className?: string;
  /** Optional content rendered after subtitle (e.g. breadcrumbs, badges) */
  children?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  variant = "default",
  className = "",
  children,
}: PageHeaderProps) {
  if (variant === "compact") {
    return (
      <div className={`mb-6 md:mb-8 ${className}`}>
        {children && <div className="mb-3">{children}</div>}
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-b from-accent/10 to-background py-12 md:py-20 ${className}`}
    >
      <div className="container max-w-4xl">
        {children && <div className="mb-4">{children}</div>}
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
