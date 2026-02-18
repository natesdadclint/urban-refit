# CTA Audit Findings

## Current Inconsistencies

### 1. Primary Page CTAs (bottom-of-page "Shop" CTAs)
These are the main conversion CTAs at the bottom of content pages.

| Page | Current Style | Text | Issues |
|------|--------------|------|--------|
| Home.tsx | `size="lg" variant="secondary"` + `gap-2` | "Find Your Next Favourite" + ArrowRight | Uses secondary variant, no rounded-full |
| OurProcess.tsx | `rounded-full bg-foreground text-background hover:bg-foreground/90 px-8 py-6 text-base` | "Shop With Confidence" + ArrowRight | Custom inline colors, not using variant system |
| QualityStandards.tsx | `rounded-full bg-foreground text-background hover:bg-foreground/90 px-8 py-6 text-base` | "Browse Our Collection" + ArrowRight | Same custom inline colors |
| Founder.tsx | `rounded-full bg-foreground text-background hover:bg-foreground/90 px-8 py-6 text-base` | "Shop With Purpose" + ArrowRight | Same custom inline colors |
| Reviews.tsx | `rounded-full bg-black text-white hover:bg-black/90 px-8` | "Shop Now" | Hardcoded black, no ArrowRight |
| BlogPost.tsx | `rounded-full bg-black text-white hover:bg-black/90 px-8 mt-6` | "Shop Now" | Hardcoded black, no ArrowRight |
| HowTokensWork.tsx | `size="lg"` (default variant) | "Shop Now" + ShoppingBag icon | Uses default variant, no rounded-full |

### 2. Link wrapping pattern
- Some use `<Button asChild><Link>` (correct pattern)
- Others use `<Link><Button>` (creates nested anchor issue potential)
- OurProcess, QualityStandards, Founder, Reviews, BlogPost all use `<Link><Button>` pattern

### 3. Hero CTAs (Home.tsx)
- Primary: `size="lg"` default variant with ArrowRight
- Secondary: `variant="outline" size="lg"` with custom bg-white/90

### 4. Inline font-size override
- Home.tsx hero "Shop Now" has `style={{fontSize: '13px'}}` inline override

## Standardisation Rules

### Primary Page CTA (bottom-of-page conversion)
- Use `<Button asChild size="lg">` with default variant
- Always include `<ArrowRight className="h-4 w-4" />` after text
- Use `gap-2` for icon spacing
- NO rounded-full, NO hardcoded colors, NO inline px/py overrides
- Wrap with `<Link href="/shop">` inside Button via asChild

### Secondary CTA (alternative action)
- Use `<Button asChild variant="outline" size="lg">`
- Include icon if contextually appropriate

### Sign In CTA
- Use `<Button asChild size="lg"><a href={getLoginUrl()}>Sign In</a></Button>`

### Navigation/Back CTA
- Use `<Button asChild variant="ghost">` or inline link styling
