// AdminDashboard.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  // ✅ Redirect if not logged in or not admin
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || !user || !user.isAdmin) {
      navigate("/"); // redirect to login
    }
  }, [navigate]);

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.clear(); // removes token & user safely
    navigate("/"); // redirect to login page
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-card">
        <h2>Admin Dashboard</h2>

        <div className="admin-actions">
          <button
            className="admin-btn orders-btn"
            onClick={() => navigate("/admin/orders")}
          >
             Manage Orders
          </button>

          <button
            className="admin-btn inventory-btn"
            onClick={() => navigate("/admin/inventory")}
          >
             Manage Inventory
          </button>

          <button
            className="admin-btn logout-btn"
            onClick={handleLogout}
          >
             Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;