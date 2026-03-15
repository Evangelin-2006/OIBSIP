const Inventory = require("../models/Inventory");
const Order = require("../models/Order");
const User = require("../models/User");
const { lowStockAlert } = require("../utils/mailer.js");

const THRESHOLD = 20;

// Initialize inventory with default items
exports.initializeInventory = async () => {
  let inv = await Inventory.findOne();

  if (!inv) {
    inv = await Inventory.create({
      bases: [
        { name: "Thin Crust", stock: 100 },
        { name: "Regular Crust", stock: 100 },
        { name: "Thick Crust", stock: 100 }
      ],
      sauces: [
        { name: "Tomato", stock: 100 },
        { name: "White Sauce", stock: 100 },
        { name: "Pesto", stock: 100 }
      ],
      cheeses: [
        { name: "Mozzarella", stock: 100 },
        { name: "Cheddar", stock: 100 },
        { name: "Parmesan", stock: 100 }
      ],
      veggies: [
        { name: "Onion", stock: 100 },
        { name: "Bell Pepper", stock: 100 },
        { name: "Mushroom", stock: 100 },
        { name: "Olives", stock: 100 },
        { name: "Tomato", stock: 100 }
      ],
      meats: [
        { name: "Chicken", stock: 100 },
        { name: "Beef", stock: 100 },
        { name: "Pepperoni", stock: 100 },
        { name: "Ham", stock: 100 }
      ]
    });
  }

  return inv;
};

// Get inventory
exports.getInventory = async (req, res) => {
  let inv = await Inventory.findOne();

  if (!inv) {
    inv = await exports.initializeInventory();
  }

  // Calculate low stock items and alerts
  const lowStockItems = [];
  const categories = ["bases", "sauces", "cheeses", "veggies", "meats"];

  categories.forEach(cat => {
    inv[cat].forEach(item => {
      if (item.stock < THRESHOLD) {
        lowStockItems.push({
          category: cat,
          name: item.name,
          stock: item.stock,
          alert: true
        });
      }
    });
  });

  res.json({
    inventory: inv,
    lowStockItems,
    threshold: THRESHOLD
  });
};

// Update entire inventory
exports.updateInventory = async (req, res) => {
  try {
    const inv = await Inventory.findOneAndUpdate({}, req.body, { returnDocument: 'after' });
    res.json(inv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update specific item stock
exports.updateItemStock = async (req, res) => {
  try {
    console.log("📥 Backend received update request:", req.body);
    
    const { category, itemName, quantity } = req.body;
    console.log("Extracted:", { category, itemName, quantity });
    
    const inv = await Inventory.findOne();
    console.log("Inventory doc found:", !!inv);

    if (!inv) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    console.log("Items in category:", inv[category]);
    const item = inv[category]?.find(i => i.name === itemName);
    
    if (!item) {
      console.log("Item not found:", { category, itemName });
      return res.status(404).json({ message: "Item not found" });
    }

    console.log("Found item:", item);
    const oldStock = item.stock;
    item.stock += quantity;
    if (item.stock < 0) item.stock = 0;

    await inv.save();
    console.log(`✅ Stock updated: ${itemName} from ${oldStock} to ${item.stock}`);
    
    // Emit socket event if stock is low
    if (item.stock < THRESHOLD && req.app.io) {
      req.app.io.to("admin").emit("low_stock_alert", {
        category,
        itemName,
        stock: item.stock,
        threshold: THRESHOLD,
        timestamp: new Date()
      });
    }

    res.json({ success: true, item });
  } catch (err) {
    console.error("❌ Error in updateItemStock:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Reduce stock after order (called from orderController)
exports.reduceStockAfterOrder = async (items) => {
  try {
    const inv = await Inventory.findOne();
    if (!inv) return null;

    // Deduct base
    if (items.base) {
      const base = inv.bases.find(b => b.name === items.base);
      if (base) base.stock = Math.max(0, base.stock - 1);
    }

    // Deduct sauce
    if (items.sauce) {
      const sauce = inv.sauces.find(s => s.name === items.sauce);
      if (sauce) sauce.stock = Math.max(0, sauce.stock - 1);
    }

    // Deduct cheese
    if (items.cheese) {
      const cheese = inv.cheeses.find(c => c.name === items.cheese);
      if (cheese) cheese.stock = Math.max(0, cheese.stock - 1);
    }

    // Deduct veggies
    if (items.veggies && Array.isArray(items.veggies)) {
      items.veggies.forEach(v => {
        const veggie = inv.veggies.find(vg => vg.name === v);
        if (veggie) veggie.stock = Math.max(0, veggie.stock - 1);
      });
    }

    // Deduct meats
    if (items.meats && Array.isArray(items.meats)) {
      items.meats.forEach(m => {
        const meat = inv.meats.find(mt => mt.name === m);
        if (meat) meat.stock = Math.max(0, meat.stock - 1);
      });
    }

    await inv.save();
    return inv;
  } catch (err) {
    console.error("Error reducing stock:", err);
    return null;
  }
};

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    // Emit socket event to user about status update
    if (req.app.io) {
      req.app.io.to(`user_${order.user}`).emit("order_status_updated", {
        orderId: order._id,
        status: order.status,
        timestamp: new Date()
      });

      // Also broadcast to admin room
      req.app.io.to("admin").emit("order_status_changed", {
        orderId: order._id,
        status: order.status,
        timestamp: new Date()
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check low stock and send alerts
exports.checkLowStock = async (io, adminEmail) => {
  try {
    const inv = await Inventory.findOne();
    if (!inv) return;

    const lowStockItems = [];

    for (const type of ["bases", "sauces", "cheeses", "veggies", "meats"]) {
      for (const item of inv[type]) {
        if (item.stock < THRESHOLD) {
          lowStockItems.push({
            category: type,
            name: item.name,
            stock: item.stock
          });
        }
      }
    }

    if (lowStockItems.length > 0) {
      // Send email to admin
      if (adminEmail) {
        const itemList = lowStockItems
          .map(item => `${item.category}: ${item.name} - ${item.stock} remaining`)
          .join("\n");
        
        await lowStockAlert(adminEmail, itemList);
      }

      // Emit socket event to admins
      if (io) {
        io.to("admin").emit("low_stock_alert", {
          items: lowStockItems,
          timestamp: new Date()
        });
      }
    }

    return lowStockItems;
  } catch (err) {
    console.error("Error checking low stock:", err);
  }
};

// Add new inventory item
exports.addInventoryItem = async (req, res) => {
  try {
    const { category, itemName, initialStock } = req.body;
    const inv = await Inventory.findOne();

    if (!inv) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    if (!inv[category]) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Check if item already exists
    const existing = inv[category].find(i => i.name === itemName);
    if (existing) {
      return res.status(400).json({ message: "Item already exists" });
    }

    inv[category].push({ name: itemName, stock: initialStock || 50 });
    await inv.save();

    res.json({ success: true, inventory: inv });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get inventory analytics
exports.getInventoryAnalytics = async (req, res) => {
  try {
    const inv = await Inventory.findOne();
    if (!inv) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    const analytics = {
      bases: {
        total: inv.bases.reduce((sum, b) => sum + b.stock, 0),
        items: inv.bases
      },
      sauces: {
        total: inv.sauces.reduce((sum, s) => sum + s.stock, 0),
        items: inv.sauces
      },
      cheeses: {
        total: inv.cheeses.reduce((sum, c) => sum + c.stock, 0),
        items: inv.cheeses
      },
      veggies: {
        total: inv.veggies.reduce((sum, v) => sum + v.stock, 0),
        items: inv.veggies
      },
      meats: {
        total: inv.meats.reduce((sum, m) => sum + m.stock, 0),
        items: inv.meats
      }
    };

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
