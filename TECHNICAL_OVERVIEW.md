# Urban Refit - Technical Overview

> A comprehensive guide for new developers joining the project

## Table of Contents

1. [Overview](#overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Key Features](#key-features)
4. [Database Schema](#database-schema)
5. [API Structure](#api-structure)
6. [Client-Side Architecture](#client-side-architecture)
7. [Third-Party Integrations](#third-party-integrations)
8. [Build & Deployment](#build--deployment)
9. [Testing Strategy](#testing-strategy)
10. [Getting Started](#getting-started)
11. [Development Workflow](#development-workflow)
12. [Key Concepts](#key-concepts)

---

## Overview

Urban Refit is a full-stack e-commerce platform for sustainable secondhand fashion. The platform connects customers with unique, one-of-a-kind garments sourced from thrift stores, while promoting environmental responsibility through a token-based rewards system.

**Core Mission:** Reduce fashion waste by creating a circular economy where customers can buy, return, and sell secondhand clothing while supporting charities and earning rewards.

---

## Architecture & Technology Stack

### Architecture Pattern

- **Full-stack TypeScript monorepo** with clean separation of concerns
- **Type-safe API layer** using tRPC for end-to-end type safety
- **Client-server split** with shared type definitions
- **Development:** Vite dev server with HMR
- **Production:** Static client bundle + Node.js server

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.4 | UI framework |
| TypeScript | 5.9.3 | Type safety |
| Wouter | 3.9.0 | Client-side routing |
| TanStack Query | 5.90.21 | Server state management |
| tRPC Client | 11.10.0 | Type-safe API calls |
| Tailwind CSS | 4.2.1 | Utility-first styling |
| Radix UI | Various | Accessible UI primitives |
| Framer Motion | 12.34.3 | Animations |
| Recharts | 2.15.4 | Data visualization |
| React Hook Form | 7.71.2 | Form management |
| Zod | 4.3.6 | Schema validation |

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | - | Runtime |
| Express | 4.22.1 | Web server |
| tRPC Server | 11.10.0 | API framework |
| Drizzle ORM | 0.44.7 | Database ORM |
| MySQL | - | Database |
| Jose | 6.1.0 | JWT authentication |
| Stripe | 20.4.0 | Payment processing |
| AWS SDK | 3.999.0 | S3 storage |
| Resend | 6.9.2 | Email service |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Vite | 7.3.1 | Build tool & dev server |
| Vitest | 2.1.9 | Testing framework |
| ESBuild | 0.25.12 | Production bundling |
| Prettier | 3.8.1 | Code formatting |
| Drizzle Kit | 0.31.9 | Database migrations |
| pnpm | 10.4.1 | Package manager |

---

## Key Features

### 1. E-commerce Core

**Product Management**
- One-of-a-kind secondhand fashion items
- Multi-image support (up to 4 images per product)
- Dynamic pricing with configurable markup
- Automatic payout calculations (10% thrift store, 10% charity)
- Categories: tops, bottoms, dresses, outerwear, accessories, shoes, sets
- Condition tracking: new with tags, like new, excellent, very good, good, fair
- Size standardization across brands

**Shopping Experience**
- Product browsing with advanced filtering
- Real-time shopping cart
- Stripe checkout with multiple payment methods
- Order tracking and history
- GST-inclusive pricing (15% NZ standard)
- Free shipping threshold: NZ$50
- Quantity-based discount system

### 2. Token Rewards System

**Earning Tokens**
- Purchase rewards: Tokens earned on every order
- Courier return rewards: 25% of estimated resale value
- Weekly login rewards: Consistent engagement bonuses
- Referral bonuses: Time-based rewards for referring friends

**Spending Tokens**
- Donate to charity partners
- Top-up spend limit for future purchases
- Track balance and transaction history

**Implementation:** `server/db.ts` - Token transaction management

### 3. Courier Returns Program

**Customer Flow:**
1. Customer submits items they want to return
2. Upload photos and provide details
3. Admin reviews and approves/rejects
4. System generates shipping label
5. Customer receives token reward (25% of estimated value)
6. Items listed for resale

**Admin Flow:**
- Review submissions with photos
- Set estimated resale value
- Approve or reject with reasons
- Track return status through workflow

**Files:** `client/src/pages/CourierReturn.tsx`, `server/routers.ts` (courierReturn router)

### 4. Sell-to-Us Program

**Features:**
- Token-based negotiations (no cash)
- Multi-message conversation threads
- Admin can make counter-offers
- Customer accepts/declines offers
- Email notifications on status changes

**Workflow:**
1. Customer submits item with photos
2. Admin reviews and makes token offer
3. Customer can negotiate back and forth
4. Final acceptance creates token transaction
5. Shipping arrangements made

**Files:** `client/src/pages/MySubmissions.tsx`, `server/admin-routes.ts`

### 5. Blog System

**Features:**
- Multiple categories: style tips, sustainability, brand spotlight, thrifting tips
- Reading time estimates
- View/like counts
- SEO-friendly slugs
- Rich content with images
- Tags for categorization

**Files:** `client/src/pages/Blog.tsx`, `client/src/pages/BlogPost.tsx`

### 6. Product Reviews

**Features:**
- 1-5 star ratings
- Fit feedback (runs small/true to size/runs large)
- Verified purchase badges
- Helpful vote system
- Average rating calculations

**Files:** `server/routers.ts` (review router)

### 7. Sustainability Tracking

**Metrics Tracked:**
- Landfill waste diverted (kg)
- Water saved (liters)
- Carbon emissions avoided (kg CO2)
- Equivalent trees planted

**Badge System:**
- Bronze: 5+ items purchased
- Silver: 15+ items
- Gold: 30+ items
- Platinum: 50+ items

**Files:** `server/sustainability.ts`, `server/routers/badges.ts`

### 8. Helpdesk Chat

**Features:**
- AI-powered responses (LLM integration)
- Session-based conversations
- Works for authenticated and anonymous users
- Admin can view chat history

**Files:** `server/_core/llm.ts`, `client/src/components/ManusDialog.tsx`

### 9. Admin Dashboard

**Capabilities:**
- Real-time analytics and insights
- Product management with bulk upload
- Order processing and fulfillment
- Partner profitability tracking
- Courier return management
- Sell submission review
- Contact message handling with reply functionality
- User management
- Banner management (site-wide announcements)
- Image URL validation monitoring
- Admin-specific notifications

**Files:** `client/src/pages/admin/*`, `server/admin-routes.ts`

---

## Database Schema

**Location:** `/drizzle/schema.ts` (1048 lines)

### Core Tables

#### User Management
```typescript
users                     // Core auth (openId, role, shipping)
customerProfiles         // Extended data (tokens, tier, preferences)
notificationPreferences  // User notification settings
referralCodes           // Referral program codes
referrals               // Referral tracking
```

#### Product & Inventory
```typescript
products           // Individual garments (name, brand, category, etc.)
productMetadata    // Extended info (invoice, style, care)
thriftStores       // Partner stores sourcing garments
productReviews     // Customer reviews and ratings
```

#### Orders & Payments
```typescript
orders         // Customer purchases (status, totals, Stripe IDs)
orderItems     // Products in each order with payouts
cartItems      // Active shopping carts
payouts        // Payments to thrift stores
discountTiers  // Quantity-based discounts
```

#### Token Economy
```typescript
tokenTransactions   // All token movements (earn/spend/donate)
charities          // Donation recipients
charityDonations   // Token donations to charities
courierReturns     // Customer returns with rewards
sellSubmissions    // Items customers want to sell
sellSubmissionReplies  // Negotiation conversations
```

#### Sustainability
```typescript
userBadges                 // Achievement badges earned
sustainabilityMilestones   // Progress tracking per user
```

#### Communication
```typescript
emailLogs              // Email delivery tracking
emailSubscribers       // Newsletter subscribers
contactMessages        // FAQ contact form submissions
contactReplies         // Admin responses to contacts
notifications          // In-app user notifications
broadcastReadStatus    // Broadcast notification tracking
adminNotifications     // Admin-specific alerts
chatMessages           // Helpdesk chat history
```

#### Content
```typescript
blogPosts             // Blog content (slug, title, content, etc.)
siteBanners          // Site-wide announcement banners
siteFeedback         // User feedback about website
imageValidationLogs  // Image URL health checks
```

### Key Relationships

- **Products → Thrift Stores:** Foreign key with referential integrity
- **Orders → Users → Customer Profiles:** User purchase tracking
- **Order Items → Products:** Snapshot of product at purchase time
- **Token Transactions:** Links to users, orders, returns, charities
- **Reviews → Products → Users:** Verified purchase verification

### Important Notes

1. **Foreign Key Constraints:** Database enforces referential integrity
2. **One-of-a-Kind:** Each product is unique (quantity always 1)
3. **Soft Deletes:** Products marked as sold, not deleted
4. **Payout Tracking:** Order items snapshot payout amounts at purchase time

**Further Reading:** `PRODUCTS_FLOW_DOCUMENTATION.md` (666 lines) - Complete data flow documentation

---

## API Structure

**Framework:** tRPC 11.10.0
**Location:** `/server/routers.ts` (2350 lines)

### Router Organization

```typescript
appRouter
├── system           // Health checks, DB info
├── admin            // Admin-only operations (17+ routers)
├── badges           // Badge system
├── feedback         // Site feedback
├── auth             // Login/logout/session
├── product          // Product listing/filtering
├── cart             // Shopping cart
├── checkout         // Stripe integration
├── charity          // Charity partners
├── blog             // Blog posts
├── review           // Product reviews
├── contact          // Contact form
├── newsletter       // Email subscriptions
├── chat             // Helpdesk chat
├── order            // User orders (protected)
├── courierReturn    // Return submissions (protected)
├── sellSubmission   // Sell submissions (protected)
├── notification     // User notifications (protected)
├── profile          // User profile (protected)
└── referral         // Referral system (protected)
```

### Middleware Stack

```typescript
publicProcedure       // No auth required
  ↓
protectedProcedure    // Requires authenticated user (JWT validation)
  ↓
adminProcedure        // Requires admin role check
```

### Input Validation

All inputs validated with Zod schemas:
```typescript
z.object({
  productId: z.number().positive(),
  email: z.string().email(),
  role: z.enum(["user", "admin"]),
  // ... etc
})
```

### Example API Call (Frontend)

```typescript
// Type-safe API call with full IntelliSense
const { data } = trpc.product.list.useQuery({
  category: "tops",
  limit: 20
});
// data is fully typed based on server return type
```

### Admin Routers

Admin routes are organized in `/server/admin-routes.ts`:

- `admin.thriftStore` - CRUD for partner stores
- `admin.product` - Product management
- `admin.order` - Order fulfillment
- `admin.courierReturn` - Return approvals
- `admin.sellSubmission` - Sell offer management
- `admin.payout` - Financial operations
- `admin.charity` - Charity management
- `admin.contactMessage` - Customer support
- `admin.notification` - Push notifications
- `admin.banner` - Site banner CRUD
- `admin.bulkUpload` - Bulk image uploads
- `admin.partnerProfitability` - Analytics
- `admin.imageValidation` - URL health monitoring

---

## Client-Side Architecture

**Router:** Wouter (lightweight, hook-based)
**Entry Point:** `/client/src/main.tsx`
**Root Component:** `/client/src/App.tsx`

### Routing Structure

**51 Routes Total:**
- 34 public pages
- 17 admin pages

### Public Routes

```typescript
// Shopping
/                      // Home (eagerly loaded)
/shop                  // Product listing
/shop/:category        // Category filter
/product/:id           // Product detail
/cart                  // Shopping cart
/checkout              // Checkout
/checkout/success      // Order confirmation
/checkout/canceled     // Checkout cancellation
/orders                // Order history

// Information
/about                 // About Urban Refit
/our-process           // How it works
/quality-standards     // Product quality
/sustainability        // Environmental impact
/how-tokens-work       // Token system
/founder               // Founder story
/roadmap               // Product roadmap
/faq                   // FAQ
/contact               // Contact form

// Community
/blog                  // Blog listing
/blog/:slug            // Blog post
/reviews               // Product reviews
/charities             // Charity partners
/partners              // Thrift store partners

// User Actions
/join                  // Signup/newsletter
/profile               // User profile
/notifications         // In-app notifications
/courier-return        // Return items
/sell, /sell-to-us     // Sell items
/my-submissions        // Track submissions
/my-submissions/:id    // Submission details

// Legal
/privacy               // Privacy policy
/terms                 // Terms of service
/refund-policy         // Refund policy

// Docs
/api-docs              // API documentation
/docs/security         // Security docs
```

### Admin Routes

All admin routes require authentication + admin role:

```typescript
/admin                         // Dashboard
/admin/products                // Product list
/admin/products/new            // Create product
/admin/products/:id/edit       // Edit product
/admin/thrift-stores           // Partner management
/admin/orders                  // Order management
/admin/payouts                 // Payout processing
/admin/insights                // Analytics
/admin/courier-returns         // Return management
/admin/sell-submissions        // Sell requests
/admin/charities               // Charity management
/admin/contact-messages        // Customer support
/admin/notifications           // Send notifications
/admin/alerts                  // Admin alerts
/admin/banners                 // Banner management
/admin/users                   // User management
/admin/bulk-upload             // Bulk image upload
/admin/partner-profitability   // Store analytics
/admin/store-performance       // Store metrics
/admin/image-monitoring        // Image health
```

### Performance Optimizations

**Code Splitting:**
```typescript
// Eager loading for home page
import Home from "./pages/Home";

// Lazy loading for all other pages
const Shop = lazy(() => import("./pages/Shop"));
const Product = lazy(() => import("./pages/Product"));
// ... etc
```

**Manual Chunks (vite.config.ts):**
```typescript
manualChunks: {
  "vendor-ui": ["@radix-ui/*"],
  "vendor-data": ["@trpc/*", "@tanstack/react-query"],
  "vendor-react": ["react", "react-dom"],
  "vendor-charts": ["recharts", "d3-*"],
  "vendor-icons": ["lucide-react"],
  "vendor-markdown": ["streamdown", "shiki"]
}
```

### State Management

**Server State:** TanStack Query (React Query)
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

**Local State:** React hooks (useState, useContext)
- Theme context (dark/light mode)
- Cart state (synced with server)
- Form state (React Hook Form)

**Global State:** None needed - tRPC + React Query handles all server state

### Component Structure

```
client/src/components/
├── ui/                  // Radix UI wrappers (button, dialog, etc.)
├── FloatingFeedbackButton.tsx
├── SocialShare.tsx
└── ManusDialog.tsx      // Helpdesk chat widget
```

**UI Philosophy:**
- Radix UI for accessibility
- Tailwind for styling
- Component composition over inheritance
- Shared components in `/components/ui`

---

## Third-Party Integrations

### 1. Stripe Payment Processing

**Version:** 20.4.0
**API Version:** `2026-02-25.clover`

**Configuration:**
```typescript
// Environment variables
STRIPE_SECRET_KEY          // Server-side
VITE_STRIPE_PUBLISHABLE_KEY  // Client-side
STRIPE_WEBHOOK_SECRET      // Webhook verification
```

**Webhook Endpoint:** `/api/stripe/webhook`

**Payment Flow:**
1. Frontend creates checkout session via tRPC
2. Server creates Stripe session with line items
3. User redirected to Stripe-hosted checkout
4. Payment processed by Stripe
5. Webhook receives `checkout.session.completed`
6. Server updates order status to "paid"
7. Products marked as sold
8. Payouts calculated (10% thrift store, 10% charity)
9. Payout records created
10. User cart cleared
11. Confirmation emails sent

**Features:**
- Multiple payment methods (expandable)
- Promotion codes enabled
- GST calculation (15% inclusive)
- Free shipping threshold: NZ$50
- Automatic refund support

**Files:**
- `/server/stripe.ts` - Payment logic
- `/client/src/pages/Checkout.tsx` - Frontend

**Testing:** Use Stripe test mode with test cards

### 2. AWS S3 Storage

**SDK:** `@aws-sdk/client-s3` v3.999.0

**Configuration:**
```typescript
AWS_REGION              // e.g., us-east-1
AWS_ACCESS_KEY_ID       // IAM credentials
AWS_SECRET_ACCESS_KEY   // IAM credentials
S3_BUCKET               // Bucket name
```

**Usage:**
- Product image uploads (up to 4 per product)
- Image validation (type, size)
- Public read ACL
- Unique filenames with nanoid
- 10MB size limit

**Fallback Storage:**
If AWS not configured, falls back to Manus Forge storage API:
```typescript
BUILT_IN_FORGE_API_URL
BUILT_IN_FORGE_API_KEY
```

**Endpoints:**
- `POST /api/upload` - Upload image (multipart/form-data)
- `GET /api/image/:key` - Image proxy with caching

**Files:**
- `/server/s3.ts` - Direct AWS SDK
- `/server/storage.ts` - Abstraction layer

### 3. Email Services

#### Resend (Primary)

**Purpose:** Transactional emails

**Configuration:**
```typescript
RESEND_API_KEY
```

**Email Types:**
- Order confirmations
- Contact form replies
- Sell submission updates
- Courier return status
- Newsletter confirmations

**From Address:** `Urban Refit <noreply@urbanrefit.store>`

**Files:**
- `/server/resend.ts` - Email sending
- `/server/email.ts` - Email templates

#### Mailchimp (Secondary)

**Purpose:** Newsletter marketing

**Features:**
- Subscriber management
- Marketing campaigns
- Audience segmentation

**Files:**
- `/server/mailchimp.ts`

### 4. OAuth Authentication

**Provider:** Manus OAuth Server

**Configuration:**
```typescript
OAUTH_SERVER_URL        // OAuth provider URL
VITE_APP_ID            // OAuth app ID
JWT_SECRET             // Session token secret
```

**Flow:**
1. User clicks "Sign in with [Provider]"
2. Redirect to OAuth server with PKCE challenge
3. User authenticates with provider (Google, GitHub, etc.)
4. OAuth callback to `/api/oauth/callback`
5. Server exchanges code for tokens
6. User info retrieved from OAuth server
7. User record created/updated in database
8. JWT session cookie set (1 year expiry)
9. Redirect to original page

**Session Management:**
- Cookie name: `urbanrefit.session`
- HttpOnly, Secure (production), SameSite=Lax
- Automatic expiry and refresh

**Files:**
- `/server/_core/oauth.ts` - OAuth flow
- `/server/_core/sdk.ts` - OAuth SDK wrapper
- `/server/_core/cookies.ts` - Cookie helpers

### 5. LLM Integration (Helpdesk)

**Purpose:** AI-powered customer support

**Configuration:**
```typescript
// Uses Manus LLM API
```

**Features:**
- Context-aware responses
- Conversation history
- Product information access
- Order status queries

**Files:**
- `/server/_core/llm.ts`

---

## Build & Deployment

### Development Mode

**Start Development Server:**
```bash
pnpm dev
```

**Command:** `NODE_ENV=development tsx watch server/_core/index.ts`

**Features:**
- Vite dev server with HMR
- Hot module replacement for React
- TypeScript watch mode
- Source maps
- Port auto-discovery (3000-3019)

**Port Management:**
- Tries port 3000 first
- Auto-finds available port if busy
- Logs alternative port

### Production Build

**Build Command:**
```bash
pnpm build
```

**Steps:**
1. `vite build` - Client bundle
2. `esbuild server/_core/index.ts` - Server bundle

**Output Structure:**
```
dist/
├── public/           # Client bundle (from Vite)
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].js
│   │   ├── vendor-ui-[hash].js
│   │   └── ... (other chunks)
│   └── products/     # Product images
└── index.js          # Server bundle (from ESBuild)
```

**Client Build (Vite):**
- Minification enabled
- Tree shaking
- Code splitting (vendor chunks)
- Asset hashing for cache busting
- Source maps in production

**Server Build (ESBuild):**
- Platform: Node.js
- Format: ESM
- Bundle: true
- External packages: All node_modules marked external

**Start Production Server:**
```bash
pnpm start
```

**Command:** `NODE_ENV=production node dist/index.js`

### Database Management

**Generate & Run Migrations:**
```bash
pnpm db:push
```

**Command:** `drizzle-kit generate && drizzle-kit migrate`

**Configuration (drizzle.config.ts):**
```typescript
{
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
}
```

**Migration Files:** `/drizzle/migrations/`

**Best Practices:**
- Always review generated migrations
- Test migrations on staging first
- Keep schema.ts as single source of truth
- See `DATABASE_UPDATE_ORDER.md` for dependency ordering

### Type Checking

**Check Types:**
```bash
pnpm check
```

**Command:** `tsc --noEmit`

**Configuration (tsconfig.json):**
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

### Code Formatting

**Format Code:**
```bash
pnpm format
```

**Command:** `prettier --write .`

**Style Guide (.prettierrc):**
```json
{
  "singleQuote": false,
  "semi": true,
  "tabWidth": 2,
  "printWidth": 80,
  "trailingComma": "es5"
}
```

### Environment Variables

**Required:**
```bash
# Database
DATABASE_URL="mysql://user:pass@localhost:3306/urbanrefit"

# Authentication
JWT_SECRET="your-secret-key"
VITE_APP_ID="oauth-app-id"
OAUTH_SERVER_URL="https://oauth.example.com"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Admin
OWNER_OPEN_ID="admin-open-id"
```

**Optional:**
```bash
# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
S3_BUCKET="bucket-name"

# Email
RESEND_API_KEY="re_..."

# Manus Storage (fallback)
BUILT_IN_FORGE_API_URL="https://storage.api"
BUILT_IN_FORGE_API_KEY="..."

# Server
PORT=3000  # Default port
NODE_ENV=development  # or production
```

**Loading:**
- Uses `dotenv` package
- Loaded in `server/_core/env.ts`
- Validated with Zod schemas
- Type-safe environment access

---

## Testing Strategy

**Framework:** Vitest 2.1.9
**Test Count:** 44 test files
**Location:** `/server/*.test.ts`

### Test Philosophy

Urban Refit uses **static analysis testing** rather than runtime unit tests:

1. **Source code reading** - Tests read actual source files
2. **Pattern matching** - Verify functions/logic exist
3. **Type checking** - Ensure TypeScript types are correct
4. **Database schema validation** - Check table definitions
5. **Route validation** - Verify API endpoints exist

### Test Categories

**Feature Tests:**
```typescript
badges.test.ts              // Badge system
banners.test.ts             // Site banners
blog.test.ts                // Blog functionality
cart.test.ts                // Shopping cart
checkout.test.ts            // Checkout flow
chat.test.ts                // Helpdesk chat
feedback.test.ts            // User feedback
loyalty.test.ts             // Token rewards
newsletter.test.ts          // Email subscriptions
notifications.test.ts       // Notification system
referral.test.ts            // Referral program
reviews.test.ts             // Product reviews
sell-*.test.ts              // Sell workflows
sustainability.test.ts      // Impact calculations
```

**Infrastructure Tests:**
```typescript
auth.logout.test.ts         // Authentication
users.test.ts               // User management
s3.test.ts                  // File uploads
resend.test.ts              // Email service
image-*.test.ts             // Image handling
security-docs.test.ts       // Security documentation
```

**UI/UX Tests:**
```typescript
mobile-header.test.ts       // Mobile navigation
multi-select-filters.test.ts // Filtering
breadcrumb-microcopy.test.ts // Navigation text
typography-standardisation.test.ts // Text consistency
ui-fixes.test.ts            // UI bug fixes
```

**Business Logic Tests:**
```typescript
gst.test.ts                 // Tax calculations
token-calculator.test.ts    // Token math
sales-attribution.test.ts   // Analytics
partner-profitability.test.ts // Financial tracking
donation-tax-credit.test.ts // Charity donations
```

### Example Test Pattern

```typescript
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";

describe("Feature Name", () => {
  it("has required function in source", () => {
    const source = readFileSync("server/feature.ts", "utf-8");
    expect(source).toContain("export function featureName");
  });

  it("implements expected behavior", () => {
    const source = readFileSync("server/feature.ts", "utf-8");
    expect(source).toMatch(/function.*\{.*expectedLogic.*\}/s);
  });
});
```

### Running Tests

**Run All Tests:**
```bash
pnpm test
```

**Watch Mode:**
```bash
pnpm vitest
```

**Single Test File:**
```bash
pnpm vitest badges.test.ts
```

**Coverage:**
```bash
pnpm vitest --coverage
```

### Testing Best Practices

1. **Don't mock tRPC** - Test actual router logic
2. **Use static analysis** - Read source files
3. **Test database queries** - Verify SQL generation
4. **Check type definitions** - Ensure types are exported
5. **Validate routes** - Confirm API structure

---

## Getting Started

### Prerequisites

- **Node.js:** 18+ recommended
- **pnpm:** `npm install -g pnpm@10.4.1`
- **MySQL:** 8.0+ recommended
- **Stripe Account:** For payment testing
- **AWS Account:** Optional (for S3 storage)

### Initial Setup

**1. Clone Repository:**
```bash
git clone <repository-url>
cd urban-refit
```

**2. Install Dependencies:**
```bash
pnpm install
```

**3. Configure Environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

**Minimum required variables:**
```bash
DATABASE_URL="mysql://root:password@localhost:3306/urbanrefit"
JWT_SECRET="generate-random-secret"
VITE_APP_ID="your-oauth-app-id"
OAUTH_SERVER_URL="https://oauth.example.com"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
OWNER_OPEN_ID="your-admin-open-id"
```

**4. Setup Database:**
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE urbanrefit;"

# Run migrations
pnpm db:push
```

**5. Seed Demo Data (Optional):**
```bash
tsx scripts/seed-demo.ts
```

**6. Start Development Server:**
```bash
pnpm dev
```

**7. Access Application:**
```
http://localhost:3000
```

**8. Run Tests:**
```bash
pnpm test
```

### Development Environment Setup

**VS Code Extensions (Recommended):**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

**Browser Extensions:**
- React Developer Tools
- Redux DevTools (for React Query)

### First Tasks for New Developers

1. **Read Documentation:**
   - This file (`TECHNICAL_OVERVIEW.md`)
   - `PRODUCTS_FLOW_DOCUMENTATION.md` - Data flow
   - `DATABASE_UPDATE_ORDER.md` - Schema changes
   - `SECURITY.md` - Security practices

2. **Explore Codebase:**
   - Read `/server/routers.ts` - Main API
   - Read `/client/src/App.tsx` - Routing
   - Read `/drizzle/schema.ts` - Database schema
   - Read `/server/db.ts` - Database queries

3. **Run the Application:**
   - Start dev server
   - Browse as customer
   - Try checkout flow (use Stripe test cards)
   - Login as admin (set your openId as OWNER_OPEN_ID)
   - Explore admin dashboard

4. **Make a Small Change:**
   - Add a new blog category
   - Create a new UI component
   - Add a database field
   - Write a test

---

## Development Workflow

### Daily Development

**1. Start Development:**
```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
pnpm install

# Start dev server
pnpm dev
```

**2. Make Changes:**
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make your changes
# Edit files in client/src or server/

# Format code
pnpm format

# Check types
pnpm check

# Run tests
pnpm test
```

**3. Test Your Changes:**
```bash
# Manual testing in browser
# Open http://localhost:3000

# Test specific feature
pnpm vitest your-feature.test.ts
```

**4. Commit Changes:**
```bash
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature
```

### Code Style Guidelines

**TypeScript:**
- Use strict mode
- Export types alongside implementations
- Prefer interfaces for objects
- Use Zod for runtime validation

**React:**
- Functional components only
- Custom hooks for reusable logic
- Use TypeScript for props
- Follow React best practices (keys, memoization, etc.)

**tRPC:**
- Group related procedures in routers
- Use Zod for input validation
- Return type-safe data
- Handle errors with TRPCError

**Database:**
- Use Drizzle ORM, never raw SQL
- Define relationships in schema
- Use transactions for multi-step operations
- Index foreign keys

**Styling:**
- Tailwind utility classes
- Component-scoped styles
- Responsive design (mobile-first)
- Dark mode support via next-themes

### Git Workflow

**Branch Naming:**
```
feature/add-product-filtering
fix/checkout-total-calculation
refactor/simplify-token-logic
docs/update-api-documentation
```

**Commit Messages:**
```
feat: add product search functionality
fix: correct GST calculation in checkout
refactor: simplify token transaction logic
docs: update API documentation
test: add tests for badge system
chore: update dependencies
```

**Pull Request Process:**
1. Create PR with descriptive title
2. Fill out PR template
3. Request review from team
4. Address feedback
5. Merge when approved

### Database Changes

**1. Update Schema:**
```typescript
// drizzle/schema.ts
export const newTable = mysqlTable("new_table", {
  id: int("id").autoincrement().primaryKey(),
  // ... fields
});
```

**2. Generate Migration:**
```bash
pnpm db:push
```

**3. Review Migration:**
```sql
-- Check drizzle/migrations/XXXX_migration_name.sql
```

**4. Test Migration:**
```bash
# Test on local database first
# Then test on staging
```

**5. Update Queries:**
```typescript
// server/db.ts
export async function getNewData() {
  return await db.select().from(newTable);
}
```

**See:** `DATABASE_UPDATE_ORDER.md` for dependency ordering

---

## Key Concepts

### 1. Type Safety with tRPC

**End-to-end type safety** from database to UI:

```typescript
// Server (server/routers.ts)
product: router({
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      limit: z.number().default(20)
    }))
    .query(async ({ input }) => {
      return await getAvailableProducts(input);
    })
})

// Client (client/src/pages/Shop.tsx)
const { data } = trpc.product.list.useQuery({
  category: "tops",
  limit: 20
});
// data is fully typed: Product[] | undefined
```

**Benefits:**
- Refactor with confidence
- Catch errors at compile time
- Full IntelliSense everywhere
- No API documentation needed

### 2. Token Economy

**Central to user engagement:**

- **Earning:** Purchase, return, login, referral
- **Spending:** Charity donation, spend limit top-up
- **Tracking:** Full transaction history

**Implementation:**
```typescript
// Every token movement creates a record
await db.insert(tokenTransactions).values({
  userId,
  amount,
  type: "purchase_reward",
  description: "Order #123 purchase",
  orderId
});
```

**Token Types:**
- `purchase_reward` - Earned from buying
- `return_reward` - Earned from returning
- `login_reward` - Daily login bonus
- `referral_reward` - Referral bonus
- `charity_donation` - Donated to charity
- `spend_limit_topup` - Applied to purchases

### 3. Payout System

**Automatic distribution on every sale:**

```typescript
// 10% to thrift store
const thriftStorePayoutAmount = salePrice * 0.10;

// 10% to charity
const charityPayoutAmount = salePrice * 0.10;

// 80% to Urban Refit (operations + sustainability)
```

**Tracking:**
- Order items snapshot payout amounts
- Payout records created on order completion
- Admin can mark payouts as processed
- Running totals tracked per store

### 4. One-of-a-Kind Model

**Each product is unique:**

- Quantity always 1
- Once sold, marked as unavailable
- Never truly deleted (audit trail)
- Reviews tied to specific items

**Implications:**
- No inventory management needed
- Simple cart logic (in/out)
- Historical data preserved
- Product IDs never reused

### 5. Foreign Key Integrity

**Database enforces relationships:**

```typescript
products
  .thriftStoreId -> thriftStores.id
orders
  .userId -> users.id
orderItems
  .orderId -> orders.id
  .productId -> products.id
```

**Benefits:**
- Data consistency guaranteed
- Cascade deletes handled properly
- Referential integrity maintained
- Prevents orphaned records

**Considerations:**
- Can't delete referenced records
- Must use soft deletes for some tables
- Order of operations matters

**See:** `PRODUCTS_FLOW_DOCUMENTATION.md` for detailed explanation

### 6. Authentication Flow

**Session-based with JWT:**

1. User authenticates via OAuth
2. Server creates JWT with user data
3. JWT stored in HttpOnly cookie
4. Cookie sent with every request
5. Server validates JWT on protected routes
6. User data available in context

**Middleware:**
```typescript
// No auth check
publicProcedure

// Requires valid JWT
protectedProcedure

// Requires admin role
adminProcedure
```

### 7. Image Management

**Storage Strategy:**

- **Development:** Local filesystem (`client/public/products/`)
- **Production:** AWS S3 (or Manus Forge API)

**Upload Flow:**
1. Frontend uploads to `/api/upload`
2. Server validates file type/size
3. Image saved to storage
4. URL returned to frontend
5. URL saved in database

**Image Proxy:**
```typescript
// Authenticated proxy endpoint
GET /api/image/:key

// Benefits:
// - Authentication enforcement
// - Caching headers
// - CORS handling
// - URL obfuscation
```

### 8. Email Notifications

**Two-tier system:**

1. **Transactional (Resend):**
   - Order confirmations
   - Status updates
   - Contact replies
   - Immediate delivery

2. **Marketing (Mailchimp):**
   - Newsletter campaigns
   - Promotional emails
   - Audience segmentation
   - Scheduled sends

**Email Logs:**
- All emails logged to database
- Track delivery status
- Audit trail for compliance
- Debugging failed sends

### 9. Admin Workflows

**Role-based access:**

- User role stored in database
- Admin role required for admin routes
- Middleware checks role on every request
- Owner (via `OWNER_OPEN_ID`) has full access

**Key Admin Tasks:**
1. Product management (CRUD)
2. Order fulfillment (status updates)
3. Return approvals (estimate value)
4. Sell submission negotiations (make offers)
5. Payout processing (mark paid)
6. User management (view/edit)
7. Analytics (reports, insights)

### 10. Sustainability Metrics

**Calculation Formula:**

```typescript
// Per secondhand garment purchased:
landfillWasteDiverted = 0.5 kg
waterSaved = 2700 liters
carbonAvoided = 5.5 kg CO2
```

**Badge Thresholds:**
- Bronze: 5+ items (2.5kg waste, 13,500L water, 27.5kg CO2)
- Silver: 15+ items (7.5kg waste, 40,500L water, 82.5kg CO2)
- Gold: 30+ items (15kg waste, 81,000L water, 165kg CO2)
- Platinum: 50+ items (25kg waste, 135,000L water, 275kg CO2)

**Implementation:**
```typescript
// server/sustainability.ts
export function calculateSustainabilityMetrics(itemCount: number) {
  return {
    landfillWasteDiverted: itemCount * 0.5,
    waterSaved: itemCount * 2700,
    carbonAvoided: itemCount * 5.5,
    treesPlanted: Math.floor((itemCount * 5.5) / 20)
  };
}
```

---

## Additional Resources

### Key Documentation Files

1. **PRODUCTS_FLOW_DOCUMENTATION.md** (666 lines)
   - Complete data flow from frontend to database
   - Foreign key constraint explanation
   - Timeline of request/response cycle
   - Error handling scenarios
   - Must-read for understanding product management

2. **DATABASE_UPDATE_ORDER.md**
   - Schema migration guidelines
   - Dependency ordering
   - Best practices for database changes

3. **SECURITY.md**
   - Security practices and policies
   - Vulnerability reporting
   - Authentication guidelines

4. **todo.md**
   - Development roadmap
   - Feature requests
   - Known issues
   - Backlog items

### External Resources

**Official Documentation:**
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Stripe API Documentation](https://stripe.com/docs)
- [Radix UI Documentation](https://radix-ui.com)

**Learning Resources:**
- tRPC Tutorial: https://trpc.io/docs/quickstart
- Drizzle ORM Tutorial: https://orm.drizzle.team/docs/get-started-mysql
- React Query: https://tanstack.com/query/latest
- TypeScript Handbook: https://www.typescriptlang.org/docs/

---

## Project Structure Reference

```
urban-refit/
├── client/                      # Frontend React application
│   ├── public/                 # Static assets
│   │   ├── products/           # Product images (dev mode)
│   │   └── ...
│   └── src/
│       ├── components/         # Reusable UI components
│       │   ├── ui/            # Radix UI wrappers
│       │   └── ...
│       ├── contexts/           # React contexts
│       │   └── ThemeContext.tsx
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # Utilities
│       │   ├── trpc.ts        # tRPC client setup
│       │   └── utils.ts       # Helper functions
│       ├── pages/              # Page components
│       │   ├── admin/         # Admin dashboard pages
│       │   ├── docs/          # Documentation pages
│       │   ├── Home.tsx
│       │   ├── Shop.tsx
│       │   ├── Product.tsx
│       │   ├── Cart.tsx
│       │   ├── Checkout.tsx
│       │   └── ...
│       ├── App.tsx             # Root component with routing
│       ├── main.tsx            # Entry point
│       ├── index.css           # Global styles
│       └── const.ts            # Client constants
│
├── server/                      # Backend Node.js application
│   ├── _core/                  # Core server functionality
│   │   ├── index.ts           # Express server entry
│   │   ├── trpc.ts            # tRPC initialization
│   │   ├── context.ts         # Request context
│   │   ├── oauth.ts           # OAuth flow
│   │   ├── sdk.ts             # OAuth SDK wrapper
│   │   ├── env.ts             # Environment config
│   │   ├── cookies.ts         # Cookie helpers
│   │   ├── llm.ts             # LLM integration
│   │   ├── systemRouter.ts    # Health checks
│   │   └── vite.ts            # Vite integration
│   ├── routers/                # Modular tRPC routers
│   │   ├── badges.ts          # Badge system
│   │   └── feedback.ts        # Site feedback
│   ├── routers.ts              # Main router (2350 lines)
│   ├── admin-routes.ts         # Admin-specific routes
│   ├── db.ts                   # Database queries (33KB)
│   ├── stripe.ts               # Payment processing
│   ├── resend.ts               # Email service (Resend)
│   ├── email.ts                # Email templates
│   ├── mailchimp.ts            # Newsletter (Mailchimp)
│   ├── s3.ts                   # File uploads (AWS S3)
│   ├── storage.ts              # Storage abstraction
│   ├── sustainability.ts       # Impact calculations
│   ├── shippingLabel.ts        # Label generation
│   ├── badges.ts               # Badge logic
│   └── *.test.ts               # Test files (44 files)
│
├── shared/                      # Code shared between client/server
│   ├── _core/                  # Core utilities
│   │   └── errors.ts          # Error classes
│   ├── const.ts                # Shared constants
│   └── types.ts                # Shared type exports
│
├── drizzle/                     # Database schema and migrations
│   ├── schema.ts               # Table definitions (1048 lines)
│   ├── migrations/             # SQL migration files
│   └── meta/                   # Drizzle metadata
│
├── scripts/                     # Utility scripts
│   └── seed-demo.ts            # Database seeding
│
├── patches/                     # Package patches (pnpm)
│
├── migrations/                  # Legacy migrations
│
├── .manus/                      # Manus platform files
│
├── vite.config.ts              # Vite configuration
├── vitest.config.ts            # Test configuration
├── drizzle.config.ts           # ORM configuration
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind config (implicit)
├── postcss.config.js           # PostCSS config (implicit)
├── package.json                # Dependencies and scripts
├── pnpm-lock.yaml              # Lockfile
├── .prettierrc                 # Code formatting rules
├── .prettierignore             # Format exclusions
├── .gitignore                  # Git exclusions
├── components.json             # Radix UI config
├── cdn-urls.json               # CDN configuration
│
├── TECHNICAL_OVERVIEW.md       # This file
├── PRODUCTS_FLOW_DOCUMENTATION.md  # Data flow guide
├── DATABASE_UPDATE_ORDER.md    # Schema change guide
├── SECURITY.md                 # Security practices
└── todo.md                     # Development roadmap
```

---

## Support & Contact

**Questions?** Ask in team chat or create an issue.

**Found a bug?** Check `todo.md` first, then create an issue.

**Have an idea?** Add it to `todo.md` or discuss with the team.

**Security concern?** See `SECURITY.md` for reporting process.

---

## License

MIT License - See LICENSE file for details

---

**Welcome to Urban Refit!** 🌱👕♻️

We're building a platform that makes sustainable fashion accessible while creating positive environmental impact. Every line of code contributes to reducing fashion waste and supporting charitable causes.

Happy coding!
