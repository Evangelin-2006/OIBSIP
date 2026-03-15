const Inventory = require("../models/Inventory");

exports.getPizzaOptions = async (req, res) => {
    try {
        const inventory = await Inventory.findOne();
        res.json(inventory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const Pizza = require("../models/pizza");

exports.getAllPizzas = async (req, res) => {
  const pizzas = await Pizza.find();
  res.json(pizzas);
};
