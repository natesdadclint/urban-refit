import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminProductForm from "./pages/admin/ProductForm";
import AdminThriftStores from "./pages/admin/ThriftStores";
import AdminOrders from "./pages/admin/Orders";
import AdminPayouts from "./pages/admin/Payouts";
import AdminInsights from "./pages/admin/Insights";
import AdminCourierReturns from "./pages/admin/CourierReturns";
import AdminCharities from "./pages/admin/Charities";
import About from "./pages/About";
import Partners from "./pages/Partners";
import Sustainability from "./pages/Sustainability";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import RefundPolicy from "./pages/RefundPolicy";
import Profile from "./pages/Profile";
import CourierReturn from "./pages/CourierReturn";
import Charities from "./pages/Charities";
import FAQ from "./pages/FAQ";
import Join from "./pages/Join";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Reviews from "./pages/Reviews";
import SellToUs from "./pages/SellToUs";
import AdminSellSubmissions from "./pages/AdminSellSubmissions";
import AdminBulkUpload from "./pages/AdminBulkUpload";
import AdminPartnerProfitability from "./pages/AdminPartnerProfitability";
import { HelpdeskChat } from "./components/HelpdeskChat";
import { WeeklyRewardBanner } from "./components/WeeklyRewardBanner";
import { useAuth } from "./hooks/useAuth";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/shop/:category" component={Shop} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
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
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
      <HelpdeskChat />
      {user && <WeeklyRewardBanner />}
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
