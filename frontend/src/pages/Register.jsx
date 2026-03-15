import { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          // ❌ Don't send isAdmin from frontend
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        alert(data.message); // e.g., "Check your email to verify your account"
        setForm({ name: "", email: "", password: "", confirm: "" });
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
      alert("Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            placeholder="Full Name"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            required
            value={form.confirm}
            onChange={e => setForm({ ...form, confirm: e.target.value })}
          />

          {/* ❌ Removed Admin checkbox */}
          <button type="submit">Create Account</button>
        </form>
        <Link className="auth-link" to="/">Already registered? <span>Login</span></Link>
      </div>
    </div>
  );
}