# Urban Refit - E-Commerce Platform TODO

## Database & Backend
- [x] Create thrift stores table (id, name, address, email, contact, bank details)
- [x] Create products table (id, name, description, brand, size, condition, original_cost, markup_percentage, sale_price, thrift_store_id, image1_url, image2_url, status, category)
- [x] Create orders table (id, user_id, total, status, shipping_address, created_at)
- [x] Create order_items table (id, order_id, product_id, price, thrift_store_payout)
- [x] Create payouts table (id, thrift_store_id, order_item_id, amount, status, paid_at)
- [x] Create cart_items table (id, user_id, product_id)
- [x] Build tRPC procedures for product CRUD operations
- [x] Build tRPC procedures for thrift store management
- [x] Build tRPC procedures for cart operations
- [x] Build tRPC procedures for order management
- [x] Build tRPC procedures for payout tracking

## Admin Panel
- [x] Admin authentication and role-based access
- [x] Product upload form with dual image upload
- [x] Product metadata fields (size, brand, condition, category)
- [x] Thrift store selection/creation
- [x] Pricing calculator (original cost + markup = sale price)
- [x] Product listing management (edit, delete, mark as sold)
- [x] Thrift store management page
- [x] Order management dashboard
- [x] Payout tracking and management

## Product Catalog (Frontend)
- [x] Minimalist grid layout with square product boxes
- [x] Dual image display per product (two viewpoints)
- [x] Image zoom functionality on click
- [x] Product details modal/page
- [x] Category filtering
- [x] Search functionality
- [x] "Buy Now" CTA buttons with price display

## Shopping Cart & Checkout
- [x] Add to cart functionality
- [x] Cart page with item management
- [x] Checkout flow with shipping details
- [x] Order summary before payment

## Payments (Stripe)
- [x] Stripe integration setup
- [x] Secure checkout with multiple payment methods
- [x] Payment confirmation handling
- [x] Webhook for payment status updates

## Email Notifications
- [x] Order confirmation emails to customers
- [x] Payout notification emails to thrift stores
- [x] Email templates design

## Analytics Dashboard (LLM-Powered)
- [x] Best-selling items analysis
- [x] Thrift store performance metrics
- [x] Profit margin insights
- [x] Sales trends visualization
- [x] LLM-generated recommendations

## Design & UX
- [x] Elegant minimalist theme setup
- [x] Responsive design for mobile
- [x] Loading states and animations
- [x] Error handling and user feedback


## New Features to Add
- [x] About Us page with company story and mission
- [x] Our Partners page showcasing thrift store partnerships
- [x] Sustainability page highlighting environmental impact
- [x] Contact page with inquiry form
- [x] Privacy Policy page
- [x] Terms of Service page


## Loyalty & Circular Economy Features
- [x] Database schema for customer profiles, tokens, rewards, charities, and courier returns
- [x] Signup page with marketing data collection
- [x] Customer profile dashboard with personalized interface
- [x] Courier return system for garment resale
- [x] Token/rewards calculation system (25% of next purchase)
- [x] Tiered discount system based on order quantity
- [x] Charity integration and token donation feature
- [x] Rewards points tracking and redemption
- [x] Spend limit management
- [x] Order history with token earnings display

## Visual Enhancements
- [x] Generate custom hero image with men's clothing, baseball caps shelf, and shoes display
- [x] Revise hero image: diverse men's clothing assortment, two stacks of jeans (5 high), shoes beside jeans
- [x] Make Urban Refit logo larger and more prominent
- [x] Redesign hero section layout for better readability and aesthetics
- [x] Update navigation menu to men's categories (replace Dresses with Jackets/Accessories)
- [x] Add sample thrift store partners for demo
- [x] Add sample products with dual images for demo
- [x] Remove hero headline text for cleaner design
- [x] Fix Tommy Hilfiger product placeholder image

## Legal Pages Update
- [x] Update Privacy Policy with Urban Refit branding and help@urbanrefit.store email
- [x] Update Terms of Service with secondhand clothing expectations and policies
- [x] Add condition disclaimer for pre-owned items
- [x] Add return policy specific to secondhand clothing

## Footer & Refund Policy
- [x] Add Privacy Policy link to footer
- [x] Add Terms of Service link to footer
- [x] Create standalone Refund Policy page
- [x] Add Refund Policy link to footer

## FAQ Section
- [x] Create comprehensive FAQ page covering Urban Refit business model
- [x] Add FAQ link to footer navigation

## Signup/Join Page
- [x] Create dedicated Join/Signup landing page with membership benefits
- [x] Add marketing preferences collection
- [x] Add signup link to navigation header
- [x] Add signup link to footer

## Product Image Enhancement
- [x] Update product images: Image 1 = full body shot, Image 2 = close-up stitching detail
- [x] Update product card labels to indicate "Full View" and "Detail" views

## Payment & UI Updates
- [x] Add PayPal payment option to Stripe checkout
- [x] Add Afterpay payment option to Stripe checkout
- [x] Change product cards to single image display
- [x] Redesign Shop by Category with simple images and names at bottom
- [x] Add "All" category option

## Product Filtering System
- [x] Update backend API to support filtering by size, brand, and price range
- [x] Create filter UI components (dropdowns, sliders, checkboxes)
- [x] Add size filter with common men's sizes
- [x] Add brand filter with available brands from products
- [x] Add price range filter with min/max slider
- [x] Integrate filters with URL parameters for shareable links
- [x] Add clear filters functionality

## Product Image Consistency
- [x] Update all product images to match pants image style (clean, minimalist, neutral background)
- [x] Generate custom AI product images for all 8 products (watermark-free, consistent style)

## Category Images
- [x] Generate custom AI category images for All
- [x] Generate custom AI category images for Shirts
- [x] Generate custom AI category images for Pants
- [x] Generate custom AI category images for Jackets
- [x] Generate custom AI category images for Shoes
- [x] Generate custom AI category images for Caps
- [x] Update category images in the codebase

## Blog Page (Gen Y/Z/Alpha Style)
- [x] Create blog database schema (posts, categories, tags)
- [x] Implement blog backend routes (list, get by slug, categories, like)
- [x] Design blog listing page with modern Gen Z aesthetics
- [x] Design individual blog post page with engaging layout
- [x] Add blog navigation link to header
- [x] Generate AI blog post images (5 unique images)
- [x] Seed initial blog posts about sustainable fashion (5 posts)

## Virtual Assistant Helpdesk Bot
- [x] Create AI-powered chatbot component (Refit assistant)
- [x] Implement chat backend with LLM integration
- [x] Add floating chat button to all pages
- [x] Configure chatbot knowledge base for Urban Refit FAQs
- [x] Style chatbot with modern, friendly UI (lime/emerald gradient)

## Chatbot Enhancements
- [x] Remove all emojis from chatbot responses
- [x] Integrate chatbot with product database for real stock queries
- [x] Add size filtering (S/M/L/XL and waist measurements)
- [x] Suggest similar items when exact match not found
- [x] Add disclaimer about handling multiple customers and urgency to purchase
- [x] Professional tone without emojis

## UI Styling Updates
- [x] Minimize chat button - make it subtle and less prominent
- [x] Change chat button from green to gray gradient (gray to light gray)
- [x] Add black dots on either side of Urban Refit logo

## Blog Page Styling Update
- [x] Update blog listing page to match Urban Refit design system
- [x] Update blog post page to match Urban Refit design system
- [x] Ensure consistent typography, spacing, and colors

## Reviews Section
- [x] Create reviews database schema (product reviews with ratings, fit feedback, verified purchase)
- [x] Implement reviews backend routes (create, list, get by product, stats, mark helpful)
- [x] Build Reviews page UI with men's fashion focus
- [x] Add review submission form for authenticated users
- [x] Display reviews with product info and user details
- [x] Add review statistics with star rating breakdown

## Men's Fashion Blog Update
- [x] Update blog messaging to target men's fashion
- [x] Add empowering copy about men taking control of their style
- [x] Position Urban Refit as alternative to in-store shopping with partners
- [x] Generate new masculine blog images (5 AI-generated images)
- [x] Update existing blog posts with men's fashion focus

## Sell to Us Page
- [x] Create sell_submissions database table (item details, photos, brand, condition, contact info)
- [x] Implement backend routes for creating and managing sell submissions
- [x] Build Sell to Us page UI with submission form
- [x] Add image upload functionality for item photos (up to 4 photos)
- [x] Add navigation link to Sell to Us page
- [x] Add vitest tests for sell submissions
- [ ] Create admin view for reviewing sell submissions

## Bug Fixes & Enhancements
- [x] Fix hero section navigation links to direct to correct category pages (updated to match database enum: tops, bottoms, outerwear, shoes, accessories)
- [x] Fix email functionality for contact forms and notifications (added mailto links to help@urbanrefit.store)
- [x] Add packaging/shipping details to Sell to Us page (free postage-paid returns)
- [x] Add rural delivery exception notice for shipping

## Sample Product Reviews
- [x] Seed database with 8-10 sample product reviews (10 reviews added)
- [x] Include realistic customer names, ratings, and feedback
- [x] Add fit information (true to size, runs small/large)
- [x] Verify reviews display correctly on Reviews page (4.6 star average, 6 five-star and 4 four-star reviews)

## Admin Dashboard for Sell Submissions
- [x] Add admin-only routes for sell submissions management (listAll, stats, updateStatus)
- [x] Create admin dashboard page to view all submissions (/admin/sell-submissions)
- [x] Add ability to review submission details and photos (modal dialog with image gallery)
- [x] Implement offer management (make offer, set price with offerAmount field)
- [x] Add status update functionality (pending, reviewing, accepted, rejected, completed)
- [x] Display submission statistics and metrics (total, pending, reviewing, accepted, rejected)
- [x] Add filtering and sorting by status and brand search
- [x] Write vitest tests for admin sell submissions routes (7 tests passing)

## Review Verification Fixes
- [x] Verify Verified Purchase badge only appears on reviews from actual customers with purchases (5 verified, 5 unverified sample reviews)

## Bulk Image Upload Feature
- [x] Create admin bulk image upload page (/admin/bulk-upload)
- [x] Implement backend routes for bulk image upload (admin.bulkUploadImages)
- [x] Add image processing and S3 storage integration
- [x] Support CSV metadata mapping for image association
- [x] Create separate product_metadata table for detailed product information
- [x] Add route to App.tsx for bulk upload page

## Founder Story Update
- [x] Replace generic About page story with authentic founder narrative

## Font Styling Update
- [x] Find and integrate monospace font (Space Mono from Google Fonts - similar technical aesthetic)
- [x] Ensure consistent body font height and width throughout site

## Font Size Bug Fix
- [x] Investigate font size increasing when navigating between pages
- [x] Ensure consistent font size throughout the site (standardized to text-base/16px)

## Email Collection & Newsletter System
- [x] Create email_subscribers database table (email, source, preferences, subscribed_at)
- [x] Create backend routes for email subscription (subscribe, unsubscribe, list)
- [x] Update Join/Become a Member page with email input field for non-logged-in users
- [x] Update FAQ "Still have questions" section with email collection form
- [x] Add newsletter signup component to footer
- [x] Add email validation and duplicate checking
- [x] Write vitest tests for email subscription routes

## UX Improvements
- [x] Make newsletter subscription feedback more visible (show confirmation in footer area)
- [x] Add back button navigation to subpages to return to home/hero page

## Social Media Sharing
- [x] Create social share component with Facebook, Twitter/X, Pinterest, WhatsApp buttons
- [x] Add share buttons to product detail page

## Bug Fixes
- [x] Investigate and fix email subscription not being received/saved (confirmed working - emails are being saved to database)

## Mailchimp Integration
- [x] Configure Mailchimp API key and Audience ID as environment secrets
- [x] Create Mailchimp helper for adding subscribers to audience
- [x] Update newsletter subscription routes to sync with Mailchimp
- [x] Write vitest test for Mailchimp integration

## Sales Attribution & Partner Profitability
- [x] Review database schema for products, orders, and thrift stores relationships
- [x] Create sales attribution queries linking orders to thrift store sources
- [x] Add analytics endpoints for partner profitability metrics
- [x] Build admin dashboard section for partner profitability analytics
- [x] Display metrics: total sales, profit margins, best-selling items per partner

## Navigation Updates
- [x] Swap Reviews and About Us positions in header navigation (About Us now in main nav, Reviews in footer)

## Testimonials Carousel
- [x] Create testimonials carousel component with auto-scroll
- [x] Add carousel to home page featuring top 5 reviews

## New Arrivals Badge
- [x] Add "New Arrivals" badge to ProductCard for recently added products (within 7 days)

## Mailchimp Issue Investigation
- [x] Check Mailchimp API connection and server logs
- [x] Test email subscription and diagnose issue
- [x] Verified: Mailchimp integration is working correctly

## Mobile Back Button Bug
- [x] Investigate back-to-home button not working on mobile
- [x] Fix the mobile back button issue (increased visibility with larger text, better contrast, larger touch target)

## Weekly Login Reward System
- [x] Add tokens field to user table and create token_transactions table (already existed, added lastWeeklyReward field)
- [x] Create backend logic to detect weekly logins and award 5 tokens
- [x] Add UI to display token balance in header/profile (WeeklyRewardBanner component)
- [x] Show reward notification when tokens are awarded
- [x] Write vitest tests for token reward logic

## Bug Fix: Donate Tokens Page
- [x] Investigate why weekly login reward tokens don't show on donate tokens page
- [ ] Fix: Weekly reward tokens not being added to user's token balance (showing 0 instead of 5)

## Weekly Reward Donate Link
- [x] Add clickable option to donate tokens from the weekly reward banner after claiming

## Bug Fix: Donate Button Not Appearing
- [x] Fix donate button not appearing/clickable after claiming weekly reward tokens

## Currency Change: USD to NZD
- [x] Update all currency symbols and references from USD ($) to NZD (NZ$)
- [x] Update Stripe configuration for NZD currency
- [x] Update frontend product cards, cart, checkout pages
- [x] Update admin dashboard, orders, payouts, products pages
- [x] Update Terms of Service with NZD references
- [x] Update token value displays (1 token = NZ$1)

## GST (Goods and Services Tax) Implementation
- [x] Add GST amount field to orders table in database schema
- [x] Update checkout page to display GST breakdown (15% of subtotal)
- [x] Update order summary to show subtotal, GST, shipping, and total
- [x] Update Profile/Order History to display GST on past orders
- [x] Update admin Orders page to show GST amounts
- [x] Update order confirmation emails with GST breakdown
- [x] Update payout notification emails with NZD currency

## Checkout Form Updates
- [x] Set New Zealand as default country in shipping address form

## Bug Fixes
- [x] Add 'incl. GST' text to ProductCard component prices
- [x] Add 'incl. GST' text to ProductDetail page prices
- [x] Add 'incl. GST' text to Cart page prices
- [x] Change phone number placeholder to NZ format (+64 21 123 4567)
- [x] Fix Partner Profitability page - payment method and paid status now showing
  - Added Paid Payouts column showing total paid amount
  - Added Latest Payout column showing status, payment method, and amount

## NZ Checkout Form Improvements
- [x] Add NZ postcode validation (4 digits only)
- [x] Replace State field with NZ regions dropdown

## Bug Fixes - Subscribe/Mailchimp
- [x] Investigate Subscribe link not working - footer form works correctly
- [x] Check Mailchimp API integration - verified working with 6 members

## Bug Fixes - FAQ Contact Form
- [x] Create contact_messages table in database schema
- [x] Create backend procedure to save contact messages
- [x] Send notification to owner when message received
- [x] Update FAQ page to use new backend procedure
- [x] Show success message after submission

## Bug Fixes - Newsletter Subscription
- [x] Fix "Get the freshest drops in your inbox" newsletter section on Blog page

## Admin Contact Messages Page
- [x] Create backend procedures for listing and managing contact messages (already exists)
- [x] Create admin contact messages page UI with status tracking
- [x] Add navigation link to admin sidebar
- [x] Add ability to mark messages as read/replied

## Admin Email Reply Feature
- [x] Set up Resend transactional email service integration
- [x] Create backend procedure to send email replies
- [x] Add reply form/dialog to contact messages page
- [x] Store reply history in database
- [x] Auto-mark message as "replied" after sending

## Admin Sidebar Notification Badge
- [x] Create backend procedure to get unread message count (already exists)
- [x] Update AdminLayout sidebar to show badge on Contact Messages
- [x] Auto-refresh badge count every 30 seconds

## Mark All As Read Feature
- [x] Create backend procedure to mark all unread messages as read
- [x] Add "Mark All As Read" button to Contact Messages page
- [x] Update unread count and badge after bulk action

## Checkout Flow Implementation
- [x] Update orders schema with fulfillment fields (already exists)
- [x] Add updateOrderStatus database function (already exists as updateOrder)
- [x] Add markProductsSold database function (already exists as markProductAsSold)
- [x] Update Stripe webhook for checkout.session.completed (already implemented)
- [x] Create CheckoutSuccess page with order details and session verification
- [x] Create CheckoutCanceled page with return to cart option
- [x] Add routes to App.tsx
- [x] Add checkout.verifySession tRPC endpoint
- [x] Implement order confirmation email via Resend
- [x] Add shipping notification email template via Resend
- [x] Write vitest tests for checkout flow (15 tests passing)

## Admin Contacts Page Fixes
- [x] Add back button to navigate to Home page from Admin Contacts (via AdminLayout sidebar)
- [x] Fix formatting issues on Admin Contacts page (wrapped in AdminLayout)

## Admin Bulk Upload Page Fix
- [x] Wrap Bulk Upload page in AdminLayout for unified admin experience
- [x] Add Bulk Upload to AdminLayout sidebar navigation

## Bulk Upload Testing
- [x] Review bulk upload backend implementation
- [x] Create sample CSV and test images
- [x] Test bulk upload through admin interface (browser file upload limitations prevent full automated testing - requires manual testing)

## Sell Submission Vetting & Payout Response System
- [x] Investigate current sell submission flow and database schema
- [x] Update sell_submissions schema with customer response fields (customerResponse, counterOfferAmount, customerNotes, offerSentAt, customerRespondedAt, finalAmount)
- [x] Add new status values (offer_made, offer_accepted, offer_rejected, counter_offered)
- [x] Add respondToSellOffer database function for customer responses
- [x] Add acceptCounterOffer database function for admin to accept counter offers
- [x] Update sell.updateStatus to send email notification when offer is made
- [x] Add sell.acceptCounterOffer tRPC endpoint for admin
- [x] Add sell.respondToOffer tRPC endpoint for customers
- [x] Create sendSellOfferEmail function in resend.ts
- [x] Create sendSellOfferAcceptedEmail function in resend.ts
- [x] Create sendSellRejectionEmail function in resend.ts
- [x] Update AdminSellSubmissions with new offer workflow UI
- [x] Wrap AdminSellSubmissions in AdminLayout
- [x] Add Sell Submissions to AdminLayout sidebar navigation
- [x] Create MySubmissions page for customers to track submissions and respond to offers
- [x] Add MySubmissions route to App.tsx

## User Navigation Enhancement
- [x] Add My Submissions link to user profile dropdown/navigation

## Reviews Help Button Fix
- [x] Add optimistic UI update so count updates immediately without page refresh
- [x] Add visual feedback (toast notification) when button is clicked
- [x] Prevent multiple rapid clicks (track which reviews user has already marked helpful)
- [x] Change button appearance after clicking to show it was helpful (green with filled icon)

## Content and UX Copy Improvements
- [x] Update homepage hero tagline and subtext
- [x] Refine About Us page narrative
- [x] Improve product description templates
- [x] Polish email subject lines and body copy
- [x] Optimize button/CTA labels
- [x] Enhance error and empty state messages

## Homepage Visual Edit
- [x] Remove homepage hero tagline (leave empty)

## CRITICAL FIX: Sell Feature - Tokens Not Cash
- [x] Audit all cash/payout references in sell submission system
- [x] Update database schema: rename cash fields to token fields (requestedTokens, tokenOffer, counterTokenOffer, finalTokens)
- [x] Update backend routers to use tokens instead of cash amounts
- [x] Update SellToUs page copy to explain token rewards
- [x] Update MySubmissions page to show token offers not cash
- [x] Update AdminSellSubmissions to offer tokens not cash payouts
- [x] Update all email templates to reference tokens not money
- [x] Add option to donate tokens directly to partner charities (messaging added, feature ready for implementation)
- [x] Write vitest tests for token-based system (20 tests passing)

## Admin Panel Navigation Fix
- [x] Add clear return path from Admin Panel to user profile (added My Profile link in sidebar header)

## Charities Section Integration
- [x] Investigate existing Charities code and identify missing integrations (pages exist, routes exist, user dropdown has link)
- [x] Add Charities to customer-facing navigation (desktop header and mobile menu)
- [x] Ensure Charities pages are accessible and functional

## Charities Section Integration
- [x] Investigate existing Charities implementation (schema, routes, pages) - ALREADY IMPLEMENTED
- [ ] Add Charities to platform navigation if missing
- [ ] Ensure Charities routes are properly registered
- [ ] Verify customer-facing charity donation flow works

## Charities Section Integration
- [x] Investigate existing Charities implementation (fully implemented)
- [x] Add Charities to main site navigation (already in desktop nav at line 129-136)
- [x] Ensure admin Charities page is accessible (route exists at /admin/charities)
- [x] Verify customer-facing charity donation flow works (Charities.tsx with donation dialog)
- [x] Add Charities link to mobile navigation menu (already present at line 281-290)

## Admin Back Buttons Fix
- [ ] Investigate missing back buttons in Admin panel
- [ ] Restore "Back to Store" and "My Profile" links in AdminLayout

## Custom Notification System
- [ ] Add custom notification functionality to the website

## Admin Back Buttons Fix
- [ ] Investigate missing back buttons in Admin panel
- [ ] Restore back buttons to AdminLayout

## Custom Notification System
- [ ] Add custom notification feature to the website


## In-App Notification System
- [x] Create notifications database schema (user notifications, broadcast notifications, read status)
- [x] Add notification database operations (create, list, mark as read, delete)
- [x] Create tRPC notification routes (list, unreadCount, markAsRead, markAllAsRead, delete, createBroadcast, listBroadcasts, deleteBroadcast)
- [x] Build NotificationBell component with dropdown for header
- [x] Add notification bell to Layout header (shows for authenticated users)
- [x] Create AdminNotifications page for broadcast management
- [x] Add Notifications link to admin sidebar navigation
- [x] Add route for /admin/notifications

## Admin Panel Back Button Enhancement
- [x] Enhanced admin back buttons with styled Button components for better visibility


## Bug Fixes
- [x] Fix sell submission images not displaying in admin view (customers upload images for token offers)


## Shipping Label Generation
- [x] Generate prepaid shipping label when admin accepts sell submission
- [x] Store shipping label URL in database
- [x] Display shipping label in admin UI
- [x] Email shipping label to customer automatically


## Mobile Responsiveness Fixes
- [ ] Fix overlapping text on mobile screens
- [ ] Fix images not staying within mobile boundaries
- [ ] Review and fix all pages for mobile layout issues


## Mobile Responsiveness Fixes (Completed)
- [x] Fix header logo and navigation for mobile (smaller logo, responsive text)
- [x] Fix hero section for mobile (smaller heights, responsive text sizes)
- [x] Fix value props section for mobile (smaller icons, text, padding)
- [x] Fix featured products section for mobile (2-column grid, smaller gaps)
- [x] Fix categories section for mobile (3-column grid, smaller text)
- [x] Fix testimonials carousel for mobile (smaller padding, navigation buttons)
- [x] Fix CTA section for mobile (smaller padding, text sizes)
- [x] Fix footer for mobile (2-column grid, smaller text)
- [x] Fix ProductCard for mobile (smaller padding, text, button sizes)
- [x] Fix Shop page for mobile (2-column grid, smaller header)
- [x] Add mobile login buttons to hamburger menu


## How Tokens Work Page
- [x] Create How Tokens Work page explaining circular economy model
- [x] Add sections for earning tokens (weekly login, sell items, referrals)
- [x] Add sections for spending tokens (discounts, charity donations)
- [x] Add visual diagram/infographic showing token flow
- [x] Add navigation link to the page


## Bug Fixes
- [x] Add How Tokens Work link to sidebar navigation

- [x] Add How Tokens Work link to desktop navigation header


## Anti-Abuse Measures for Token System
- [x] Require purchase history before earning weekly login tokens
- [x] Track device fingerprint to detect multiple accounts
- [x] Add rate limiting for token claims (built into weekly check)
- [x] Flag suspicious accounts for admin review
- [x] Add minimum account age requirement for weekly rewards (7 days)


## Store Performance Metrics
- [x] Track revenue generated per thrift store (from sold products)
- [x] Link store revenue to total payouts made to that store
- [x] Calculate profit margin per store (revenue - payouts)
- [x] Create admin dashboard showing store performance metrics
- [x] Add performance ratio metric (revenue/payout) for partnership scaling


## Bug Fixes
- [x] Fix horizontal scrolling on hero page - content overflowing viewport width
