const Inventory = require("../models/Inventory");
const THRESHOLD = 20;

/*
================================
GET INVENTORY
================================
*/
exports.getInventory = async (req, res) => {
  try {
    let inv = await Inventory.findOne();
    
    // Initialize if doesn't exist
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

    // Calculate low stock items
    const lowStockItems = [];
    const categories = ["bases", "sauces", "cheeses", "veggies", "meats"];

    categories.forEach(cat => {
      if (inv[cat]) {
        inv[cat].forEach(item => {
          if (item.stock < THRESHOLD) {
            lowStockItems.push({
              category: cat,
              name: item.name,
              stock: item.stock,
              threshold: THRESHOLD
            });
          }
        });
      }
    });

    res.json({
      success: true,
      inventory: inv,
      lowStockItems,
      threshold: THRESHOLD
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*
================================
UPDATE STOCK (ADMIN)
================================
*/
exports.updateStock = async (req, res) => {
  try {
    const { category, name, quantity } = req.body;

    let inv = await Inventory.findOne();

    if (!inv) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    if (!inv[category]) {
      return res.status(404).json({ message: "Category not found" });
    }

    const item = inv[category].find((i) => i.name === name);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.stock = Math.max(0, quantity);

    await inv.save();

    // Emit real-time update if Socket.io is available
    if (req.app.io) {
      req.app.io.to("admin").emit("inventory_updated", {
        category,
        item,
        timestamp: new Date()
      });
    }

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*
================================
DEDUCT STOCK AFTER ORDER
================================
*/
exports.deductStock = async (items) => {
  try {
    const inv = await Inventory.findOne();
    if (!inv) return null;

    const categories = ['bases','sauces','cheeses','veggies','meats'];

    for (const orderItem of items) {
      const qty = orderItem.quantity || 1;

      for (const category of categories) {
        const found = inv[category]?.find(i =>
          i.name.toLowerCase().includes(orderItem.name.toLowerCase())
        );

        if (found) {
          const oldStock = found.stock;
          found.stock = Math.max(0, found.stock - qty);

          console.log(`✅ ${found.name}: ${oldStock} → ${found.stock}`);
          break;
        }
      }
    }

    await inv.save();
    return inv;

  } catch (err) {
    console.error(err);
    return null;
  }
};
