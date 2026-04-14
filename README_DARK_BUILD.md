# QueLessly — Complete Dark Theme Build

## ✨ What Was Built

A fully functional **QR-based food ordering platform** with a modern dark theme aesthetic featuring:
- **Neon Lime (#a3e635)** accent on **Zinc-950** background
- **Glassmorphism** UI components with backdrop blur
- **Real-time socket.io** integration for live order updates
- **Razorpay** payment integration
- **Responsive bento-style** layouts for mobile-first experience

---

## 📁 File StructureS

```
src/
├── app/
│   ├── layout.tsx                    ← Root layout with Space Grotesk font
│   ├── globals.css                   ← Dark theme + animations
│   ├── page.tsx                      ← Home landing page
│   ├── v/[vendorId]/page.tsx         ← Student menu (dark bento grid)
│   ├── cart/page.tsx                 ← Checkout with glass receipt UI
│   ├── order/[orderId]/page.tsx      ← Live order tracking (animations!)
│   └── dashboard/
│       └── page.tsx                  ← Vendor command center (tabs)
├── lib/
│   ├── api.ts                        ← Fetch wrapper (unchanged)
│   └── socket.ts                     ← Socket.io singleton (unchanged)
└── components/
    ├── Toast.tsx                     ← Toast notifications
    └── Skeleton.tsx                  ← Loading skeletons
```

---

## 🎨 Design System

### Colors
- **Background:** `#09090b` (zinc-950)
- **Primary Accent:** `#a3e635` (lime-400)
- **Error:** rose-500
- **Surfaces:** `rgba(255,255,255,0.04)` with `backdrop-blur-20px`

### Components
- Cards: `rounded-[2rem]` (32px)
- Buttons: `rounded-full`, `active:scale-95`
- Glows: `shadow-[0_0_20px_rgba(163,230,53,0.3)]`

### Animations
- `animate-slide-up`: entrance
- `animate-spin-ring`: cooking status
- `animate-ready-in`: full-screen lime takeover
- `sla-alert`: pulsing red border for slow orders

---

## 🧪 Testing Guide

### 1️⃣ Start Dev Server
```bash
cd quelessly-frontend
npm run dev
```
Open `http://localhost:3000`

### 2️⃣ Test Student Flow
1. Click **"Order Food"** on home page
2. Enter vendor ID: `a1112859-55c2-4156-b343-06818570824b`
3. Tap **"View Menu →"**
4. **Browse:** Search bar, category pills, gradient cards
5. **Add items:** Tap `+` → quantity controls appear
6. **Checkout:** Tap floating lime cart bar
7. **Bill review:** See "Convenience Fee FREE" discount
8. **Pay:** Razorpay modal (test mode)
9. **Track:** Live progress ring, then full-screen lime "Ready!" screen

### 3️⃣ Test Vendor Flow
1. Click **"Dashboard"** on home page
2. **Login:** test@quelessly.com / password123
3. **Orders tab:**
   - See real-time incoming orders (nova banner)
   - Orders waiting >5min show pulsing red SLA alert
   - Tap **"Start Cooking"** → **"Mark Ready"** → **"Mark Completed"**
4. **Menu tab:**
   - Click items to inline-edit name/price
   - Toggle availability with switch
   - Delete with red ✕ button
   - Tap **+** FAB in bottom-right to add new item
5. **QR tab:**
   - See high-contrast QR code
   - Download as SVG
   - Copy shareable link

### 4️⃣ Socket.io Verification
- Vendor places order, student sees status update in real-time
- Vendor marks status, student sees animated progress update
- Check browser DevTools → Network → WS (socket connections)

### 5️⃣ Mobile Experience
- Test on <600px viewport
- Floating bottom nav instead of sidebar
- Cart bar stays above mobile nav
- All cards responsive 2-column grid

---

## 📋 Features Checklist

### Student Pages ✓
- [x] Home landing with vendor ID input
- [x] Menu page with search + category filter
- [x] Bento grid with gradient emoji headers
- [x] Real-time cart qty controls
- [x] Floating sticky cart bar with glow
- [x] Cart receipt with glass UI
- [x] FREE fee indicator
- [x] Razorpay payment flow
- [x] Live order tracking
- [x] Animated progress bar
- [x] Full-screen lime "Ready!" state
- [x] Socket.io event listeners

### Vendor Pages ✓
- [x] Login form with dark styling
- [x] Orders tab with real-time updates
- [x] SLA alerts (5+ min warning)
- [x] One-tap status advances
- [x] Menu tab with inline editing
- [x] Availability toggle switch
- [x] Delete with confirm dialog
- [x] Add item FAB + form
- [x] QR code generation & download
- [x] Copy shareable link
- [x] Desktop sidebar nav
- [x] Mobile bottom nav with badges

### UI/UX ✓
- [x] Dark theme throughout
- [x] Neon lime accent on CTA
- [x] Glassmorphism effects
- [x] Smooth animations (250-400ms)
- [x] Loading skeletons
- [x] Toast notifications (success/error/warning/info)
- [x] Active:scale feedback on buttons
- [x] Focus states on inputs
- [x] Responsive design (mobile-first)
- [x] No external UI library (Tailwind only)

---

## 🚀 Performance Notes

- **Build:** Zero TypeScript errors
- **Bundle:** Uses Space Grotesk (500 KB font, swapped)
- **Animations:** Requestable GPU (3D transforms)
- **Socket.io:** Singleton pattern prevents duplicate connections
- **Images:** No external images (emoji icons only)

---

## 🔌 Environment Variables (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_Saio3geXH92Jmr
```

---

## 📞 API Integration

All endpoints automatically use Bearer token from localStorage:
- Student endpoints: No auth
- Vendor endpoints: Require `vendor_token`
- Socket events: Pass `vendorId` on join

---

## 💡 Key Implementation Notes

### Why Dark Theme?
- **Reduced eye strain** during long kitchen/vendor shifts
- **Modern aesthetic** appeals to younger demographic
- **Neon accents pop** on dark backgrounds (better contrast)
- **Battery efficient** on OLED screens

### Glassmorphism Over Shadows
- Glass card with `backdrop-blur-20px` + `border-white/8`
- Creates depth without weight
- Consistent with modern design systems (iOS, macOS)

### Inline Editing in Menu
- Click item name/price to edit directly
- No modal friction
- Press Enter to save, Esc to cancel
- Optimistic UI updates + server sync

### SLA Alerts
- Orders in `paid` or `preparing` for >5 minutes trigger red pulsing border
- Helps kitchen prioritize stuck orders
- Auto-recalculates every 15 seconds

### Animated Ready Screen
- Full-screen lime takeover with large Order ID
- Prevents scanning the "wrong" order
- Tactile feedback via color change

---

## 🛠 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit

# Start production server
npm run start
```

---

## 🎯 Next Steps (Optional)

1. **Analytics** — Track orders, peak hours, popular items
2. **Inventory** — Set item limits, auto-hide when sold out
3. **Ratings** — Students rate orders post-pickup
4. **Push Notifications** — Mobile PWA notifications for order status
5. **Vendor Settings** — Customize store name, colors, delivery areas
6. **Bulk QR** — Print multiple QRs for different sections
7. **Audit Log** — Track all vendor actions (edit, delete, reorder)

---

**Built with:** Next.js 16 • Tailwind v4 • Socket.io • Razorpay
**Theme:** Dark (zinc-950) • Accent: Neon Lime (#a3e635)
**Last Updated:** 2026-04-08
