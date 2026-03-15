import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Forgot from "./pages/Forgot";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import PizzaBuilder from "./pages/PizzaBuilder";
import UserOrders from "./pages/UserOrders";
import Verify from "./pages/Verify";
import ResetPassword from "./pages/ResetPassword";
import AdminOrders from "./pages/AdminOrders";
import AdminInventory from "./pages/AdminInventory";

function App() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  useEffect(() => {
    const onAuthChanged = () => {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    };

    window.addEventListener("authChanged", onAuthChanged);
    return () => window.removeEventListener("authChanged", onAuthChanged);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/verify/:token" element={<Verify />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />

        <Route
          path="/customize"
          element={user ? <PizzaBuilder /> : <Navigate to="/" />}
        />

        <Route
          path="/orders"
          element={user ? <UserOrders /> : <Navigate to="/" />}
        />

        <Route
          path="/admin"
          element={user?.isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
        />

        <Route
          path="/admin/orders"
          element={user?.isAdmin ? <AdminOrders /> : <Navigate to="/" />}
        />

        <Route
          path="/admin/inventory"
          element={user?.isAdmin ? <AdminInventory /> : <Navigate to="/" />}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;