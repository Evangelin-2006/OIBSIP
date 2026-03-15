import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PizzaBuilder.css";

export default function PizzaBuilder() {
  const navigate = useNavigate();

  const [base, setBase] = useState("");
  const [sauce, setSauce] = useState("");
  const [cheese, setCheese] = useState("");
  const [veggies, setVeggies] = useState([]);

  const veggieOptions = ["Onion", "Bell Pepper", "Mushroom", "Olives", "Tomato"];

  // 🎯 toggle veggies
  const toggleVeggie = (veg) => {
    if (veggies.includes(veg)) {
      setVeggies(veggies.filter((v) => v !== veg));
    } else {
      setVeggies([...veggies, veg]);
    }
  };

  // 💰 price calculator
  const calculatePrice = () => {
    let price = 150; // base price

    price += 40; // base
    price += 30; // sauce
    price += 40; // cheese
    price += veggies.length * 15;

    return price;
  };

  const handleOrder = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      navigate("/");
      return;
    }

    if (!base || !sauce || !cheese) {
      alert("Please select base, sauce, and cheese!");
      return;
    }

    const totalPrice = calculatePrice();

    const confirmPay = window.confirm(
      `Total Price ₹${totalPrice}\nProceed to payment?`
    );
    if (!confirmPay) return;

    // ================= CREATE RAZORPAY ORDER =================
    const orderRes = await fetch("http://localhost:5000/api/payment/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: totalPrice }), // send the totalPrice dynamically
    });

    const orderData = await orderRes.json();
    if (!orderData.id) {
      alert("Payment initialization failed");
      return;
    }

    // ================= RAZORPAY OPTIONS =================
    const options = {
      key: "rzp_test_SRBwmKWH9HuBNZ", 
      amount: orderData.amount,
      currency: "INR",
      order_id: orderData.id,
      name: "Pizza Delivery",
      description: "Custom Pizza",

      prefill: {
        name: JSON.parse(localStorage.getItem("user"))?.name || "",
        email: JSON.parse(localStorage.getItem("user"))?.email || "",
        contact: JSON.parse(localStorage.getItem("user"))?.phone || "9000000000",
      },

      theme: { color: "#ff4d4d" },

      handler: async function (response) {
        // ================= SAVE ORDER AFTER PAYMENT SUCCESS =================
        const res = await fetch("http://localhost:5000/api/order/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: [
              { name: base, price: 40, quantity: 1 },
              { name: sauce, price: 30, quantity: 1 },
              { name: cheese, price: 40, quantity: 1 },
              ...veggies.map((v) => ({ name: v, price: 15, quantity: 1 })),
            ],
            totalPrice,
            paymentId: response.razorpay_payment_id,
          }),
        });

        const data = await res.json();
        if (data.success) {
          alert("✅ Payment Successful & Custom Pizza Ordered!");
          navigate("/orders");
        } else {
          alert("❌ Order save failed");
        }
      },

      modal: {
        ondismiss: function () {
          console.log("Payment popup closed");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error(err);
    alert("❌ Something went wrong with payment");
  }
};

  return (
    <div className="pizza-builder-container">
      <h2> Build Your Pizza</h2>

      {/* Base */}
      <div className="pizza-section">
        <label>Choose Base:</label>
        <select value={base} onChange={(e) => setBase(e.target.value)}>
          <option value="">--Select Base--</option>
          <option>Thin Crust</option>
          <option>Regular Crust</option>
          <option>Thick Crust</option>
        </select>
      </div>

      {/* Sauce */}
      <div className="pizza-section">
        <label>Choose Sauce:</label>
        <select value={sauce} onChange={(e) => setSauce(e.target.value)}>
          <option value="">--Select Sauce--</option>
          <option>Tomato</option>
          <option>White Sauce</option>
          <option>Pesto</option>
        </select>
      </div>

      {/* Cheese */}
      <div className="pizza-section">
        <label>Choose Cheese:</label>
        <select value={cheese} onChange={(e) => setCheese(e.target.value)}>
          <option value="">--Select Cheese--</option>
          <option>Mozzarella</option>
          <option>Cheddar</option>
          <option>Parmesan</option>
        </select>
      </div>

      {/* Veggies */}
      <div className="pizza-section">
        <label>Choose Veggies:</label>
        <div className="veggie-options">
          {veggieOptions.map((veg) => (
            <label key={veg}>
              <input
                type="checkbox"
                checked={veggies.includes(veg)}
                onChange={() => toggleVeggie(veg)}
              />
              {veg}
            </label>
          ))}
        </div>
      </div>

      {/* Price Preview */}
      <h3 className="price-preview">Total: ₹{calculatePrice()}</h3>

      <button className="checkout-btn" onClick={handleOrder}>
        Proceed to Checkout
      </button>
    </div>
  );
}
