import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Dashboard() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  //  Pizza list
  const pizzas = [
    { id: 1, name: "Margherita", price: 199, category: "Veg", img: "https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg" },
    { id: 2, name: "Farmhouse", price: 249, category: "Veg", img: "https://images.pexels.com/photos/1435907/pexels-photo-1435907.jpeg" },
    { id: 3, name: "Veg Supreme", price: 269, category: "Veg", img: "https://images.pexels.com/photos/2619967/pexels-photo-2619967.jpeg" },
    { id: 4, name: "Pepperoni", price: 299, category: "Non-Veg", img: "https://images.pexels.com/photos/4109084/pexels-photo-4109084.jpeg" },
    { id: 5, name: "Chicken Tikka", price: 329, category: "Non-Veg", img: "https://images.pexels.com/photos/845811/pexels-photo-845811.jpeg" },
    { id: 6, name: "Cheese Burst", price: 279, category: "Cheese", img: "https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg" },
    { id: 7, name: "Double Cheese", price: 309, category: "Cheese", img: "https://images.pexels.com/photos/1049626/pexels-photo-1049626.jpeg" },
    { id: 8, name: "Buy 1 Get 1", price: 349, category: "Offers", img: "https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg" }
  ];

  //  Ingredients mapping
  const pizzaIngredients = {
    "Margherita": [
      { name: "Regular Crust", price: 40, quantity: 1 },
      { name: "Tomato", price: 30, quantity: 1 },
      { name: "Mozzarella", price: 40, quantity: 1 }
    ],
    "Farmhouse": [
      { name: "Regular Crust", price: 40, quantity: 1 },
      { name: "Tomato", price: 30, quantity: 1 },
      { name: "Mozzarella", price: 40, quantity: 1 },
      { name: "Onion", price: 15, quantity: 1 },
      { name: "Bell Pepper", price: 15, quantity: 1 },
      { name: "Mushroom", price: 15, quantity: 1 }
    ],
    "Veg Supreme": [
      { name: "Regular Crust", price: 40, quantity: 1 },
      { name: "Tomato", price: 30, quantity: 1 },
      { name: "Mozzarella", price: 40, quantity: 1 },
      { name: "Onion", price: 15, quantity: 1 },
      { name: "Bell Pepper", price: 15, quantity: 1 },
      { name: "Mushroom", price: 15, quantity: 1 },
      { name: "Olives", price: 15, quantity: 1 }
    ],
    "Pepperoni": [
      { name: "Regular Crust", price: 40, quantity: 1 },
      { name: "Tomato", price: 30, quantity: 1 },
      { name: "Mozzarella", price: 40, quantity: 1 },
      { name: "Pepperoni", price: 30, quantity: 1 }
    ],
    "Chicken Tikka": [
      { name: "Regular Crust", price: 40, quantity: 1 },
      { name: "White Sauce", price: 30, quantity: 1 },
      { name: "Mozzarella", price: 40, quantity: 1 },
      { name: "Chicken", price: 30, quantity: 1 }
    ]
  };

  //  Filter pizzas
  const filteredPizzas =
    category === "All"
      ? pizzas
      : pizzas.filter((p) => p.category === category);

  //  Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  //  ORDER + PAYMENT
  const handleOrder = async (pizza) => {
    try {

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Refresh page.");
        return;
      }

      if (!token) {
        alert("Please login first");
        navigate("/");
        return;
      }

      const confirmPay = window.confirm(`Proceed to pay ₹${pizza.price}?`);
      if (!confirmPay) return;

      // 1️⃣ CREATE ORDER
      const orderRes = await fetch(
        "http://localhost:5000/api/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: pizza.price })
        }
      );

      const orderData = await orderRes.json();

      if (!orderData.id) {
        alert("Payment initialization failed");
        return;
      }

      // 2️⃣ RAZORPAY OPTIONS
      const options = {
        key: "rzp_test_SRBwmKWH9HuBNZ", 
        amount: orderData.amount,
        currency: "INR",
        order_id: orderData.id,
        name: "Pizza Delivery",
        description: pizza.name,

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "9000000000"
        },

        theme: {
          color: "#ff4d4d"
        },

        modal: {
          ondismiss: function () {
            console.log("Payment popup closed");
          }
        },

        handler: async function (response) {

          // 3️⃣ SAVE ORDER
          const res = await fetch(
            "http://localhost:5000/api/order/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                items: pizzaIngredients[pizza.name] || [
                  { name: pizza.name, price: pizza.price, quantity: 1 }
                ],
                totalPrice: pizza.price,
                paymentId: response.razorpay_payment_id
              })
            }
          );

          const data = await res.json();

          if (data.success) {
            alert("✅ Payment Successful & Order Placed!");
            navigate("/orders");
          } else {
            alert("Order save failed");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong");
    }
  };

  return (
    <div className="dashboard">

      {/* HEADER */}
      <div className="header">
        <h2 className="logo"> Pizza Delivery</h2>

        <div className="header-buttons">
          <span className="user-greeting">👤 {user?.name || "User"}</span>

          <button
            onClick={() => navigate("/orders")}
            className="orders-btn"
          >
            My Orders
          </button>

          {user?.isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              className="admin-btn"
            >
              Admin
            </button>
          )}

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="top-actions">
        {["All", "Veg", "Non-Veg", "Cheese", "Offers"].map((cat) => (
          <button
            key={cat}
            className={category === cat ? "active" : ""}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}

        <button
          className="custom-btn"
          onClick={() => navigate("/customize")}
        >
          Customize Pizza
        </button>
      </div>

      {/* PIZZAS */}
      <div className="pizza-grid">
        {filteredPizzas.map((pizza) => (
          <div key={pizza.id} className="pizza-card">

            <img src={pizza.img} alt={pizza.name} />

            <div className="pizza-info">
              <h3>{pizza.name}</h3>
              <p className="category-badge">{pizza.category}</p>
              <p className="price">₹{pizza.price}</p>
            </div>

            <button
              onClick={() => handleOrder(pizza)}
              className="order-btn-card"
            >
              Order Now
            </button>

          </div>
        ))}
      </div>

    </div>
  );
}

export default Dashboard;