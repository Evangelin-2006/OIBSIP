/*************************************************
 SERVER ENTRY
*************************************************/

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");



/* ========= ROUTES ========= */
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const pizzaRoutes = require("./routes/pizzaRoutes");
const inventoryRoutes = require("./routes/InventoryRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
/* ========= SCHEDULERS ========= */
const {
  scheduleStockCheck,
  scheduleDailyReport,
} = require("./utils/scheduler");

/* ========= EMAIL VERIFY (IMPORTANT FIX) ========= */
const { verifyEmailServer } = require("./utils/mailer");


/*************************************************
 EXPRESS + SOCKET SETUP
*************************************************/

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH"],
  },
});

app.use(cors());
app.use(express.json());

/* make socket accessible inside routes */
app.io = io;


/*************************************************
 SOCKET.IO EVENTS
*************************************************/

io.on("connection", (socket) => {
  console.log("[INFO] User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("[INFO] User disconnected:", socket.id);
  });

  socket.on("admin_join", () => {
    socket.join("admin");
    console.log("[INFO] Admin joined room");
  });

  socket.on("user_join", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`[INFO] User ${userId} joined personal room`);
  });
});


/*************************************************
 ROUTES
*************************************************/

app.use("/api/auth", authRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pizza", pizzaRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/payment", paymentRoutes);

/*************************************************
 DATABASE + STARTUP
*************************************************/

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("[SUCCESS] MongoDB connected");


    /***************
     INIT INVENTORY
    ****************/
    const Inventory = require("./models/Inventory");

    let inv = await Inventory.findOne();

    if (!inv) {
      console.log("[INFO] Initializing inventory...");

      await Inventory.create({
        bases: [
          { name: "Thin Crust", stock: 100 },
          { name: "Regular Crust", stock: 100 },
          { name: "Thick Crust", stock: 100 },
        ],
        sauces: [
          { name: "Tomato", stock: 100 },
          { name: "White Sauce", stock: 100 },
          { name: "Pesto", stock: 100 },
        ],
        cheeses: [
          { name: "Mozzarella", stock: 100 },
          { name: "Cheddar", stock: 100 },
          { name: "Parmesan", stock: 100 },
        ],
        veggies: [
          { name: "Onion", stock: 100 },
          { name: "Bell Pepper", stock: 100 },
          { name: "Mushroom", stock: 100 },
          { name: "Olives", stock: 100 },
          { name: "Tomato", stock: 100 },
        ],
        meats: [
          { name: "Chicken", stock: 100 },
          { name: "Beef", stock: 100 },
          { name: "Pepperoni", stock: 100 },
          { name: "Ham", stock: 100 },
        ],
      });

      console.log("[SUCCESS] Inventory initialized");
    } else {
      console.log("[INFO] Inventory already exists");
    }


    /***************
     ✅ EMAIL VERIFY ONCE (CRITICAL FIX)
    ****************/
    verifyEmailServer();


    /***************
     START SCHEDULERS
    ****************/
    scheduleStockCheck(io);
    scheduleDailyReport(io);


    console.log("[SUCCESS] Server fully ready");
  })
  .catch((err) => {
    console.error("[ERROR] MongoDB connection failed:", err.message);
  });


/*************************************************
 START SERVER
*************************************************/

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
