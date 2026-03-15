import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { io } from "socket.io-client";
import "./AdminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  const navigate = useNavigate();

  // Initialize Socket.io
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.emit("admin_join");

    // Listen for order updates
    newSocket.on("order_status_changed", (updatedOrder) => {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    // Listen for new orders
    newSocket.on("new_order", (newOrder) => {
      setOrders(prevOrders => [newOrder, ...prevOrders]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/order/all");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order status
  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/order/status/${orderId}`, { 
        status: newStatus 
      });
      
      // Update UI immediately
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId 
            ? { ...order, orderStatus: newStatus }
            : order
        )
      );

      // Notify user in real-time
      if (socket) {
        socket.emit("order_status_updated", {
          orderId,
          status: newStatus,
          userId: res.data.userId
        });
      }
    } catch (err) {
      alert("Failed to update order status: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  const statusOptions = ["kitchen", "delivery", "completed"];
  const statusColors = {
    received: "#ffc107",
    kitchen: "#ff9800",
    delivery: "#2196F3",
    completed: "#4CAF50",
    cancelled: "#f44336"
  };

  // Hide completed/cancelled automatically
  const activeOrders = orders.filter(
    order => !["completed", "cancelled"].includes(order.orderStatus)
  );

  return (
    <div className="admin-orders-page">
      <div className="header">
        <h2> Admin Orders Management</h2>
        <button className="back-btn" onClick={() => navigate("/admin")}>
          ⬅ Back to Dashboard
        </button>
      </div>

      {loading && <p className="loading">Loading orders...</p>}

      {!loading && activeOrders.length === 0 && (
        <div className="empty-state">
          <h3> No Active Orders</h3>
          <p>New customer orders will appear here automatically.</p>
        </div>
      )}

      {!loading && activeOrders.length > 0 && (
        <div className="orders-grid">
          {activeOrders.map(order => (
            <div key={order._id} className="order-card">
              <div className="card-header">
                <h4>Order #{order._id.slice(-6).toUpperCase()}</h4>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: statusColors[order.orderStatus] }}
                >
                  {order.orderStatus.toUpperCase()}
                </span>
              </div>

              <div className="card-content">
                <p>
                  <b>Customer:</b> {order.userId?.name || "Unknown"}
                </p>
                <p>
                  <b>Email:</b> {order.userId?.email || "N/A"}
                </p>

                <div className="items-section">
                  <b>Items:</b>
                  {order.items && order.items.map((item, i) => (
                    <div key={i} className="item-row">
                      <span> {item.name}</span>
                      <span>₹{item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="total-section">
                  <b>Total:</b>
                  <span className="total-price">₹{order.totalPrice}</span>
                </div>
              </div>

              <div className="card-actions">
                {statusOptions
                  .filter(status => status !== order.orderStatus)
                  .map(status => (
                    <button 
                      key={status}
                      className="action-btn"
                      onClick={() => updateStatus(order._id, status)}
                    >
                      {status === "kitchen" ? "🍳" : status === "delivery" ? "🚚" : "✅"} 
                      {" "}{status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
