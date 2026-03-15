import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Verify() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/auth/verify/${token}`)
      .then(res => res.text())
      .then(msg => {
        alert(msg);
        navigate("/"); // redirect to login
      })
      .catch(err => alert("Verification failed"));
  }, [token, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">✉️ Verifying Email</h2>
        <div style={{
          textAlign: "center",
          color: "#667eea",
          fontSize: "16px",
          marginTop: "20px",
          fontWeight: "500"
        }}>
          Please wait while we verify your email address...
        </div>
        <div style={{
          textAlign: "center",
          marginTop: "30px",
          animation: "spin 1s linear infinite"
        }}>
          ⏳
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

