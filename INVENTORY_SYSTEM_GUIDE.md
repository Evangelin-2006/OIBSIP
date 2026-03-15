# Pizza Delivery - Inventory Management System

## Overview

This comprehensive inventory management system includes real-time stock tracking, order status updates, low stock alerts, and admin notifications. The system is built with Socket.io for real-time communication and node-cron for scheduled tasks.

## Features Implemented

### 1. **Mini Inventory Management System** 📦
- **Categories**: Bases, Sauces, Cheeses, Vegetables, Meats
- **Stock Tracking**: Monitor quantity for each item
- **Real-time Updates**: Changes reflected instantly across all connected admins

### 2. **Stock Deduction on Orders** 🛒
- Automatically deducts inventory when an order is placed
- Supports multiple items per category (veggies, meats)
- Prevents negative stock values

### 3. **Low Stock Alerts** ⚠️
- **Threshold**: Default set to 20 units per item
- **Scheduled Check**: Runs every hour automatically
- **Email Notifications**: Sends to admin email when items go below threshold
- **Real-time Alert**: Socket.io notification to connected admins

### 4. **Order Status Management** 📋
- **Three Stages**:
  - 📥 Order Received
  - 🍳 In Kitchen
  - 🚚 Sent to Delivery
- **Real-time Updates**: Users see status changes instantly
- **Admin Control**: Change status from admin dashboard

### 5. **Real-time Communication** 🔄
- Socket.io integration for bidirectional communication
- Admin receives new orders in real-time
- Users receive order status updates instantly
- Live connection status display

## Admin Dashboard Features

### Inventory Tab 📦
- **Summary Cards**: View total stock per category
- **Stock Management**:
  - Add/Remove stock in increments (±1, ±5)
  - Real-time stock bars with color coding
  - Alert badges for low stock items
- **Item Details**:
  - Current stock level
  - Threshold status
  - Visual progress bars

### Orders Tab 📋
- **Order Cards**: Display all orders with details
- **Quick Actions**: Update order status via dropdown
- **Order Information**:
  - Customer name and email
  - Order items (base, sauce, cheese, veggies, meats)
  - Order price
  - Timestamp

### Analytics Tab 📊
- **Category Statistics**:
  - Total stock per category
  - Number of items
  - Average stock per item
  - Low stock count

## How to Update Stock

### From Admin Dashboard

1. **Navigate to Admin Dashboard**
   ```
   URL: http://localhost:3000/admin
   ```

2. **Access Inventory Tab**
   - Click on "📦 Inventory" tab
   - Browse through categories (Bases, Sauces, Cheeses, Veggies, Meats)

3. **Update Individual Items**
   - Find the item card you want to update
   - Use buttons to adjust stock:
     - **➖ -5**: Decrease by 5 units
     - **- -1**: Decrease by 1 unit
     - **+ +1**: Increase by 1 unit
     - **➕ +5**: Increase by 5 units

4. **Monitor Stock Status**
   - **✅ OK** (Green): Stock above 30 units
   - **⚡ LOW** (Yellow): Stock between 20-30 units
   - **⚠️ CRITICAL** (Red): Stock below 20 units

### Stock Updates Via API

```bash
PUT /api/admin/inventory/item
Content-Type: application/json
Authorization: Bearer {token}

{
  "category": "bases",
  "itemName": "Thin Crust",
  "quantity": 5  // positive to add, negative to reduce
}
```

### Automatic Stock Deduction

When a user places an order, stock is automatically deducted for:
- 1 Base
- 1 Sauce
- 1 Cheese
- Each vegetable selected (1 per veggie)
- Each meat selected (1 per meat)

## Order Status Management

### How to Update Order Status

1. **Go to Orders Tab**
   - Click on "📋 Orders" in admin dashboard

2. **Find the Order**
   - Search for customer name or order ID in order cards

3. **Change Status**
   - Click the status dropdown
   - Select new status:
     - 📥 Order Received
     - 🍳 In Kitchen
     - 🚚 Sent to Delivery

4. **Automatic User Notification**
   - User receives real-time update on their orders page
   - Status reflected with progress bar
   - Notification appears with status change

## Low Stock Notifications

### Automatic Triggers

**Scheduled Check** (Every Hour)
- Runs at minute 0 of every hour
- Checks all inventory items
- Sends email to admin if items below threshold (< 20)
- Broadcasts to all connected admin users

**On Order Placement**
- Immediately after order is created
- Checks all items for low stock
- Sends alert if any item goes below threshold

### Email Notification Format

```
Subject: ⚠️ Low Stock Alert - Pizza Delivery

Body:
The following inventory items are running low:
• bases: Thin Crust - Stock: 15/20
• sauces: Tomato - Stock: 18/20
...

Please restock these items as soon as possible.
```

### Socket Event Format

```javascript
// Low Stock Alert Event
{
  items: [
    {
      category: "bases",
      name: "Thin Crust",
      stock: 15
    },
    // ...
  ],
  timestamp: "2026-02-09T10:30:00Z"
}
```

## Real-time Features

### Admin Notifications
- ✨ New order alerts with customer name
- ⚠️ Low stock warnings with item details
- 📊 Daily inventory reports
- 🔔 Order status change confirmations

### User Notifications
- 📥 Order received confirmation
- 🍳 In Kitchen status update
- 🚚 Sent to Delivery status
- ✨ Live status notifications

## Database Schema

### Inventory Model
```javascript
{
  bases: [{ name: String, stock: Number }],
  sauces: [{ name: String, stock: Number }],
  cheeses: [{ name: String, stock: Number }],
  veggies: [{ name: String, stock: Number }],
  meats: [{ name: String, stock: Number }]
}
```

### Order Model
```javascript
{
  user: ObjectId,
  items: {
    base: String,
    sauce: String,
    cheese: String,
    veggies: [String],
    meats: [String]
  },
  price: Number,
  status: "Order Received" | "In Kitchen" | "Sent to Delivery",
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Admin Endpoints

**Get Inventory**
```
GET /api/admin/inventory
```

**Update Item Stock**
```
PUT /api/admin/inventory/item
Body: { category, itemName, quantity }
```

**Get All Orders**
```
GET /api/admin/orders
```

**Update Order Status**
```
PUT /api/admin/orders/{orderId}/status
Body: { status }
```

**Get Inventory Analytics**
```
GET /api/admin/inventory/analytics
```

## Environment Configuration

### Required Environment Variables
```
MONGO_URI=mongodb+srv://...
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=5000
```

### Email Setup
- Uses Gmail SMTP
- Requires app-specific password (not user password)
- Configure in Gmail Account Settings > App Passwords

## Troubleshooting

### Stock Not Updating
1. Check if admin user is authenticated
2. Verify Socket.io connection status (should show 🟢 Connected)
3. Check browser console for API errors
4. Ensure MongoDB connection is active

### Orders Not Appearing
1. Verify user is logged in
2. Check if Socket.io connection is established
3. Clear browser cache and refresh
4. Ensure order was created successfully

### Low Stock Alerts Not Sending
1. Verify EMAIL_USER and EMAIL_PASS in .env
2. Check Gmail app-specific password settings
3. Review server logs for email errors
4. Ensure MongoDB connection is active

## Scheduled Tasks

### Stock Check (Cron Job)
- **Schedule**: `0 * * * *` (Every hour at minute 0)
- **Action**: Checks all items below threshold, sends email to admin
- **Status**: Logs to console with ✅ or ⚠️

### Daily Report (Cron Job)
- **Schedule**: `0 8 * * *` (Every day at 8 AM)
- **Action**: Sends inventory summary to admins
- **Broadcast**: Socket event to all connected admin users

## Performance Considerations

- Real-time updates use Socket.io with room-based messaging
- Admin updates broadcast only to admin room
- User updates broadcast to specific user room
- Scheduled tasks run asynchronously without blocking requests
- Database queries optimized with indexed lookups

## Security

- All admin endpoints require `authMiddleware` + `adminAuth`
- User orders route requires authentication
- JWT token verification on all protected routes
- Email credentials stored in .env (never in code)
- Socket.io events validated before processing

## Future Enhancements

- Multiple warehouse support
- Inventory export/import functionality
- Automatic reordering system
- Inventory history and analytics
- Advanced reporting dashboard
- Bulk stock update operations
- Role-based access control for sub-admins
