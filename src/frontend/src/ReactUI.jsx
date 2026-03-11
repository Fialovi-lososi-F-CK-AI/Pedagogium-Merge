import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, NavLink, useLocation } from "react-router-dom";
import LoginScreen from "./LoginScreen";
import GameScreen from "./GameScreen";
import LeaderboardPage from "./LeaderboardPage";

function AppLayout({ user, logout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  const location = useLocation();
  const isLeaderboardActive = location.pathname === "/leaderboard";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    const handleScore = (e) => setScore((prev) => prev + (e.detail || 0));
    const handleReset = () => setScore(0);

    window.addEventListener("resize", handleResize);
    window.addEventListener("addScore", handleScore);
    window.addEventListener("gameOver", handleReset);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("addScore", handleScore);
      window.removeEventListener("gameOver", handleReset);
    };
  }, []);

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
      background: "radial-gradient(circle at center, #1e3c72 0%, #041124 100%)",
      overflow: "hidden",
      position: "relative"
    }}>
      
      <header style={{
        height: "56px",
        padding: "0 1rem",
        backgroundColor: "rgba(20, 20, 35, 0.95)",
        color: "white",
        display: "flex",
        alignItems: "center",
        zIndex: 1000,
        borderBottom: "1px solid #2674BC",
        position: "relative"
      }}>
        <button 
          onClick={toggleSidebar} 
          style={{ 
            background: "none", border: "none", color: "#5598D3", 
            fontSize: "1.5rem", cursor: "pointer", outline: "none",
            zIndex: 10
          }}
        >
          ☰
        </button>

        <div style={{ 
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(0,0,0,0.5)", 
          padding: isMobile ? "4px 20px" : "4px 35px",
          borderRadius: "15px", 
          border: "1px solid rgba(85, 152, 211, 0.4)",
          minWidth: isMobile ? "100px" : "130px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "inset 0 0 10px rgba(85, 152, 211, 0.1)",
          zIndex: 5
        }}>
          <div style={{ fontSize: "0.55rem", color: "#5598D3", letterSpacing: "1px", fontWeight: "bold" }}>SCORE</div>
          <div style={{ 
            fontSize: isMobile ? "1.2rem" : "1.35rem", 
            fontWeight: "bold", color: "#BEDAF3", fontFamily: "monospace", letterSpacing: "2px" 
          }}>
            {score.toLocaleString()}
          </div>
        </div>

        <div style={{ marginLeft: "auto", fontSize: "0.8rem", fontWeight: "bold", color: "#2674BC", zIndex: 10 }}>
          PM
        </div>
      </header>

      <div 
        onClick={closeSidebar} 
        style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1100,
          opacity: isSidebarOpen ? 1 : 0, pointerEvents: isSidebarOpen ? "auto" : "none",
          backdropFilter: "blur(3px)", transition: "opacity 0.3s ease"
        }} 
      />

      <div style={{
        position: "fixed", top: 0, left: isSidebarOpen ? "0" : "-110%", 
        width: "280px", height: "100vh", backgroundColor: "#161625", zIndex: 1200,
        transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s", 
        visibility: isSidebarOpen ? "visible" : "hidden",
        display: "flex", flexDirection: "column", padding: "1.5rem 1rem",
        boxShadow: isSidebarOpen ? "10px 0 30px rgba(0,0,0,0.5)" : "none"
      }}>
        
        <div style={{
          display: "flex", alignItems: "center", gap: "15px",
          padding: "1rem", backgroundColor: "rgba(38, 116, 188, 0.1)",
          borderRadius: "12px", border: "1px solid rgba(38, 116, 188, 0.3)",
          marginBottom: "1.5rem"
        }}>
          <div style={{
            width: "45px", height: "45px", borderRadius: "50%",
            backgroundColor: "#2674BC", display: "flex", 
            justifyContent: "center", alignItems: "center", fontSize: "1.5rem"
          }}>
            🐧
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.7rem", color: "#5598D3", fontWeight: "bold" }}>ACTIVE PLAYER</span>
            <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "white" }}>{user}</span>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <NavLink to="/" onClick={closeSidebar} style={({ isActive }) => ({
            color: "white", textDecoration: "none", padding: "14px", borderRadius: "10px", 
            border: "1px solid #2674BC", backgroundColor: isActive ? "rgba(38, 116, 188, 0.2)" : "transparent",
            transition: "0.2s"
          })}>
            Play Game
          </NavLink>
          
          <NavLink to="/leaderboard" onClick={closeSidebar} style={({ isActive }) => ({
            color: "white", textDecoration: "none", padding: "14px", borderRadius: "10px", 
            border: "1px solid #2674BC", backgroundColor: isActive ? "rgba(38, 116, 188, 0.2)" : "transparent",
            transition: "0.2s"
          })}>
            🏆 Leaderboard
          </NavLink>
          
          <button 
            onClick={logout} 
            style={{ 
              marginTop: "10px", 
              padding: "14px", 
              borderRadius: "10px", 
              backgroundColor: "rgba(255, 76, 76, 0.25)", 
              color: "#ff6666", 
              border: "1px solid #ff4c4c", 
              cursor: "pointer", 
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              boxShadow: "0 0 15px rgba(255, 76, 76, 0.3)",
              transition: "all 0.2s ease",
              outline: "none"
            }}
          >
            Log Out
          </button>
        </nav>
      </div>

      <main style={{ flex: 1, width: "100%", height: "100%", position: "relative" }}>
          <div style={{ 
            display: isLeaderboardActive ? "none" : "flex", 
            width: "100%", 
            height: "100%",
            flexDirection: "column"
          }}>
            <GameScreen user={user} />
          </div>

          {isLeaderboardActive && (
            <div style={{ 
              position: "absolute", 
              inset: 0, 
              overflowY: "auto", 
              padding: "1rem",
              zIndex: 10,
              background: "radial-gradient(circle at center, #1e3c72 0%, #041124 100%)"
            }}>
              <LeaderboardPage />
            </div>
          )}
      </main>
    </div>
  );
}

export default function ReactUI() {
  const [user, setUser] = useState(localStorage.getItem("authUser") || "");

  const logout = () => { 
    localStorage.removeItem("authUser"); 
    setUser(""); 
    window.location.reload(); 
  };

  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <Router>
      <AppLayout user={user} logout={logout} />
    </Router>
  );
}