import cron from "node-cron";
import Inventory from "../models/Inventory.js";
import { sendLowStockMail } from "./mailer.js";

/*
Runs every 5 minutes
*/
cron.schedule("*/5 * * * *", async () => {
  console.log("Checking stock...");

  const all = await Inventory.find();

  let lowItems = [];

  all.forEach((cat) => {
    cat.items.forEach((item) => {
      if (item.quantity <= item.threshold) {
        lowItems.push(
          `${cat.category.toUpperCase()} - ${item.name} → ${item.quantity} left`
        );
      }
    });
  });

  if (lowItems.length > 0) {
    await sendLowStockMail(lowItems);
    console.log("Low stock email sent");
  }
});
