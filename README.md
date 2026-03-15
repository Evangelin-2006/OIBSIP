<<<<<<< HEAD
# 🍕 Pizza Delivery Application - Complete Setup & Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Installation & Setup](#installation--setup)
4. [Running the Application](#running-the-application)
5. [Key Features](#key-features)
6. [Project Structure](#project-structure)
7. [API Endpoints](#api-endpoints)
8. [Database Schema](#database-schema)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Pizza Delivery** is a full-stack MERN application that enables users to:
- ✅ Browse and customize pizzas
- ✅ Place orders with real-time tracking
- ✅ Receive instant order status updates

**Admins can:**
- ✅ Manage inventory across 5 categories
- ✅ View and update order statuses
- ✅ Receive low stock alerts
- ✅ View analytics and reports

**Real-time Features:**
- ✅ Socket.io for live updates
- ✅ Automatic stock deduction after orders
- ✅ Email notifications for low stock
- ✅ Scheduled daily inventory reports

---

## 🔧 Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Socket.io** - Real-time communication
- **Node-Cron** - Job scheduling
- **Nodemailer** - Email service
- **JWT** - Authentication

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Socket.io Client** - Real-time client
- **Axios** - HTTP client
- **React Router** - Navigation
- **CSS3** - Modern styling with variables

---

## ⚙️ Installation & Setup

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud - Atlas recommended)
- **Gmail account** (for email notifications)

### Step 1: Clone or Download Project

```bash
cd pizza_delivery
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
# Add the following variables
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend` folder:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pizza_db
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your-app-specific-password
JWT_SECRET=your-secret-key-here
PORT=5000
```

#### Getting Gmail App Password:
1. Go to [Gmail App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer"
3. Copy the 16-character password
4. Paste in `EMAIL_PASS`

#### MongoDB Atlas Setup:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Replace `username:password` in `MONGO_URI`

### Step 4: Frontend Setup

```bash
# Navigate to frontend (from pizza_delivery root)
cd frontend

# Install dependencies
npm install
```

---

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on port 5000
✅ MongoDB connected
📅 Stock check scheduler started
📅 Daily report scheduler started
```

### Start Frontend Development Server

**In a new terminal:**

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v4.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Access the Application

- **Frontend:** http://localhost:5173/
- **Backend API:** http://localhost:5000/api/

---

## ✨ Key Features

### 1. **User Authentication**
- Email verification
- Password reset functionality
- JWT token-based sessions

### 2. **Pizza Customization**
- Select base (Thin, Regular, Thick)
- Choose sauce (Tomato, White, Pesto)
- Pick cheese (Mozzarella, Cheddar, Parmesan)
- Add vegetables (5+ options)
- Add meats (4+ options)

### 3. **Real-time Order Tracking**
- Live order status updates
- Progress bar visualization
- Order history with details
- Email confirmations

### 4. **Inventory Management** (Admin)
- View stock levels
- Increase/decrease inventory
- Quick buttons (±1, ±5)
- Color-coded status (Red/Yellow/Green)

### 5. **Order Management** (Admin)
- View all orders
- Update order status (3 stages)
- See customer details
- Real-time notifications

### 6. **Low Stock Alerts**
- Hourly automatic checks
- Post-order triggers
- Email notifications
- Dashboard warnings

### 7. **Analytics Dashboard**
- Category statistics
- Stock levels per category
- Low stock counts
- Historical data

---

## 📁 Project Structure

```
pizza_delivery/
│
├── backend/
│   ├── server.js                    # Main Express server with Socket.io
│   ├── package.json
│   ├── .env                         # Environment variables
│   │
│   ├── models/
│   │   ├── User.js                  # User schema (name, email, password, isAdmin)
│   │   ├── Order.js                 # Order schema (items, price, status)
│   │   ├── Pizza.js                 # Pizza recommendations (optional)
│   │   └── Inventory.js             # Stock tracking per category
│   │
│   ├── controllers/
│   │   ├── authController.js        # Login, Register, Forgot Password
│   │   ├── orderController.js       # Order creation & management
│   │   ├── pizzaController.js       # Pizza recommendations
│   │   └── adminController.js       # Inventory & advanced features
│   │
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── orderRoutes.js           # /api/orders/*
│   │   ├── pizzaRoutes.js           # /api/pizzas/*
│   │   ├── adminRoutes.js           # /api/admin/*
│   │   └── paymentRoutes.js         # /api/payments/* (optional)
│   │
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verification
│   │
│   └── utils/
│       ├── email.js                 # Nodemailer setup
│       ├── razorpay.js              # Payment integration
│       └── scheduler.js             # Cron jobs
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   │
│   ├── src/
│   │   ├── main.jsx                 # React entry point
│   │   ├── App.jsx                  # Route configuration
│   │   ├── index.css                # Global design system
│   │   ├── api.js                   # Axios instance
│   │   │
│   │   └── pages/
│   │       ├── Login.jsx            # Login page
│   │       ├── Register.jsx         # Registration
│   │       ├── Forgot.jsx           # Password reset request
│   │       ├── ResetPassword.jsx    # Password reset form
│   │       ├── Verify.jsx           # Email verification
│   │       ├── Dashboard.jsx        # Pizza browse & order
│   │       ├── PizzaBuilder.jsx     # Pizza customization
│   │       ├── UserOrders.jsx       # Order tracking
│   │       ├── AdminDashboard.jsx   # Admin control panel
│   │       │
│   │       └── styles (*.css)
│   │           ├── auth.css         # Auth pages styling
│   │           ├── Dashboard.css
│   │           ├── PizzaBuilder.css
│   │           ├── AdminDashboard.css
│   │           └── UserOrders.css
│   │
│   └── public/                      # Static assets
│
├── ADMIN_DASHBOARD_COMPLETE_GUIDE.md  # Admin feature documentation
├── INVENTORY_SYSTEM_GUIDE.md        # Inventory system details
└── UI_CONSISTENCY_GUIDE.md          # Design system documentation
```

---

## 🔌 API Endpoints

### Authentication Routes

```http
POST /api/auth/register
  { name, email, password } → Creates new user account

POST /api/auth/verify/{token}
  Verifies email address

POST /api/auth/login
  { email, password } → Returns JWT token & user

POST /api/auth/forgot-password
  { email } → Sends password reset link

POST /api/auth/reset-password/{token}
  { password } → Resets user password
```

### Order Routes

```http
POST /api/orders/create
  { items, price, delivery_address }
  → Creates order, deducts stock, emits Socket event

GET /api/orders
  → Returns user's orders

PUT /api/orders/{id}/cancel
  → Cancels order, refunds stock
```

### Admin Routes

```http
GET /api/admin/inventory
  → Returns all inventory with stock levels & low stock items

PUT /api/admin/inventory/item
  { category, itemName, quantity }
  → Updates stock

POST /api/admin/inventory/item
  { category, itemName, stock }
  → Adds new inventory item

GET /api/admin/orders
  → Returns all orders with customer details

PUT /api/admin/orders/{id}/status
  { status } → Updates order status (broadcasts via Socket)

GET /api/admin/inventory/analytics
  → Returns inventory statistics by category
```

---

## 💾 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  isAdmin: Boolean (default: false),
  createdAt: Date
}
```

### Order Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  items: {
    base: String,
    sauce: String,
    cheese: String,
    veggies: [String],
    meats: [String]
  },
  price: Number,
  status: String (enum: "Order Received", "In Kitchen", "Sent to Delivery"),
  createdAt: Date,
  updatedAt: Date
}
```

### Inventory Model
```javascript
{
  _id: ObjectId,
  category: String (enum: "bases", "sauces", "cheeses", "veggies", "meats"),
  name: String,
  stock: Number,
  updatedAt: Date
}
```

---

## 🔄 Real-time Socket Events

### Admin Events

**Emit:**
- `admin_join` - Admin connects to admin room
- (All admins receive broadcasts)

**Receive:**
- `low_stock_alert` - Low stock warning
- `new_order` - New order placed
- `order_status_updated` - Order status changed
- `scheduled_low_stock_alert` - Hourly check results
- `daily_inventory_report` - Daily report

### User Events

**Emit:**
- `user_join` - User connects with room `user_{userId}`

**Receive:**
- `order_status_updated` - Their order status changed
- (In their specific room)

---

## 🛠️ Troubleshooting

### Backend Issues

**Problem:** Port 5000 already in use
```bash
# Windows PowerShell
Get-Process -Name node | Stop-Process -Force
# Or specify different port in .env
```

**Problem:** MongoDB connection failed
- ✅ Check internet connection (for Atlas)
- ✅ Verify MONGO_URI in .env
- ✅ Whitelist IP in MongoDB Atlas

**Problem:** Emails not sending
- ✅ Enable "Less secure app access" in Gmail
- ✅ Use app-specific password, not Gmail password
- ✅ Verify EMAIL_USER and EMAIL_PASS in .env

### Frontend Issues

**Problem:** API calls failing
- ✅ Verify backend is running (port 5000)
- ✅ Check CORS configuration in backend
- ✅ Inspect Network tab in browser DevTools

**Problem:** Socket.io connection failing
- ✅ Check backend Socket.io setup
- ✅ Verify firewall allows WebSocket
- ✅ Check browser console for errors

**Problem:** Styles not loading
- ✅ Clear browser cache (Ctrl+Shift+Delete)
- ✅ Restart frontend dev server
- ✅ Check file paths in import statements

---

## 📝 Important Notes

### Stock Threshold
- Items below **20 units** trigger low stock alerts
- Configurable in `adminController.js` line with `threshold: 20`

### Email Schedule
- **Hourly Check:** Every hour at :00 minute
- **Daily Report:** Every day at 8:00 AM
- Configurable in `scheduler.js`

### Order Status Flow
```
Order Received (initial)
    ↓
In Kitchen (admin updates)
    ↓
Sent to Delivery (admin updates)
```

### Stock Deduction
When user orders, automatically reduces:
- 1 x Base
- 1 x Sauce
- 1 x Cheese
- 1 x each Veggie selected
- 1 x each Meat selected

---

## 🎉 You're All Set!

**Next Steps:**

1. ✅ Install dependencies
2. ✅ Configure .env files
3. ✅ Start backend (`npm run dev`)
4. ✅ Start frontend (`npm run dev`)
5. ✅ Visit http://localhost:5173/
6. ✅ Register an account
7. ✅ Browse pizzas
8. ✅ Place an order
9. ✅ Track in real-time

For more details:
- [Admin Dashboard Guide](./ADMIN_DASHBOARD_COMPLETE_GUIDE.md)
- [Inventory System Guide](./INVENTORY_SYSTEM_GUIDE.md)
- [UI Consistency Guide](./UI_CONSISTENCY_GUIDE.md)

**Happy Ordering! 🍕**
=======
# OIBSIP
Full-stack Pizza Delivery App (OASIS INFOBYTE Internship) - React + Node.js + MongoDB + Razorpay. Custom pizza builder, admin inventory management, real-time order tracking, payment integration, and low-stock notifications
#  Pizza Delivery Full-Stack App
OASIS INFOBYTE Internship Task 
React + Node.js + MongoDB + Razorpay  
Built by: Evangelin S. 

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

##  Project Overview
Full-stack pizza delivery application with custom pizza builder, admin inventory management, real-time order tracking, and payment integration. Created for OASIS INFOBYTE Web Development Internship (Level 2).

## ✨ Key Features
- User Flow: Registration, login, email verification, forgot password
- Custom Pizza Builder: 5 bases × 5 sauces × cheese types × multiple veggies/meats
- Payment: Razorpay test mode integration (dummy account)
- Admin Panel: Inventory tracking, stock updates, order status management
- Notifications: Low stock email alerts (threshold: pizza base < 20)
- Real-time: Order status updates reflect instantly in user dashboard

##  Tech Stack
| Frontend | Backend | Database | Payments | Other |
|----------|---------|----------|----------|-------|
| React | Node.js/Express | MongoDB | Razorpay | Nodemailer, JWT |

##  Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Razorpay test account

### Clone & Install
git clone https://github.com/Evangelin-2006/OIBSIP.git
cd pizza-delivery-app

# Backend
cd backend
npm install
cp .env.example .env  # Add your key

# Frontend
cd ../frontend
npm install
npm run dev
>>>>>>> aaf80796afe8d64b2e0fbab284628f6284bc9f91
