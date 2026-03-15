import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { io } from "socket.io-client";
import "./UserOrders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  // Initialize Socket.io
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Get user ID from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.id) {
      newSocket.emit("user_join", user.id);
    }

    // Listen for order status changes
    newSocket.on("order_status_changed", (data) => {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === data.orderId
            ? { ...order, orderStatus: data.status }
            : order
        )
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await api.get("/order/my");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Cancel order
  const cancelOrder = async (id) => {
    const confirmCancel = window.confirm("Cancel this order?");
    if (!confirmCancel) return;

    try {
      const res = await api.post(`/order/cancel/${id}`);
      alert(res.data.message);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
    }
  };

  // Status color helper
  const getStatusClass = (status) => {
    switch (status) {
      case "received":
        return "status received";
      case "kitchen":
        return "status kitchen";
      case "delivery":
        return "status delivery";
      case "completed":
        return "status completed";
      case "cancelled":
        return "status cancelled";
      default:
        return "status";
    }
  };

  const getStatusEmoji = (status) => {
    const emojis = {
      received: "📦",
      kitchen: "🍳",
      delivery: "🚚",
      completed: "✅",
      cancelled: "❌"
    };
    return emojis[status] || "📋";
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h2>📋 My Orders</h2>
        <button onClick={() => navigate("/dashboard")}>⬅ Back</button>
      </div>

      {orders.length === 0 && (
        <div className="empty">
          <h3>No orders yet 😢</h3>
          <p>Start by ordering your favorite pizza!</p>
        </div>
      )}

      <div className="orders-grid">
        {orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="card-top">
              <span className="order-id">
                Order #{order._id.slice(-6).toUpperCase()}
              </span>
              <span className={getStatusClass(order.orderStatus)}>
                {getStatusEmoji(order.orderStatus)} {order.orderStatus.toUpperCase()}
              </span>
            </div>

            <div className="items">
              {order.items && order.items.map((item, i) => (
                <p key={i}>
                   {item.name} — ₹{item.price}
                </p>
              ))}
            </div>

            <div className="card-bottom">
              <div>
                <p className="price">₹{order.totalPrice}</p>
                <p className="date">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              {order.orderStatus === "received" && (
                <button
                  className="cancel-btn"
                  onClick={() => cancelOrder(order._id)}
                >
                  ❌ Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;
