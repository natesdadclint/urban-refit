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
