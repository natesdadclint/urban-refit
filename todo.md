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
