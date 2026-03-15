const router = require("express").Router();
const { auth, adminAuth } = require("../middleware/authMiddleware");
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateStatus,
  cancelOrder,
} = require("../controllers/orderController");

router.post("/create", auth, createOrder);
router.get("/my", auth, getUserOrders);
router.post("/cancel/:id", auth, cancelOrder);

router.get("/all", adminAuth, getAllOrders);
router.patch("/status/:id", adminAuth, updateStatus);

module.exports = router;
