const router = require("express").Router();
const { auth } = require("../middleware/authMiddleware");
const { getPizzaOptions } = require("../controllers/pizzaController");
const { getAllPizzas } = require("../controllers/pizzaController");

router.get("/", getAllPizzas);
router.get("/options", auth, getPizzaOptions);

module.exports = router;



