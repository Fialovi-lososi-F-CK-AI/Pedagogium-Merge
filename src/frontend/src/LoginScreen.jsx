import React, { useMemo, useState, useEffect } from "react";
import { registerUser } from "./userApi";

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    return username.trim().length > 0 && password.length >= 5 && !isLoading;
  }, [username, password, isLoading]);

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setMsg("");
    setIsLoading(true);

    try {
      if (mode === "signup") {
        await registerUser(username, password);
        
        localStorage.setItem("authUser", username);
        onLogin(username);
      } else {
        if (username && password.length >= 5) {
          localStorage.setItem("authUser", username);
          onLogin(username);
        } else {
          setMsg("Invalid username or password.");
        }
      }
    } catch (err) {
      setMsg(err.message || "Server connection error");
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = () => {
    const guestUser = "Guest_" + Math.floor(Math.random() * 1000);
    localStorage.setItem("authUser", guestUser);
    onLogin(guestUser);
  };

  return (
    <div style={{
      height: "100dvh",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "radial-gradient(circle at center, #1e3c72 0%, #1a1a2e 100%)",
      padding: "1rem",
      boxSizing: "border-box",
      position: "fixed",
      top: 0,
      left: 0
    }}>
      <div style={{
        backgroundColor: "rgba(30, 30, 47, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: "28px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 30px rgba(225, 86, 190, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "2.5rem",
        width: "100%",
        maxWidth: "400px",
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
          textShadow: "0 0 15px rgba(225, 86, 190, 0.3)",
          letterSpacing: "-1px"
        }}>
          {mode === "signup" ? "Create Account" : "Login"}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "2rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "2px" }}>
          Pedagogium Merge
        </p>

        <form onSubmit={submit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            autoFocus
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: "1.1rem",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              color: "white",
              fontSize: "1rem",
              outline: "none",
              boxSizing: "border-box",
              transition: "border 0.3s"
            }}
          />

          <input
            type="password"
            placeholder="Password (min. 5 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "1.1rem",
              borderRadius: "14px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              color: "white",
              fontSize: "1rem",
              outline: "none",
              boxSizing: "border-box"
            }}
          />

          {/* ERROR MESSAGE - Displayed here if username is taken or other issues occur */}
          {msg && (
            <div style={{
              backgroundColor: "rgba(255, 76, 76, 0.15)",
              color: "#ff4c4c",
              padding: "0.8rem",
              borderRadius: "10px",
              fontSize: "0.85rem",
              textAlign: "center",
              border: "1px solid rgba(255, 76, 76, 0.3)",
              marginTop: "0.5rem"
            }}>
              ⚠️ {msg}
            </div>
          )}

          <button
            disabled={!canSubmit}
            style={{
              marginTop: "0.5rem",
              padding: "1.1rem",
              borderRadius: "14px",
              border: "none",
              backgroundColor: canSubmit ? "#e156be" : "rgba(255, 255, 255, 0.05)",
              color: canSubmit ? "white" : "rgba(255, 255, 255, 0.2)",
              fontWeight: "bold",
              fontSize: "1.1rem",
              cursor: canSubmit ? "pointer" : "not-allowed",
              transition: "all 0.3s ease",
              boxShadow: canSubmit ? "0 10px 20px rgba(225, 86, 190, 0.3)" : "none"
            }}
          >
            {isLoading ? "Processing..." : (mode === "signup" ? "Register" : "Enter Game")}
          </button>
        </form>

        <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1.2rem", width: "100%" }}>
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg(""); }}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "color 0.2s"
            }}
            onMouseOver={(e) => e.target.style.color = "#e156be"}
            onMouseOut={(e) => e.target.style.color = "rgba(255,255,255,0.4)"}
          >
            {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }}></div>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.7rem", fontWeight: "bold" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }}></div>
          </div>

          <button
            onClick={loginAsGuest}
            style={{
              padding: "0.9rem",
              borderRadius: "14px",
              border: "1px solid rgba(0, 255, 204, 0.3)",
              backgroundColor: "transparent",
              color: "#00ffcc",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "rgba(0, 255, 204, 0.1)"}
            onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
          >
            Play as Guest
          </button>
        </div>
      </div>
    </div>
  );
}