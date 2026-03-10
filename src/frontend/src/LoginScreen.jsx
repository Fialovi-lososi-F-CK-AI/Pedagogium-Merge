import React, { useMemo, useState, useEffect } from "react";
import { registerUser } from "./userApi";

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  // Effect to reset body margins and prevent white edges/scrollbars
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.body.style.backgroundColor = "#1a1a2e";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const canSubmit = useMemo(() => {
    if (!username.trim()) return false;
    if (password.length < 5) return false;
    return true;
  }, [username, password]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      if (mode === "signup") {
        await registerUser(username, password);
        localStorage.setItem("authUser", username);
        onLogin(username);
      } else {
        // Basic login simulation (replace with real API call if available)
        if (username && password.length >= 5) {
          localStorage.setItem("authUser", username);
          onLogin(username);
        } else {
          setMsg("Invalid username or password.");
        }
      }
    } catch (err) {
      setMsg(err?.message || "Server connection error");
    }
  };

  const loginAsGuest = () => {
    const guestUser = "Guest_" + Math.floor(Math.random() * 1000);
    localStorage.setItem("authUser", guestUser);
    onLogin(guestUser);
  };

  return (
    <div style={{
      height: "100vh",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "radial-gradient(circle at center, #1e3c72 0%, #1a1a2e 100%)",
      boxSizing: "border-box",
      margin: 0,
      padding: "1rem",
      position: "fixed",
      top: 0,
      left: 0
    }}>
      <div style={{
        backgroundColor: "rgba(30, 30, 47, 0.9)",
        backdropFilter: "blur(15px)",
        borderRadius: "24px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 20px rgba(0, 255, 204, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "2.5rem",
        width: "100%",
        maxWidth: "380px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxSizing: "border-box"
      }}>
        <h1 style={{ 
          margin: "0 0 0.5rem 0", 
          color: "#e156be", 
          fontSize: "2.2rem",
          textAlign: "center",
          textShadow: "0 0 15px rgba(0,255,204,0.4)" 
        }}>
          {mode === "signup" ? "Sign Up" : "Login"}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "2rem", fontSize: "0.95rem", textAlign: "center" }}>
          Pedagogium Merge
        </p>

        <form onSubmit={submit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: "1.1rem",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              color: "white",
              fontSize: "1rem",
              width: "100%",
              outline: "none",
              boxSizing: "border-box",
              transition: "all 0.3s ease"
            }}
          />

          <input
            type="password"
            placeholder="Password (min. 5 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "1.1rem",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              color: "white",
              fontSize: "1rem",
              width: "100%",
              outline: "none",
              boxSizing: "border-box",
              transition: "all 0.3s ease"
            }}
          />

          <button
            disabled={!canSubmit}
            style={{
              padding: "1.1rem",
              borderRadius: "12px",
              border: "none",
              backgroundColor: canSubmit ? "#e156be" : "rgba(0, 255, 204, 0.1)",
              color: canSubmit ? "#1a1a2e" : "rgba(255,255,255,0.3)",
              fontWeight: "bold",
              fontSize: "1.1rem",
              cursor: canSubmit ? "pointer" : "not-allowed",
              transition: "all 0.3s",
              boxShadow: canSubmit ? "0 8px 20px rgba(0,255,204,0.3)" : "none",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}
          >
            {mode === "signup" ? "Create Account" : "Enter Game"}
          </button>

          {msg && <p style={{ color: "#ff4c4c", textAlign: "center", margin: "0", fontSize: "0.9rem", fontWeight: "500" }}>{msg}</p>}
        </form>

        <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1.2rem", width: "100%" }}>
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg(""); }}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.9rem",
              cursor: "pointer",
              textDecoration: "none",
              transition: "color 0.2s"
            }}
            onMouseOver={(e) => e.target.style.color = "#e156be"}
            onMouseOut={(e) => e.target.style.color = "rgba(255,255,255,0.5)"}
          >
            {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }}></div>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem", fontWeight: "bold" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }}></div>
          </div>

          <button
            onClick={loginAsGuest}
            style={{
              padding: "0.9rem",
              borderRadius: "12px",
              border: "1px solid rgba(0, 255, 204, 0.3)",
              backgroundColor: "transparent",
              color: "#e156be",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s",
              width: "100%"
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "rgba(0, 255, 204, 0.1)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            Play as Guest
          </button>
        </div>
      </div>
    </div>
  );
}