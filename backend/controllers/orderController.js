const { deductStock } = require("../controllers/InventoryController");
const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const User = require("../models/User");
const { sendLowStockMail, sendLowStockAlert } = require("../utils/mailer");


// ============================================
// CREATE ORDER + DEDUCT STOCK + EMAIL ALERT
// ============================================
exports.createOrder = async (req, res) => {
  try {
    const { items, totalPrice, paymentId } = req.body;

    console.log("[INFO] Creating order:", items);
    console.log("[INFO] User:", req.user);

    const order = await Order.create({
      userId: req.user.id,
      items,
      totalPrice,
      paymentStatus: "paid",
      orderStatus: "received",
      paymentId,
    });

    /* =========================
       SAFE STOCK DEDUCTION
    ========================= */
    let inventory = null;
    try {
      inventory = await deductStock(items);
    } catch (e) {
      console.log("[WARNING] deductStock failed:", e.message);
    }

    /* =========================
       SEND LOW STOCK ALERTS
    ========================= */
    if (inventory) {
      try {
        const lowItems = [];
        const categories = ['bases','sauces','cheeses','veggies','meats'];
        const THRESHOLD = 20;

        for (const cat of categories) {
          for (const item of inventory[cat] || []) {
            if (item.stock < THRESHOLD) {
              lowItems.push({
                category: cat,
                name: item.name,
                stock: item.stock,
                threshold: THRESHOLD
              });
            }
          }
        }

        if (lowItems.length > 0) {
          // Get admin email (prioritize .env, then user DB, then default)
          const adminEmail = process.env.ADMIN_EMAIL || (await User.findOne({ isAdmin: true }))?.email || "admin@pizzadelivery.com";
          
          // Send email to admin
          await sendLowStockAlert(adminEmail, lowItems);
          console.log(`[INFO] Low stock alert: ${lowItems.length} items below threshold`);
        }

      } catch (e) {
        console.log("[WARNING] Email notification failed but order continues:", e.message);
      }
    }

    res.json({ success: true, order });

  } catch (err) {
    console.error("[ERROR] ORDER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


// ============================================
// CANCEL ORDER + RESTORE STOCK
// ============================================
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.orderStatus !== "received")
      return res.status(400).json({ message: "Cannot cancel. Order already in process" });

    const inv = await Inventory.findOne();

    if (inv && order.items) {
      const categories = ['bases','sauces','cheeses','veggies','meats'];

      for (const item of order.items) {
        const qty = item.quantity || 1;

        for (const category of categories) {
          const found = inv[category]?.find(i => i.name === item.name);
          if (found) {
            found.stock += qty;
            break;
          }
        }
      }

      await inv.save();
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ============================================
// GET USER ORDERS
// ============================================
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};



// ============================================
// GET ALL ORDERS (ADMIN)
// ============================================
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};



// ============================================
// UPDATE ORDER STATUS (ADMIN)
// ============================================
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { returnDocument: 'after' }
    ).populate("userId", "name email");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.app.io) {
      if (updatedOrder.userId) {
        req.app.io.to(`user_${updatedOrder.userId._id}`).emit("order_status_changed", {
          orderId: updatedOrder._id,
          status: updatedOrder.orderStatus,
        });
      }

      req.app.io.to("admin").emit("order_status_updated", updatedOrder);
    }

    res.json(updatedOrder);

  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
