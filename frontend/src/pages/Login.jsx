import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";   // ⭐ use axios instance
import "./Auth.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Notify the app that authentication state changed so protected routes can update.
      window.dispatchEvent(new Event("authChanged"));

      if (data.user.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Pizza Delivery Login</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter email"
            required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Enter password"
            required
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <button type="submit">Login</button>
        </form>

        <Link className="auth-link" to="/forgot">Forgot password?</Link>
        <Link className="auth-link" to="/register">
          Don’t have an account? <span>Register</span>
        </Link>
      </div>
    </div>
  );
}