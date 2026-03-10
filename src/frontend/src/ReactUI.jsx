import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";
import LoginScreen from "./LoginScreen";
import GameScreen from "./GameScreen";
import LeaderboardPage from "./LeaderboardPage";

function AppLayout({ user, logout }) {
  const location = useLocation();
  const isGameRoute = location.pathname === "/";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = (e) => {
    e.stopPropagation();
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100dvh",
      width: "100vw",
      background: "#1a1a2e",
      overflow: "hidden",
      position: "relative"
    }}>
      {/* HEADER */}
      <header style={{
        height: "48px",
        padding: "0 0.8rem",
        backgroundColor: "rgba(30,30,47,0.98)",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 100,
        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        borderBottom: "1px solid rgba(0, 255, 204, 0.3)"
      }}>
        <button
          onClick={toggleSidebar}
          style={{
            background: "none",
            border: "none",
            color: "#e156be",
            fontSize: "1.6rem",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none"
          }}
        >
          ☰
        </button>

        <div style={{
          fontWeight: "bold",
          fontSize: "1rem",
          color: "#e156be",
          textTransform: "uppercase",
          letterSpacing: "1px"
        }}>
          Pedagogium Merge
        </div>

        <div style={{ width: "30px" }}></div>
      </header>

      {/* OVERLAY */}
      <div
        onClick={closeSidebar}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.7)",
          zIndex: 998,
          display: isSidebarOpen ? "block" : "none",
          backdropFilter: "blur(3px)",
          transition: "opacity 0.3s ease"
        }}
      />

      {/* SIDEBAR */}
      <div style={{
        position: "fixed",
        top: 0,
        left: isSidebarOpen ? "0" : "-300px",
        width: "280px",
        height: "100vh",
        backgroundColor: "#161625",
        zIndex: 999,
        transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s",
        visibility: isSidebarOpen ? "visible" : "hidden",
        boxShadow: isSidebarOpen ? "5px 0 25px rgba(0,0,0,0.8)" : "none",
        display: "flex",
        flexDirection: "column",
        padding: "2rem 1rem",
        boxSizing: "border-box"
      }}>
        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
          <button
            onClick={closeSidebar}
            style={{ background: "none", border: "none", color: "#ff4c4c", fontSize: "1.8rem", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "1rem 0", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>PLAYER</span>
          <div style={{ fontSize: "1.4rem", color: "#e156be", fontWeight: "bold" }}>{user}</div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <NavLink
            to="/"
            onClick={closeSidebar}
            style={({ isActive }) => ({
              color: isActive ? "#e156be" : "white",
              textDecoration: "none",
              fontSize: "1.1rem",
              padding: "15px",
              borderRadius: "10px",
              backgroundColor: isActive ? "rgba(0,255,204,0.15)" : "transparent",
              display: "block",
              border: isActive ? "1px solid rgba(0,255,204,0.3)" : "1px solid transparent",
              transition: "0.2s"
            })}
          >
            🎮 Play Game
          </NavLink>

          <NavLink
            to="/leaderboard"
            onClick={closeSidebar}
            style={({ isActive }) => ({
              color: isActive ? "#e156be" : "white",
              textDecoration: "none",
              fontSize: "1.1rem",
              padding: "15px",
              borderRadius: "10px",
              backgroundColor: isActive ? "rgba(0,255,204,0.15)" : "transparent",
              display: "block",
              border: isActive ? "1px solid rgba(0,255,204,0.3)" : "1px solid transparent",
              transition: "0.2s"
            })}
          >
            🏆 Leaderboard
          </NavLink>

          <button
            onClick={logout}
            style={{
              marginTop: "1.5rem",
              cursor: "pointer",
              backgroundColor: "#ff4c4c22",
              border: "1px solid #ff4c4c",
              color: "#ff4c4c",
              borderRadius: "10px",
              padding: "1rem",
              fontWeight: "bold",
              transition: "0.2s",
              textAlign: "center"
            }}
          >
            LOG OUT
          </button>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <main style={{
        flex: 1,
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start"
      }}>
        <div style={{
          display: isGameRoute ? "flex" : "none",
          width: "100%",
          height: "100%",
          alignItems: "flex-start",
          justifyContent: "center"
        }}>
          <GameScreen user={user} />
        </div>

        {!isGameRoute && (
          <div style={{ width: "100%", height: "100%", overflowY: "auto", padding: "1rem" }}>
            <Routes>
              <Route path="/leaderboard" element={<LeaderboardPage />} />
            </Routes>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ReactUI() {
  const [user, setUser] = useState(localStorage.getItem("authUser") || "");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
  }, []);

  const logout = () => {
    localStorage.removeItem("authUser");
    setUser("");
    window.location.reload();
  };

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <Router>
      <AppLayout user={user} logout={logout} />
    </Router>
  );
}