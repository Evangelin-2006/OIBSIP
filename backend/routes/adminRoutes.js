const router = require("express").Router();
const { auth, adminAuth } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");
const { checkLowStockItems } = require("../utils/scheduler");

// Initialize inventory on startup
router.get("/init", auth, adminAuth, async (req, res) => {
  try {
    const inv = await adminController.initializeInventory();
    res.json({ success: true, message: "Inventory initialized", inventory: inv });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Force reset inventory (delete and recreate)
router.get("/reset-inventory", auth, adminAuth, async (req, res) => {
  try {
    const Inventory = require("../models/Inventory");
    await Inventory.deleteMany({});
    const inv = await adminController.initializeInventory();
    res.json({ success: true, message: "Inventory reset successfully", inventory: inv });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Test low stock alerts (manually trigger)
router.get("/test-low-stock-alert", auth, adminAuth, async (req, res) => {
  try {
    await checkLowStockItems(req.app.io);
    res.json({ success: true, message: "Low stock check triggered. Check console/email." });
  } catch (err) {
    res.status(500).json({ message: "Error triggering alert: " + err.message });
  }
});

// -------------------- INVENTORY --------------------
// GET inventory with low stock alerts
router.get("/inventory", auth, adminAuth, adminController.getInventory);

// GET inventory analytics
router.get("/inventory/analytics", auth, adminAuth, adminController.getInventoryAnalytics);

// UPDATE entire inventory
router.put("/inventory", auth, adminAuth, adminController.updateInventory);

// UPDATE specific item stock
router.put("/inventory/item", auth, adminAuth, adminController.updateItemStock);

// ADD new inventory item
router.post("/inventory/item", auth, adminAuth, adminController.addInventoryItem);

// -------------------- ORDERS --------------------
// Get all orders
router.get("/orders", auth, adminAuth, adminController.getOrders);

// Update order status
router.put("/orders/:id/status", auth, adminAuth, adminController.updateOrderStatus);

module.exports = router;
