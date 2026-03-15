const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stock: { type: Number, default: 100 }
});

const inventorySchema = new mongoose.Schema(
  {
    bases: [itemSchema],
    sauces: [itemSchema],
    cheeses: [itemSchema],
    veggies: [itemSchema],
    meats: [itemSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
