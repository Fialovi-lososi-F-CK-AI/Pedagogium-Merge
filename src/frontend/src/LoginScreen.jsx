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
    setIsLoading(true);

    try {
      if (mode === "signup") {
        await registerUser(username.trim(), password);
        localStorage.setItem("authUser", username.trim());
        onLogin(username.trim());
      } else {
        const data = await loginUser(username.trim(), password);
        if (!data?.success) {
          setMsg(data?.message || "Invalid credentials.");
          return;
        }
        localStorage.setItem("authUser", data.username || username.trim());
        onLogin(data.username || username.trim());
      }
    } catch (err) {
      setMsg(err.message || "Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = () => {
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
              ⚠️ {msg}
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
          onClick={loginAsGuest}
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