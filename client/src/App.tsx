import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./hooks/useAuth";

// Eagerly load Home (landing page) for fast initial render
import Home from "./pages/Home";
import NotFound from "@/pages/NotFound";

// Lazy load all other pages for code splitting
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const CheckoutCanceled = lazy(() => import("./pages/CheckoutCanceled"));
const Orders = lazy(() => import("./pages/Orders"));
const About = lazy(() => import("./pages/About"));
const Partners = lazy(() => import("./pages/Partners"));
const Sustainability = lazy(() => import("./pages/Sustainability"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Profile = lazy(() => import("./pages/Profile"));
const CourierReturn = lazy(() => import("./pages/CourierReturn"));
const Charities = lazy(() => import("./pages/Charities"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Join = lazy(() => import("./pages/Join"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Reviews = lazy(() => import("./pages/Reviews"));
const SellToUs = lazy(() => import("./pages/SellToUs"));
const MySubmissions = lazy(() => import("./pages/MySubmissions"));
const HowTokensWork = lazy(() => import("./pages/HowTokensWork"));
const Notifications = lazy(() => import("./pages/Notifications"));
const SecurityDocs = lazy(() => import("./pages/docs/SecurityDocs"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const OurProcess = lazy(() => import("./pages/OurProcess"));
const QualityStandards = lazy(() => import("./pages/QualityStandards"));
const Founder = lazy(() => import("./pages/Founder"));

// Admin pages - lazy loaded
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminProductForm = lazy(() => import("./pages/admin/ProductForm"));
const AdminThriftStores = lazy(() => import("./pages/admin/ThriftStores"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminPayouts = lazy(() => import("./pages/admin/Payouts"));
const AdminInsights = lazy(() => import("./pages/admin/Insights"));
const AdminCourierReturns = lazy(() => import("./pages/admin/CourierReturns"));
const AdminCharities = lazy(() => import("./pages/admin/Charities"));
const AdminContactMessages = lazy(() => import("./pages/admin/ContactMessages"));
const AdminSellSubmissions = lazy(() => import("./pages/admin/SellSubmissions"));
const AdminBulkUpload = lazy(() => import("./pages/admin/BulkUpload"));
const AdminPartnerProfitability = lazy(() => import("./pages/admin/PartnerProfitability"));
const AdminNotifications = lazy(() => import("./pages/admin/Notifications"));
const AdminStorePerformance = lazy(() => import("./pages/admin/StorePerformance"));
const AdminImageMonitoring = lazy(() => import("./pages/admin/ImageMonitoring"));
const AdminAlertsPage = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminBanners = lazy(() => import("./pages/admin/Banners"));

// Lazy load floating components
const HelpdeskChat = lazy(() => import("./components/HelpdeskChat").then(m => ({ default: m.HelpdeskChat })));
const WeeklyRewardBanner = lazy(() => import("./components/WeeklyRewardBanner").then(m => ({ default: m.WeeklyRewardBanner })));
const FloatingFeedbackButton = lazy(() => import("./components/FloatingFeedbackButton").then(m => ({ default: m.FloatingFeedbackButton })));

// Minimal loading fallback
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public routes */}
        <Route path="/" component={Home} />
        <Route path="/shop" component={Shop} />
        <Route path="/shop/:category" component={Shop} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/checkout/success" component={CheckoutSuccess} />
        <Route path="/checkout/canceled" component={CheckoutCanceled} />
        <Route path="/orders" component={Orders} />
        <Route path="/about" component={About} />
        <Route path="/partners" component={Partners} />
        <Route path="/sustainability" component={Sustainability} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/refund-policy" component={RefundPolicy} />
        <Route path="/profile" component={Profile} />
        <Route path="/courier-return" component={CourierReturn} />
        <Route path="/charities" component={Charities} />
        <Route path="/faq" component={FAQ} />
        <Route path="/join" component={Join} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/reviews" component={Reviews} />
        <Route path="/sell" component={SellToUs} />
        <Route path="/my-submissions" component={MySubmissions} />
        <Route path="/my-submissions/:id" component={MySubmissions} />
        <Route path="/how-tokens-work" component={HowTokensWork} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/our-process" component={OurProcess} />
        <Route path="/quality-standards" component={QualityStandards} />
        <Route path="/founder" component={Founder} />
        
        {/* Admin routes */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/products/new" component={AdminProductForm} />
        <Route path="/admin/products/:id/edit" component={AdminProductForm} />
        <Route path="/admin/thrift-stores" component={AdminThriftStores} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/payouts" component={AdminPayouts} />
        <Route path="/admin/insights" component={AdminInsights} />
        <Route path="/admin/courier-returns" component={AdminCourierReturns} />
        <Route path="/admin/charities" component={AdminCharities} />
        <Route path="/admin/sell-submissions" component={AdminSellSubmissions} />
        <Route path="/admin/bulk-upload" component={AdminBulkUpload} />
        <Route path="/admin/partner-profitability" component={AdminPartnerProfitability} />
        <Route path="/admin/contact-messages" component={AdminContactMessages} />
        <Route path="/admin/notifications" component={AdminNotifications} />
        <Route path="/admin/store-performance" component={AdminStorePerformance} />
        <Route path="/admin/image-monitoring" component={AdminImageMonitoring} />
        <Route path="/admin/alerts" component={AdminAlertsPage} />
        <Route path="/admin/banners" component={AdminBanners} />
        <Route path="/docs/security" component={SecurityDocs} />
        <Route path="/roadmap" component={Roadmap} />
        
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function AppContent() {
  const { user } = useAuth();
  
  return (
    <>
      <Toaster />
      <Router />
      <Suspense fallback={null}>
        <HelpdeskChat />
        {user && <WeeklyRewardBanner />}
        <FloatingFeedbackButton />
      </Suspense>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
