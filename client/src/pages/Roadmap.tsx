import { useEffect, useRef, useState } from "react";

// ─── Data ───────────────────────────────────────────────────────────────────

const assessmentRows = [
  { rec: "Page hierarchy (H1/H2)", status: "Partial", statusNote: "Inconsistent across pages", gap: "Global audit and standardisation", tag: "partial" },
  { rec: "Dead-end pages", status: "Missing", statusNote: "No related items", gap: "Build related-items module", tag: "missing" },
  { rec: "Breadcrumbs", status: "Partial", statusNote: "Component exists, not wired", gap: "Wire into product, category, blog", tag: "partial" },
  { rec: "Image quality variance", status: "Partial", statusNote: "CDN uploaded, mixed quality", gap: "Standardised containers + placeholders", tag: "partial" },
  { rec: "CTA inconsistency", status: "Partial", statusNote: "Sizes vary across pages", gap: "CTA audit and standardisation", tag: "partial" },
  { rec: "Skeleton loaders", status: "Partial", statusNote: "Blog, Cart, Home have them", gap: "Product pages and Shop grid lack them", tag: "partial" },
  { rec: "Underpowered filters", status: "Partial", statusNote: "Category, size, brand, price", gap: "Add condition, material, style, sustainability", tag: "partial" },
  { rec: "Swipe navigation", status: "Missing", statusNote: "Not implemented", gap: "Touch gesture navigation between products", tag: "missing" },
  { rec: "Trust pages", status: "Partial", statusNote: "Sustainability + About exist", gap: "Our Process, Quality Standards, Founder", tag: "partial" },
  { rec: "Microcopy near CTAs", status: "Missing", statusNote: "No reassurance text", gap: "Shipping, condition, guarantee badges", tag: "missing" },
  { rec: "Mobile bottom nav", status: "Missing", statusNote: "Header nav only", gap: "Persistent bottom navigation bar", tag: "missing" },
  { rec: "Scarcity indicators", status: "Missing", statusNote: "Not implemented", gap: '"Only 1 available" + Recently Viewed', tag: "missing" },
  { rec: "Social proof", status: "Partial", statusNote: "Reviews page exists", gap: "Surface reviews on product pages", tag: "partial" },
  { rec: "AI chat concierge", status: "Exists", statusNote: "DB queries + outfit suggestions", gap: "Vibe queries + quick-action buttons", tag: "exists" },
];

const sprints = [
  {
    num: 1, title: "Foundation & Trust", color: "#22c55e",
    theme: "Fix the structural and content gaps that create subconscious distrust. Every page should feel intentional, connected, and trustworthy.",
    effort: "1–2 weeks",
    tasks: [
      { id: "1A", title: "Page Hierarchy Standardisation", desc: "Enforce a single H1/H2/H3 hierarchy across all 28 pages. Create shared PageHeader and SectionHeader components with strict type scale tokens.", impact: "Medium", effort: "Med" },
      { id: "1B", title: "Breadcrumb Navigation", desc: "Wire the existing shadcn/ui Breadcrumb component into product detail, category, and blog pages. Home > Category > Product Name.", impact: "High", effort: "Low" },
      { id: "1C", title: "Trust Pages", desc: "Create Our Process, Quality Standards, and Meet the Founder pages. Visual condition grading scale. Linked from footer and About.", impact: "High", effort: "Med" },
      { id: "1D", title: "Microcopy Near CTAs", desc: "Add TrustBadges component below Add to Cart: free shipping, quality-checked, unique piece, easy returns. Icons + linked text.", impact: "High", effort: "Low" },
      { id: "1E", title: "Dead-End Elimination", desc: '"You May Also Like" on product pages (4 related items). "Continue Shopping" CTAs on blog posts. "Shop Similar" on 404.', impact: "High", effort: "Med" },
      { id: "1F", title: "CTA Standardisation", desc: "Audit all buttons. Define primary-large, primary-default, secondary-outline variants. Full-width primary CTAs on mobile.", impact: "Medium", effort: "Low" },
    ],
  },
  {
    num: 2, title: "Mobile-First Experience", color: "#3b82f6",
    theme: "Urban Refit is mobile-first — the UX must reflect that with thumb-friendly navigation, swipe gestures, and streamlined checkout.",
    effort: "1–2 weeks",
    tasks: [
      { id: "2A", title: "Persistent Bottom Navigation", desc: "Fixed bottom nav on mobile: Home, Shop, Sell, Account. Active state highlighting. Notification badge. Visible on all pages except checkout.", impact: "High", effort: "Med" },
      { id: "2B", title: "Tap Target Audit", desc: "Ensure minimum 44px touch targets on all interactive elements. Focus on Shop filters, product card buttons, and form inputs.", impact: "Medium", effort: "Low" },
      { id: "2C", title: "Swipe Navigation", desc: "Left/right swipe between products on detail pages. Maintain category context. Edge arrow indicators to signal swipe availability.", impact: "Medium", effort: "Med" },
      { id: "2D", title: "Skeleton Loaders", desc: "Add skeleton states to ProductDetail and Shop grid. Fixed aspect-ratio image containers to prevent layout shift.", impact: "Medium", effort: "Low" },
      { id: "2E", title: "Checkout Progress Indicator", desc: "Visual step indicator: Cart → Shipping → Payment → Confirmation. Reduces checkout anxiety on mobile.", impact: "Medium", effort: "Low" },
    ],
  },
  {
    num: 3, title: "Conversion Engine", color: "#f59e0b",
    theme: "Turn browsers into buyers with scarcity signals, social proof, enhanced discovery, and intelligent product connections.",
    effort: "1–2 weeks",
    tasks: [
      { id: "3A", title: "Scarcity Indicators", desc: '"Only 1 available — unique piece" badges on all product cards and detail pages. Recently Viewed section (localStorage, 6 items).', impact: "High", effort: "Low" },
      { id: "3B", title: "Social Proof Integration", desc: "Reviews inline on product pages. \"Recently Sold\" feed on homepage. Aggregate star ratings on product cards in Shop grid.", impact: "High", effort: "Med" },
      { id: "3C", title: "Enhanced Filter Taxonomy", desc: "Add Condition, Material, Price Brackets, Style Tags, and Sustainability filters. Shareable filtered URLs.", impact: "High", effort: "Med" },
      { id: "3D", title: "AI Chat Concierge", desc: 'Vibe-based and price-based queries. Quick-action buttons: "Under $50", "New Arrivals", "Build an Outfit", "Vintage Picks".', impact: "High", effort: "Med" },
    ],
  },
  {
    num: 4, title: "Strategic Differentiators", color: "#a855f7",
    theme: "Build the features that no competitor has — the ones that make Urban Refit a destination, not just a store.",
    effort: "1–2 weeks",
    tasks: [
      { id: "4A", title: "Personalised Recommendations", desc: '"Recommended for You" on homepage. "Complete the Look" on product pages. User interaction tracking and scoring engine.', impact: "High", effort: "High" },
      { id: "4B", title: "Sustainability Dashboard", desc: "Personal impact metrics: garments saved, CO2 offset, water saved. Community counter on homepage. Shareable impact cards.", impact: "Medium", effort: "Med" },
      { id: "4C", title: "Recently Sold Feed", desc: "Real-time feed of purchases. Product thumbnail, name, price, relative timestamp. Subtle animation for new sales.", impact: "Medium", effort: "Med" },
      { id: "4D", title: "LLM Product Descriptions", desc: "Admin tool to generate consistent, brand-voice descriptions from minimal input. Edit before publish. Enforced quality standard.", impact: "Medium", effort: "Med" },
    ],
  },
];

const priorityGroups = [
  {
    label: "P0 — Critical Path", color: "#22c55e", cls: "p0",
    items: [
      { name: "Breadcrumb navigation", sprint: "Sprint 1" },
      { name: "Microcopy near CTAs", sprint: "Sprint 1" },
      { name: "Dead-end elimination", sprint: "Sprint 1" },
      { name: "Trust pages", sprint: "Sprint 1" },
      { name: "Bottom navigation", sprint: "Sprint 2" },
    ],
  },
  {
    label: "P1 — High Value", color: "#3b82f6", cls: "p1",
    items: [
      { name: "CTA standardisation", sprint: "Sprint 1" },
      { name: "Page hierarchy", sprint: "Sprint 1" },
      { name: "Scarcity indicators", sprint: "Sprint 3" },
      { name: "Recently Viewed", sprint: "Sprint 3" },
      { name: "Skeleton loaders", sprint: "Sprint 2" },
      { name: "Enhanced filters", sprint: "Sprint 3" },
      { name: "Social proof", sprint: "Sprint 3" },
    ],
  },
  {
    label: "P2 — Important", color: "#f59e0b", cls: "p2",
    items: [
      { name: "Tap target audit", sprint: "Sprint 2" },
      { name: "Swipe navigation", sprint: "Sprint 2" },
      { name: "Checkout progress", sprint: "Sprint 2" },
      { name: "AI chat concierge", sprint: "Sprint 3" },
      { name: "Recently Sold feed", sprint: "Sprint 4" },
    ],
  },
  {
    label: "P3 — Strategic", color: "#a855f7", cls: "p3",
    items: [
      { name: "Personalised recommendations", sprint: "Sprint 4" },
      { name: "Sustainability dashboard", sprint: "Sprint 4" },
      { name: "LLM descriptions", sprint: "Sprint 4" },
      { name: "Typography strict scale", sprint: "Sprint 1" },
    ],
  },
];

const metricsData = [
  { sprint: "Sprint 1", color: "#22c55e", metrics: [{ value: "+20%", label: "Pages per session" }, { value: "-15%", label: "Bounce rate" }, { value: "+10%", label: "Time on site" }] },
  { sprint: "Sprint 2", color: "#3b82f6", metrics: [{ value: "+25%", label: "Mobile conversion" }, { value: "+10%", label: "Checkout completion" }, { value: "+15%", label: "Mobile session time" }] },
  { sprint: "Sprint 3", color: "#f59e0b", metrics: [{ value: "+20%", label: "Add-to-cart rate" }, { value: "+10%", label: "Average order value" }, { value: "+30%", label: "Filter usage" }] },
  { sprint: "Sprint 4", color: "#a855f7", metrics: [{ value: "+15%", label: "Repeat purchases" }, { value: "+40%", label: "AI chat engagement" }, { value: "New", label: "Social shares baseline" }] },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function StatusTag({ tag }: { tag: string }) {
  const colors: Record<string, string> = {
    exists: "bg-green-500/15 text-green-400",
    partial: "bg-amber-500/12 text-amber-400",
    missing: "bg-rose-500/12 text-rose-400",
  };
  return (
    <span className={`inline-block text-[0.65rem] font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${colors[tag] || ""}`}>
      {tag === "exists" ? "Exists" : tag === "partial" ? "Partial" : "Missing"}
    </span>
  );
}

function ImpactTag({ impact, type }: { impact: string; type: "impact" | "effort" }) {
  const impactColors: Record<string, string> = { High: "bg-green-500/15 text-green-400", Medium: "bg-amber-500/12 text-amber-400" };
  const effortColors: Record<string, string> = { Low: "bg-blue-500/12 text-blue-400", Med: "bg-purple-500/12 text-purple-400", High: "bg-rose-500/12 text-rose-400" };
  const colors = type === "impact" ? impactColors : effortColors;
  const label = type === "impact" ? `${impact} Impact` : `${impact} Effort`;
  return (
    <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${colors[impact] || ""}`}>
      {label}
    </span>
  );
}

function FadeIn({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function Roadmap() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);

      const sections = document.querySelectorAll<HTMLElement>("section[id]");
      let current = "";
      sections.forEach((section) => {
        if (scrollTop >= section.offsetTop - 120) current = section.id;
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "#pillars", label: "Pillars" },
    { href: "#assessment", label: "Assessment" },
    { href: "#sprints", label: "Sprints" },
    { href: "#priority", label: "Priority" },
    { href: "#metrics", label: "Metrics" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", color: "#e5e5e5", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 md:px-8" style={{ background: "rgba(10,10,10,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid #222" }}>
        <a href="/roadmap" className="text-lg font-bold tracking-tight no-underline" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#e5e5e5" }}>
          Urban <span style={{ color: "#22c55e" }}>Refit</span>
        </a>
        <div className="hidden md:flex gap-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all no-underline ${activeSection === item.href.slice(1) ? "text-green-400" : "text-gray-400 hover:text-gray-200"}`}
              style={activeSection === item.href.slice(1) ? { background: "rgba(34,197,94,0.15)" } : { background: "transparent" }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* PROGRESS BAR */}
      <div className="fixed top-16 left-0 right-0 h-0.5 z-40" style={{ background: "#222" }}>
        <div className="h-full transition-all duration-100" style={{ width: `${progress}%`, background: "#22c55e" }} />
      </div>

      {/* HERO */}
      <header className="min-h-screen flex flex-col justify-center items-center text-center px-4 md:px-8 pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(34,197,94,0.15) 0%, transparent 70%)" }} />
        <div className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-8" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Implementation Roadmap
        </div>
        <h1 className="relative z-10 text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight max-w-3xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          From Budget E-Commerce to{" "}
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #22c55e 0%, #4ade80 50%, #f59e0b 100%)" }}>
            Developer-Grade Platform
          </span>
        </h1>
        <p className="relative z-10 text-base md:text-lg text-gray-400 max-w-xl mt-6">
          A structured, incremental pathway that transforms Urban Refit into a trusted, mobile-first, conversion-optimised circular fashion marketplace.
        </p>
        <div className="relative z-10 flex gap-8 md:gap-12 mt-10">
          {[{ value: "4", label: "Sprints" }, { value: "21", label: "Features" }, { value: "4–8", label: "Weeks" }].map((m) => (
            <div key={m.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{m.value}</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{m.label}</div>
            </div>
          ))}
        </div>
        <div className="relative z-10 flex gap-4 mt-10">
          <a href="#sprints" className="px-6 py-3 rounded-lg font-semibold text-sm text-black no-underline transition-all hover:-translate-y-0.5" style={{ background: "#22c55e" }}>
            View Sprints
          </a>
          <a href="#priority" className="px-6 py-3 rounded-lg font-medium text-sm no-underline transition-all hover:border-gray-500" style={{ border: "1px solid #333", color: "#e5e5e5" }}>
            Priority Matrix
          </a>
        </div>
      </header>

      {/* PILLARS */}
      <section id="pillars" className="py-24 px-4 md:px-8 max-w-5xl mx-auto">
        <FadeIn>
          <div className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-3">Strategic Foundation</div>
          <div className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Three Pillars of Conversion</div>
          <p className="text-gray-400 mt-4 max-w-2xl">Urban Refit's unique position as a single-item, circular-economy marketplace means these three pillars determine every conversion decision.</p>
        </FadeIn>
        <FadeIn className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { icon: "✅", title: "Trust", desc: "Consistent structure, trust pages, microcopy near CTAs, and quality grading systems that transform \"another resale site\" into a curated, mission-driven platform.", color: "#22c55e" },
            { icon: "⚡", title: "Speed", desc: "Skeleton loaders, fixed image containers, code splitting, and perceived performance optimisations that make every interaction feel instant.", color: "#3b82f6" },
            { icon: "📱", title: "Mobile Experience", desc: "Bottom navigation, 44px tap targets, swipe gestures, and thumb-friendly checkout that respect how Gen Z actually shops.", color: "#a855f7" },
          ].map((p) => (
            <div key={p.title} className="rounded-xl p-6 transition-all hover:-translate-y-0.5" style={{ background: "#141414", border: "1px solid #222" }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl mb-5" style={{ background: `${p.color}20`, color: p.color }}>{p.icon}</div>
              <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{p.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </FadeIn>
      </section>

      {/* ASSESSMENT */}
      <section id="assessment" className="py-24 px-4 md:px-8 max-w-5xl mx-auto">
        <FadeIn>
          <div className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-3">Current State</div>
          <div className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Codebase Assessment</div>
          <p className="text-gray-400 mt-4 max-w-2xl">Each recommendation mapped against what exists, what's partial, and what's missing entirely.</p>
        </FadeIn>
        <FadeIn className="mt-12">
          {/* Header */}
          <div className="hidden md:grid grid-cols-3 gap-4 px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider" style={{ borderBottom: "2px solid #333" }}>
            <div>Recommendation</div>
            <div>Current Status</div>
            <div>Gap</div>
          </div>
          {assessmentRows.map((row, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 px-5 py-4 text-sm transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid #222" }}>
              <div className="font-medium">{row.rec}</div>
              <div className="text-gray-400 flex items-center gap-2 flex-wrap">
                <StatusTag tag={row.tag} /> {row.statusNote}
              </div>
              <div className="text-amber-400">{row.gap}</div>
            </div>
          ))}
        </FadeIn>
      </section>

      {/* SPRINTS */}
      <section id="sprints" className="py-24 px-4 md:px-8 max-w-5xl mx-auto">
        <FadeIn>
          <div className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-3">Implementation Plan</div>
          <div className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Four Progressive Sprints</div>
          <p className="text-gray-400 mt-4 max-w-2xl">Each sprint delivers a complete, testable improvement. Deploy independently, measure, and iterate.</p>
        </FadeIn>

        <div className="mt-16 relative">
          {/* Timeline line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-0.5 hidden md:block" style={{ background: "#222" }} />

          {sprints.map((sprint) => (
            <FadeIn key={sprint.num} className="relative pl-0 md:pl-16 mb-16">
              {/* Dot */}
              <div className="absolute left-[11px] top-1 w-[26px] h-[26px] rounded-full items-center justify-center text-xs font-bold text-black hidden md:flex" style={{ background: sprint.color }}>
                {sprint.num}
              </div>

              <h3 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: sprint.color }}>
                <span className="md:hidden inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-black mr-3" style={{ background: sprint.color }}>{sprint.num}</span>
                {sprint.title}
              </h3>
              <div className="text-sm text-gray-400 italic mt-2 mb-3 pl-4" style={{ borderLeft: "3px solid #333" }}>
                "{sprint.theme}"
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 px-3 py-1 rounded-md mb-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #222" }}>
                ⏰ {sprint.effort}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sprint.tasks.map((task) => (
                  <div key={task.id} className="rounded-xl p-5 transition-all hover:border-gray-600" style={{ background: "#141414", border: "1px solid #222" }}>
                    <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: sprint.color }}>{task.id}</div>
                    <h4 className="text-base font-semibold mb-2 leading-snug">{task.title}</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{task.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      <ImpactTag impact={task.impact} type="impact" />
                      <ImpactTag impact={task.effort} type="effort" />
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* PRIORITY MATRIX */}
      <section id="priority" className="py-24 px-4 md:px-8 max-w-5xl mx-auto">
        <FadeIn>
          <div className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-3">Decision Framework</div>
          <div className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Priority Matrix</div>
          <p className="text-gray-400 mt-4 max-w-2xl">All 21 features ranked by priority level. P0 items deliver the highest impact relative to effort.</p>
        </FadeIn>

        {priorityGroups.map((group) => (
          <div key={group.label} className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: group.color }}>{group.label}</h3>
            <FadeIn className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.items.map((item) => (
                <div key={item.name} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all" style={{ background: "#141414", border: "1px solid #222" }}>
                  <span className="text-xs font-bold min-w-[32px] text-center py-0.5 rounded" style={{ background: `${group.color}20`, color: group.color }}>{group.cls.toUpperCase()}</span>
                  <span className="flex-1">{item.name}</span>
                  <span className="text-xs text-gray-600 whitespace-nowrap">{item.sprint}</span>
                </div>
              ))}
            </FadeIn>
          </div>
        ))}
      </section>

      {/* METRICS */}
      <section id="metrics" className="py-24 px-4 md:px-8 max-w-5xl mx-auto">
        <FadeIn>
          <div className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-3">Measuring Success</div>
          <div className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Target Metrics by Sprint</div>
          <p className="text-gray-400 mt-4 max-w-2xl">Each sprint is measured against specific KPIs to validate that changes deliver real value.</p>
        </FadeIn>
        <FadeIn className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {metricsData.map((m) => (
            <div key={m.sprint} className="rounded-xl p-6 text-center" style={{ background: "#141414", border: "1px solid #222", borderTop: `3px solid ${m.color}` }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: m.color }}>{m.sprint}</div>
              {m.metrics.map((metric) => (
                <div key={metric.label} className="mb-3">
                  <div className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: m.color }}>{metric.value}</div>
                  <div className="text-xs text-gray-500">{metric.label}</div>
                </div>
              ))}
            </div>
          ))}
        </FadeIn>
      </section>

      {/* CONCLUSION */}
      <section id="conclusion" className="py-24 px-4 md:px-8 max-w-5xl mx-auto">
        <FadeIn>
          <div className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-3">Final Word</div>
          <div className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>The Pathway Forward</div>
        </FadeIn>
        <FadeIn className="rounded-xl p-6 md:p-10 mt-8" style={{ background: "#141414", border: "1px solid #222" }}>
          <p className="text-gray-400 text-base mb-4">
            This roadmap transforms Urban Refit from a functional budget e-commerce site into a developer-grade platform that reflects the premium, curated nature of the brand. The incremental approach ensures that every deployment delivers measurable value, and the sprint structure allows for course correction based on real user data.
          </p>
          <blockquote className="text-lg font-medium leading-relaxed my-6 pl-5" style={{ borderLeft: "3px solid #22c55e", color: "#e5e5e5" }}>
            Urban Refit is not competing on price or inventory breadth — it is competing on trust, curation, and mission.
          </blockquote>
          <p className="text-gray-400 text-base mb-4">
            Every technical decision should reinforce these three pillars. A breadcrumb is not just a navigation aid; it is a signal that the site is professionally built. A scarcity badge is not just a conversion trick; it is the truth about a unique, one-of-a-kind garment. A sustainability dashboard is not just a feature; it is the quantified proof of Urban Refit's reason for existing.
          </p>
          <p className="text-base font-medium" style={{ color: "#e5e5e5" }}>
            The pathway from budget to developer-grade is not about adding complexity — it is about adding intentionality to every interaction.
          </p>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-12 px-4 text-sm text-gray-600" style={{ borderTop: "1px solid #222" }}>
        Urban Refit Implementation Roadmap &middot; Prepared February 2026 &middot;{" "}
        <a href="/" className="text-green-400 no-underline hover:underline">urbanrefit.com</a>
      </footer>
    </div>
  );
}
