const cron = require("node-cron");
const Inventory = require("../models/Inventory");
const User = require("../models/User");
const { sendLowStockAlert } = require("./mailer.js");

const THRESHOLD = 20;

// Schedule low stock check every hour
const scheduleStockCheck = (io) => {
  // Run every hour at the start of the hour
  cron.schedule("0 * * * *", async () => {
    console.log("🔔 Running scheduled low stock check...");
    await checkLowStockItems(io);
  });

  // Also run on startup for testing (uncomment to test immediately)
  // checkLowStockItems(io);

  console.log("📅 Stock check scheduler started (runs every hour at :00)");
};

// Check for low stock items and send alerts
const checkLowStockItems = async (io) => {
  try {
    const inventory = await Inventory.findOne();
    if (!inventory) {
      console.log("❌ No inventory found");
      return;
    }

    const lowStockItems = [];

    // Check all 5 categories
    const categories = ["bases", "sauces", "cheeses", "veggies", "meats"];
    for (const category of categories) {
      if (inventory[category] && Array.isArray(inventory[category])) {
        inventory[category].forEach(item => {
          if (item.stock < THRESHOLD) {
            lowStockItems.push({
              category,
              name: item.name,
              stock: item.stock,
              threshold: THRESHOLD
            });
          }
        });
      }
    }

    // If low stock items found, send alerts
    if (lowStockItems.length > 0) {
      console.log(`⚠️ Found ${lowStockItems.length} items below threshold`);

      // Get admin email (prioritize .env, then user DB, then default)
      const adminEmail = process.env.ADMIN_EMAIL || (await User.findOne({ isAdmin: true }))?.email || "admin@pizzadelivery.com";

      // Send email notification
      await sendLowStockAlert(adminEmail, lowStockItems);

      // Broadcast Socket.io alert to all admins
      if (io) {
        io.to("admin").emit("low_stock_alert", {
          items: lowStockItems,
          itemCount: lowStockItems.length,
          alertTime: new Date(),
          message: `${lowStockItems.length} items are below the threshold of ${THRESHOLD} units`
        });
        console.log("📢 Socket alert sent to admin room");
      }
    } else {
      console.log("✅ All inventory items are above threshold");
    }
  } catch (err) {
    console.error("❌ Error checking low stock:", err.message);
  }
};

// Schedule daily inventory report
const scheduleDailyReport = (io) => {
  // Run at 8 AM every day
  cron.schedule("0 8 * * *", async () => {
    console.log("📊 Running daily inventory report...");
    await generateInventoryReport(io);
  });

  console.log("📅 Daily report scheduler started (runs at 8 AM daily)");
};

// Generate daily inventory report
const generateInventoryReport = async (io) => {
  try {
    const inventory = await Inventory.findOne();
    if (!inventory) return;

    const report = {
      bases: inventory.bases?.reduce((sum, b) => sum + (b.stock || 0), 0) || 0,
      sauces: inventory.sauces?.reduce((sum, s) => sum + (s.stock || 0), 0) || 0,
      cheeses: inventory.cheeses?.reduce((sum, c) => sum + (c.stock || 0), 0) || 0,
      veggies: inventory.veggies?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0,
      meats: inventory.meats?.reduce((sum, m) => sum + (m.stock || 0), 0) || 0,
      timestamp: new Date()
    };

    const totalStock = Object.values(report).reduce((sum, val) => sum + (typeof val === "number" ? val : 0), 0);

    console.log("📊 Daily Inventory Report:");
    console.log("  Bases:", report.bases + " units");
    console.log("  Sauces:", report.sauces + " units");
    console.log("  Cheeses:", report.cheeses + " units");
    console.log("  Veggies:", report.veggies + " units");
    console.log("  Meats:", report.meats + " units");
    console.log("  TOTAL:", totalStock + " units");

    // Emit to admins
    if (io) {
      io.to("admin").emit("daily_inventory_report", {
        report,
        totalStock,
        timestamp: new Date()
      });
      console.log("📢 Daily report broadcasted to admins");
    }
  } catch (err) {
    console.error("❌ Error generating report:", err.message);
  }
};

module.exports = {
  scheduleStockCheck,
  scheduleDailyReport,
  checkLowStockItems,
  generateInventoryReport
};
