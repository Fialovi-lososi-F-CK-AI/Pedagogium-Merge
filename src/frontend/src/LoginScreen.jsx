import React, { useMemo, useState, useEffect } from "react";
import { registerUser, loginUser } from "./userApi";

const COLORS = {
  void: "#041124",
  deep: "#0A3976",
  primary: "#2674BC",
  accent: "#5598D3",
  highlight: "#BEDAF3"
};

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [guestLocked, setGuestLocked] = useState(false);
  const [showGuestWarning, setShowGuestWarning] = useState(false);

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.body.style.backgroundColor = COLORS.void;
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  const canSubmit = useMemo(() => {
    return username.trim().length > 0 && password.length >= 6 && !isLoading;
  }, [username, password, isLoading]);

  const submit = async (e) => {
  e.preventDefault();
  if (!canSubmit) return;

  setMsg("");
  const trimmedUsername = username.trim();

  if (trimmedUsername.length === 0) {
    setMsg("Enter your username to continue.");
    return;
  }

  if (trimmedUsername.length < 3) {
    setMsg("Username must be at least 3 characters long.");
    return;
  }

  if (trimmedUsername.length > 100) {
    setMsg("Username is too long (max 100 characters).");
    return;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
    setMsg("Username can only contain letters, numbers, and underscore (_).");
    return;
  }

  if (trimmedUsername.toLowerCase().startsWith("guest_")) {
    if (mode === "signup") {
      setMsg("The 'Guest_' prefix is reserved for temporary players.");
    } else {
      setMsg("Guest accounts cannot log in. Use 'Play as Guest' instead.");
    }
    return;
  }

  if (password.length === 0) {
    setMsg("Enter your password.");
    return;
  }

  if (password.length < 6) {
    setMsg("Password must contain at least 6 characters.");
    return;
  }

  if (password.length > 100) {
    setMsg("Password is too long (max 100 characters).");
    return;
  }

  setIsLoading(true);
  try {
    if (mode === "signup") {
      await registerUser(trimmedUsername, password);
      localStorage.setItem("authUser", trimmedUsername);
      onLogin(trimmedUsername);
    } else {
      const data = await loginUser(trimmedUsername, password);
      if (!data?.success) {
        setMsg(data?.message || "Invalid credentials.");
        return;
      }
      localStorage.setItem("authUser", data.username || trimmedUsername);
      onLogin(data.username || trimmedUsername);
    }
  } catch (err) {
    setMsg(err.message || "Connection error");
  } finally {
    setIsLoading(false);
  }
};

  const handleGuestLogin = () => {
    if (guestLocked) return;
    setGuestLocked(true);
    const guestUser = "Guest_" + Math.floor(Math.random() * 1000);
    localStorage.setItem("authUser", guestUser);
    onLogin(guestUser);
    setTimeout(() => setGuestLocked(false), 1200);
  };

  return (
    <div style={{
      height: "100dvh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center",
      background: `radial-gradient(circle at center, ${COLORS.deep} 0%, ${COLORS.void} 100%)`,
      padding: "1rem", boxSizing: "border-box", position: "fixed", top: 0, left: 0
    }}>

      {showGuestWarning && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex",
          justifyContent: "center", alignItems: "center", backdropFilter: "blur(5px)"
        }}>
          <div style={{
            backgroundColor: COLORS.void, border: `2px solid ${COLORS.accent}`,
            padding: "2rem", borderRadius: "20px", maxWidth: "320px", textAlign: "center",
            boxShadow: `0 0 30px ${COLORS.accent}44`
          }}>
            <h3 style={{ color: "white", marginTop: 0 }}>Play as Guest?</h3>
            <p style={{ color: COLORS.highlight, fontSize: "0.9rem", lineHeight: "1.4" }}>
              Warning: Guest progress <strong>will not be saved</strong>. You will lose all data once you close the browser or log out.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "1.5rem" }}>
              <button 
                onClick={() => setShowGuestWarning(false)}
                style={{ 
                  flex: 1, padding: "0.7rem", borderRadius: "10px", 
                  border: `1px solid ${COLORS.accent}`, backgroundColor: "transparent", 
                  color: "white", cursor: "pointer", fontWeight: "bold" 
                }}
              >
                Go Back
              </button>
              <button 
                onClick={handleGuestLogin}
                style={{ 
                  flex: 1, padding: "0.7rem", borderRadius: "10px", border: "none", 
                  backgroundColor: COLORS.accent, color: COLORS.void, 
                  cursor: "pointer", fontWeight: "bold" 
                }}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{
        backgroundColor: "#041124d9", backdropFilter: "blur(20px)", borderRadius: "28px",
        boxShadow: `0 25px 50px rgba(0,0,0,0.5), 0 0 30px rgba(38, 116, 188, 0.2)`,
        border: `1px solid ${COLORS.primary}44`, padding: "2rem", width: "100%", maxWidth: "400px",
        display: "flex", flexDirection: "column", alignItems: "center", boxSizing: "border-box"
      }}>
        <h1 style={{ color: COLORS.accent, fontSize: "1.8rem", margin: "0 0 0.5rem 0", textShadow: `0 0 10px ${COLORS.primary}66` }}>
            PEDAGOGIUM MERGE
        </h1>

        <div style={{
          display: "flex",
          width: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          borderRadius: "14px",
          padding: "4px",
          marginBottom: "1.5rem",
          border: `1px solid ${COLORS.primary}22`
        }}>
          <button
            onClick={() => { setMode("login"); setMsg(""); }}
            style={{
              flex: 1,
              padding: "0.8rem",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              backgroundColor: mode === "login" ? COLORS.primary : "transparent",
              color: mode === "login" ? "white" : COLORS.accent,
              boxShadow: mode === "login" ? `0 4px 15px ${COLORS.void}` : "none",
            }}
          >
            LOGIN
          </button>
          <button
            onClick={() => { setMode("signup"); setMsg(""); }}
            style={{
              flex: 1,
              padding: "0.8rem",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              backgroundColor: mode === "signup" ? COLORS.primary : "transparent",
              color: mode === "signup" ? "white" : COLORS.accent,
              boxShadow: mode === "signup" ? `0 4px 15px ${COLORS.void}` : "none",
            }}
          >
            SIGN UP
          </button>
        </div>

        <form onSubmit={submit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: "1.1rem", borderRadius: "14px", border: `1px solid ${COLORS.primary}33`,
              backgroundColor: "rgba(0, 0, 0, 0.3)", color: "white", outline: "none"
            }}
          />
          <input
            type="password"
            placeholder="Password (min. 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "1.1rem", borderRadius: "14px", border: `1px solid ${COLORS.primary}33`,
              backgroundColor: "rgba(0, 0, 0, 0.3)", color: "white", outline: "none"
            }}
          />

          {msg && (
            <div style={{ color: "#ff4c4c", fontSize: "0.85rem", textAlign: "center" }}>
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              marginTop: "0.5rem", padding: "1.1rem", borderRadius: "14px", border: "none",
              backgroundColor: canSubmit ? COLORS.accent : "rgba(255, 255, 255, 0.05)",
              color: canSubmit ? COLORS.void : "rgba(255, 255, 255, 0.2)",
              fontWeight: "bold", fontSize: "1rem", cursor: canSubmit ? "pointer" : "not-allowed",
              transition: "all 0.3s ease", textTransform: "uppercase"
            }}
          >
            {isLoading ? "Wait..." : (mode === "signup" ? "Create Account" : "Enter Game")}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", margin: "1.5rem 0" }}>
          <div style={{ flex: 1, height: "1px", background: `${COLORS.primary}33` }}></div>
          <span style={{ color: COLORS.primary, fontSize: "0.7rem", fontWeight: "bold", opacity: 0.5 }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: `${COLORS.primary}33` }}></div>
        </div>

        <button
          onClick={() => setShowGuestWarning(true)}
          style={{
            width: "100%", padding: "0.9rem", borderRadius: "14px", border: `1px solid ${COLORS.primary}66`,
            backgroundColor: "transparent", color: COLORS.highlight, fontWeight: "bold",
            cursor: "pointer", transition: "all 0.2s", textTransform: "uppercase"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${COLORS.primary}22`}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          Play as Guest
        </button>
      </div>
    </div>
  );
}