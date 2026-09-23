# 🦞 Ocean Fresh Seafoods (Pvt) Ltd. • Modern Seafood E-Commerce Platform & Admin Panel

An ultra-modern, full-stack seafood e-commerce web platform and comprehensive administrative control panel for **Ocean Fresh Seafoods (Pvt) Ltd.**, operating from Kirulapone, Colombo 5. Features modern UI/UX design, responsive micro-interactions, WhatsApp ordering, Cash on Delivery, and live order tracking.

---

## 🌟 Key Features

### 🛍️ Customer Storefront
- **Modern Oceanic Aesthetic**: Tailored with ocean navy, teal, cyan gradients, and glassmorphism.
- **Outlet Switcher**: Select between **Colombo Central Hub**, **Kandy Express Outlet**, and **Tissamaharama Depot**.
- **Hero Carousel**: Highlighting direct day-boat catch, Ceylon lagoon mud crabs, and export quality seafood.
- **Seafood Categories**:
  - Prawns & Shrimps (Peeled & deveined, black tiger prawns, tail-on/off)
  - Fresh Fish (Seer fish steaks & curry cubes, Yellowfin Tuna, Thalapath, Modha, Red Snapper)
  - Mud Crab & Meat (Live Ceylon lagoon crabs, picked claw meat, lump meat)
  - Squid & Cuttlefish (Whole cleaned, calamari rings)
  - Imported Gourmet (Norwegian Atlantic Salmon)
  - Dumplings & Bites (Handmade prawn dim sum, golden prawn bites)
- **Interactive Cut & Portion Selector**: Switch between portions (e.g. 500g Sliced, 1 KG Steaks, Boneless Cubes) with real-time price updates.
- **Slide-Over Cart Drawer**: Live subtotal in Sri Lankan Rupees (LKR / රු), quantity adjusters, and insulated packaging fee calculation.
- **Checkout & Scheduled Dispatch**:
  - Sri Lankan delivery address & city zone selection
  - Delivery date selector (Today Express, Tomorrow, Day after Tomorrow)
  - Morning (9 AM - 1 PM) and Afternoon (2 PM - 6 PM) time slots
  - Payment options: Cash on Delivery (COD), Online Card via PayHere sandbox, and Bank Transfer / FriMi
  - Confetti celebration upon order confirmation
- **Live Order Tracking**: Search by order reference (e.g. `TSG-92841`) to monitor preparation and dispatch status in real-time.
- **Boat-to-Plate Transparency**: Step-by-step documentation of direct-from-fishermen cold-chain sourcing.
- **Contact & Inquiries Form**: Connected to backend SQLite database with instant confirmation.

---

### 🛡️ Admin Panel (`/admin`)
- **Secure Authentication**: Protected via JWT tokens.
  - **Default Username**: `admin`
  - **Default Password**: `admin123`
- **Dashboard Analytics**:
  - Total Revenue (LKR)
  - Total Orders Count & Pending Dispatches
  - Active Products Count & Inventory Stock Alerts
  - Revenue Breakdown by Outlet
  - Recent incoming orders table
- **Product Management**:
  - Add, edit, and delete seafood items
  - Manage multiple cut variants and portion prices
  - Toggle stock status (In Stock / Out of Stock)
  - Set freshness badges (e.g. "Day-Boat Fresh", "Sashimi Grade", "100% Hand Picked")
- **Order & Dispatch Management**:
  - View full customer address, phone number, and special delivery notes
  - One-click status updates (`Pending` ➔ `Processing` ➔ `Out for Delivery` ➔ `Delivered` ➔ `Cancelled`)
- **Category & Outlets Management**:
  - Manage seafood categories and physical outlet branch information
- **Customer Inquiries Inbox**:
  - Read, filter, and delete messages submitted via the Contact Us form.

---

## 🚀 Running the Project

### 1. Start Backend Server (Port 5000)
```bash
cd server
npm install
npm run dev
```
The server will initialize `server/data/seafood.db` SQLite database, apply migrations, and automatically seed initial seafood products, outlets, categories, and demo admin credentials.

### 2. Start Frontend App (Port 3000)
```bash
cd client
npm install
npm run dev
```
Visit: **`http://localhost:3000/`**

---

## 🛠️ Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Canvas Confetti.
- **Backend**: Node.js, Express, TypeScript, better-sqlite3, JWT, bcryptjs.
- **Database**: Embedded SQLite (`seafood.db`) with zero external database setup required.
