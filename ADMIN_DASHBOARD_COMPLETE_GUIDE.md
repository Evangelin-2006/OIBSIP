# 🍕 Pizza Delivery - Complete Admin Dashboard Implementation

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Features Breakdown](#features-breakdown)
3. [Admin Dashboard Components](#admin-dashboard-components)
4. [Order Management](#order-management)
5. [Inventory Management](#inventory-management)
6. [Real-time Notifications](#real-time-notifications)
7. [How to Use](#how-to-use)
8. [API Reference](#api-reference)

---

## System Overview

### What is the Admin Dashboard?

The **Admin Dashboard** is the **control center** for managing the entire pizza delivery operation. It allows admins to:

- 📦 **Track and manage inventory** (stock levels)
- 📋 **Manage orders** (track status)
- ⚠️ **Receive alerts** (when stock is low)
- 📊 **View analytics** (inventory insights)
- 🔄 **Real-time updates** (live Socket.io connection)

### Architecture

```
Frontend (React)
    ↓
Socket.io Connection (Real-time)
    ↓
Backend (Node.js + Express)
    ↓
Database (MongoDB)
    ↓
Email Service (Gmail SMTP)
Cron Job (Node-Cron)
```

---

## Features Breakdown

### ✅ Feature #1: Inventory Management

**What it does:**
- View all inventory items across 5 categories
- Increase or decrease stock quantities  
- See low stock alerts
- Track stock status (Critical/Low/OK)

**Categories:**
- 🥖 **Bases**: Thin Crust, Regular Crust, Thick Crust
- 🍅 **Sauces**: Tomato, White Sauce, Pesto
- 🧀 **Cheeses**: Mozzarella, Cheddar, Parmesan
- 🥬 **Vegetables**: Onion, Bell Pepper, Mushroom, Olives, Tomato
- 🍗 **Meats**: Chicken, Beef, Pepperoni, Ham

**How to Update Stock:**

1. Go to Admin Dashboard → **📦 Inventory Tab**
2. Find the item category (e.g., BASES)
3. Click on any item card
4. Use buttons:
   - **➖ -5**: Reduce by 5 units
   - **- -1**: Reduce by 1 unit
   - **+ +1**: Increase by 1 unit
   - **➕ +5**: Increase by 5 units
5. Stock updates instantly

**Stock Status Indicators:**
```
✅ OK (Green)       → Stock > 30
⚡ LOW (Yellow)     → Stock between 20-30  
⚠️ CRITICAL (Red)   → Stock < 20
```

---

### ✅ Feature #2: Order Management

**What it does:**
- View all customer orders in real-time
- See order details (customer, items, price)
- Update order status
- Track each order's progress

**Order Stages:**

```
📥 Order Received
    ↓
🍳 In Kitchen
    ↓
🚚 Sent to Delivery
```

**How to Update Order Status:**

1. Go to Admin Dashboard → **📋 Orders Tab**
2. Find the customer's order
3. See current status in a dropdown
4. Click dropdown and select new status:
   - **📥 Order Received** (customer just ordered)
   - **🍳 In Kitchen** (chef is preparing)
   - **🚚 Sent to Delivery** (on the way to customer)
5. **User sees status update instantly** ✨

**Order Card Shows:**
- Order ID
- Customer name & email
- Pizza ingredients (base, sauce, cheese, veggies, meats)
- Price
- Current status

---

### ✅ Feature #3: Low Stock Notifications

**Automatic Triggers:**

1. **After Each Order** - Stock is deducted for used ingredients
2. **Every Hour** - Cron job checks all items
3. **Below Threshold** - If stock < 20, sends email

**What Admin Receives:**

```
Email Subject: ⚠️ Low Stock Alert - Pizza Delivery

Email Body:
The following inventory items are running low:
• bases: Thin Crust - Stock: 15/20
• sauces: Tomato - Stock: 18/20
• veggies: Onion - Stock: 12/20

Please restock these items as soon as possible.
```

**Real-time Dashboard Alert:**
- Red banner appears at top of admin dashboard
- Shows which items need restocking
- Auto-disappears after 5 seconds

---

### ✅ Feature #4: User Order Tracking

**User Orders Page (/orders):**

Shows users their order status with:
- 📋 Order ID
- 🕐 Order date & time  
- 💰 Price
- 📊 Progress bar (visual)
- 🍕 Pizza ingredients
- 📍 Current status

**Real-time Updates:**
- When admin changes status, user sees it **instantly**
- Green checkmark next to completed stages
- Notification badge appears

---

### ✅ Feature #5: Analytics Dashboard

**Shows Statistics For:**
- Total units per category (BASES, SAUCES, etc.)
- Number of items per category
- Average stock per item
- Count of low stock items

---

## Admin Dashboard Components

### 📦 **Inventory Tab**

```
Admin Dashboard
    ↓
Inventory Tab
    │
    ├── Summary Cards (Total stock per category)
    │
    ├── BASES Category
    │   ├── Thin Crust [Stock: 50] [+5] [+1] [-1] [-5]
    │   ├── Regular Crust [Stock: 40] [+5] [+1] [-1] [-5]
    │   └── Thick Crust [Stock: 35] [+5] [+1] [-1] [-5]
    │
    ├── SAUCES Category
    │   ├── Tomato [Stock: 30] ...
    │   ├── White Sauce [Stock: 25] ...
    │   └── Pesto [Stock: 20] ...
    │
    └── ... (More categories)
```

### 📋 **Orders Tab**

```
Admin Dashboard
    ↓
Orders Tab
    │
    ├── Order Card 1
    │   ├── Order ID: #ABC123
    │   ├── Customer: John Doe (john@email.com)
    │   ├── Price: ₹299
    │   ├── Items: Thin Crust, Tomato, Mozzarella, Onion, Chicken
    │   ├── Status Dropdown: [In Kitchen ▼]
    │   └── Date: 2/9/2026 10:30 AM
    │
    ├── Order Card 2
    │   ├── ...similar structure...
    │
    └── Order Card N
```

### 📊 **Analytics Tab**

```
Admin Dashboard
    ↓
Analytics Tab
    │
    ├── BASES Statistics
    │   ├── Total Stock: 125 units
    │   ├── Number of Items: 3
    │   ├── Average per Item: 42 units
    │   └── Low Stock Items: 0/3
    │
    ├── SAUCES Statistics
    │   └── ...similar metrics...
    │
    └── ... (More categories)
```

---

## Order Management

### Complete Order Flow

```
1. User Places Order
   ↓
2. Stock Deducted Automatically
   ↓
3. Admin Notified (Real-time)
   ↓
4. Admin Changes Status → "In Kitchen"
   ↓
5. User Sees Update Instantly
   ↓
6. Admin Changes Status → "Sent to Delivery"
   ↓
7. User Receives Notification
```

### Status Transition Rules

```
Order Received
     ↓ (Admin changes it)
   In Kitchen
     ↓ (Admin changes it)
   Sent to Delivery
     ↓
   Delivered ✓
```

**Database saves all status changes with timestamp**

---

## Inventory Management

### Stock Deduction Rules

When a user orders:

```
Base: -1 unit
Sauce: -1 unit
Cheese: -1 unit
Each Veggie Selected: -1 unit per veggie
Each Meat Selected: -1 unit per meat
```

Example: If user orders Margherita Pizza (Thin Crust + Tomato Sauce + Mozzarella + Onion)

```
BEFORE:
- Bases (Thin Crust): 50
- Sauces (Tomato): 30
- Cheeses (Mozzarella): 40
- Veggies (Onion): 25

AFTER ORDER:
- Bases (Thin Crust): 49 ← reduced by 1
- Sauces (Tomato): 29 ← reduced by 1
- Cheeses (Mozzarella): 39 ← reduced by 1
- Veggies (Onion): 24 ← reduced by 1
```

### Threshold System

```
Threshold Value: 20 units

Stock Level Check:
  < 20    → CRITICAL ⚠️ (Alert sent)
  20-30   → LOW ⚡ (Warning badge)
  > 30    → OK ✅ (Green status)
```

---

## Real-time Notifications

### Admin Receives (via Socket.io):

1. **New Order Alert**
   ```
   🎉 New Order from John Doe
   Order ID: #ABC123
   ```

2. **Low Stock Alert**
   ```
   ⚠️ Low Stock Alert
   bases: Thin Crust - 15 remaining
   ```

3. **Order Status Confirmation**
   ```
   Order #ABC123 status changed to: In Kitchen
   ```

### User Receives (via Socket.io):

1. **Order Status Update**
   ```
   ✨ Your order status has been updated to: In Kitchen
   ```

2. **Visual Progress**
   ```
   [=====     ] 66% Progress
   Order Received ✓
   In Kitchen ✓
   Sent to Delivery (pending)
   ```

---

## How to Use

### 🔓 Login as Admin

1. **URL**: `http://localhost:3000/`
2. **Username**: Admin account email
3. **Password**: Admin password
4. **Dashboard**: Automatically redirects to `/admin`

### 📦 Update Inventory

**Step-by-Step:**

1. Click **"📦 Inventory"** tab
2. Find category (e.g., BASES)
3. Locate item (e.g., Thin Crust)
4. Click appropriate button:
   - `➖ -5` to reduce, or `➕ +5` to increase
5. Stock updates automatically
6. All admins see change in real-time

### 📋 Update Order Status

**Step-by-Step:**

1. Click **"📋 Orders"** tab
2. Find customer order
3. Locate **"Status"** dropdown
4. Select new status:
   - 📥 Order Received
   - 🍳 In Kitchen  
   - 🚚 Sent to Delivery
5. Click outside to confirm
6. User sees update instantly ✨

### 📊 View Analytics

1. Click **"📊 Analytics"** tab
2. See all categories with:
   - Total stock units
   - Item count
   - Average per item
   - Low stock count

---

## API Reference

### 1. Get Inventory

```http
GET /api/admin/inventory
Authorization: Bearer {token}

Response:
{
  "inventory": {
    "bases": [
      { "name": "Thin Crust", "stock": 50 },
      { "name": "Regular Crust", "stock": 45 }
    ],
    "sauces": [...],
    "cheeses": [...],
    "veggies": [...],
    "meats": [...]
  },
  "lowStockItems": [...],
  "threshold": 20
}
```

### 2. Update Item Stock

```http
PUT /api/admin/inventory/item
Authorization: Bearer {token}

Request Body:
{
  "category": "bases",
  "itemName": "Thin Crust",
  "quantity": 5  // positive to add, negative to reduce
}

Response:
{
  "success": true,
  "item": { "name": "Thin Crust", "stock": 55 }
}
```

### 3. Get All Orders

```http
GET /api/admin/orders
Authorization: Bearer {token}

Response:
[
  {
    "_id": "123abc",
    "user": {
      "_id": "user123",
      "name": "John Doe",
      "email": "john@email.com"
    },
    "items": {
      "base": "Thin Crust",
      "sauce": "Tomato",
      "cheese": "Mozzarella",
      "veggies": ["Onion"],
      "meats": ["Chicken"]
    },
    "price": 299,
    "status": "Order Received",
    "createdAt": "2026-02-09T10:30:00Z"
  }
]
```

### 4. Update Order Status

```http
PUT /api/admin/orders/{orderId}/status
Authorization: Bearer {token}

Request Body:
{
  "status": "In Kitchen"
}

Response:
{
  "_id": "123abc",
  "status": "In Kitchen",
  "updatedAt": "2026-02-09T10:35:00Z"
}
```

### 5. Get Analytics

```http
GET /api/admin/inventory/analytics
Authorization: Bearer {token}

Response:
{
  "bases": {
    "total": 125,
    "items": [...]
  },
  "sauces": { ... },
  "cheeses": { ... },
  "veggies": { ... },
  "meats": { ... }
}
```

---

## Environment Setup

### Required .env Variables

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/pizza_db
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your-app-specific-password
PORT=5000
```

### Gmail Setup

1. Go to [Gmail App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer"
3. Copy the generated 16-character password
4. Use in EMAIL_PASS

---

## Troubleshooting

### Stock Update Not Working?
- ✅ Check if you're logged in as admin
- ✅ Verify Socket.io connection (should show 🟢 Connected)
- ✅ Check browser console for errors
- ✅ Refresh the page

### Orders Not Updating?
- ✅ Ensure Socket.io is connected
- ✅ Verify user is logged in
- ✅ Check MongoDB connection in backend logs

### Emails Not Sending?
- ✅ Verify EMAIL_USER and EMAIL_PASS in .env
- ✅ Check Gmail "Less secure app access" settings
- ✅ Review backend console logs for errors

---

## Summary

| Feature | Status | What It Does |
|---------|--------|-------------|
| Inventory View | ✅ | See all stock levels |
| Stock Update | ✅ | Add/remove inventory |
| Order Tracking | ✅ | View all customer orders |
| Status Management | ✅ | Update order stage |
| Low Stock Alerts | ✅ | Email + real-time notifications |
| User Tracking | ✅ | Customers see live updates |
| Analytics | ✅ | View inventory statistics |
| Real-time Sync | ✅ | Socket.io live updates |

---

**All features are fully implemented and tested! 🎉**
