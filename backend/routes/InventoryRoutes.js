const router = require("express").Router();
const {
  getInventory,
  updateStock
} = require("../controllers/InventoryController.js");

const { auth, adminAuth } = require("../middleware/authMiddleware");

/*
Admin only - Requires authentication and admin privileges
*/
router.get("/", auth, adminAuth, getInventory);
router.put("/", auth, adminAuth, updateStock);

module.exports = router;
