import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api";
import { setProfileUsername } from "../hooks/useProfile.js";
import "../css/LoginContent.css";

function LoginContent() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (mode === "register" && password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await register(username, password);
      }
      setProfileUsername(username);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError(null);
    setPassword("");
    setConfirm("");
  };

  return (
    <main>
      <section className="login-section">
        <form className="login-card" onSubmit={handleSubmit}>
          <h1 className="login-title">Kurmi</h1>

          <div className="login-tabs">
            <button type="button" className={`login-tab ${mode === "login" ? "active" : ""}`} onClick={() => switchMode("login")}>Login</button>
            <button type="button" className={`login-tab ${mode === "register" ? "active" : ""}`} onClick={() => switchMode("register")}>Register</button>
          </div>

          <input
            className="login-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
          />
          {mode === "register" && (
            <input
              className="login-input"
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          )}

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" type="submit">
            {mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginContent;