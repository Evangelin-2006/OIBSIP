import { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

function Forgot() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      alert(data.message); // show success or error message
    } catch (err) {
      alert("Error sending reset link");
      console.error(err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title"> Reset Password</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your registered email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit">Send Reset Link</button>
        </form>

        <Link className="auth-link" to="/">
          ← Back to <span>Login</span>
        </Link>
      </div>
    </div>
  );
}

export default Forgot;
