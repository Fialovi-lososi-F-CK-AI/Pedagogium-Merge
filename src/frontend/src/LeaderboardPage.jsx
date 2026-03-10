import React, { useEffect, useState } from "react";
import { fetchTop5 } from "./leaderboardApi";

export default function LeaderboardPage() {
  const [top5, setTop5] = useState([]);
  const currentUser = localStorage.getItem("authUser") || "";

  const loadTop5 = async () => {
    try {
      const data = await fetchTop5();
      setTop5(data);
    } catch {
      console.error("Error loading leaderboard");
    }
  };

  useEffect(() => {
    loadTop5();
  }, []);

  const isCurrentUserInTop5 = top5.some((p) => p.username === currentUser);

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "2rem 1rem",
      boxSizing: "border-box",
      color: "white",
      background: "#1a1a2e",
      minHeight: "100%"
    }}>
      <h1 style={{ 
        marginBottom: "2rem", 
        color: "#e156be", 
        textShadow: "0 0 10px rgba(0,255,204,0.3)",
        textAlign: "center"
      }}>
        Top 5 Leaderboard
      </h1>

      <ol style={{
        padding: 0,
        margin: 0,
        listStyle: "none",
        width: "100%",
        maxWidth: "600px",
      }}>
        {top5.map((p, i) => (
          <li key={i} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.5rem",
            marginBottom: "0.8rem",
            borderRadius: "10px",
            backgroundColor: p.username === currentUser ? "rgba(0, 255, 204, 0.15)" : "rgba(255,255,255,0.05)",
            border: p.username === currentUser ? "1px solid #e156be" : "1px solid rgba(255,255,255,0.1)",
            boxShadow: p.username === currentUser ? "0 0 15px rgba(0,255,204,0.2)" : "none",
            transition: "transform 0.2s"
          }}>
            <span style={{ fontSize: "1.1rem", fontWeight: p.username === currentUser ? "bold" : "normal" }}>
              <span style={{ color: "#e156be", marginRight: "10px" }}>{i + 1}.</span> 
              {p.username}
            </span>
            <span style={{ 
              fontSize: "1.2rem", 
              fontWeight: "bold", 
              color: p.username === currentUser ? "#00ffcc" : "white" 
            }}>
              {p.score}
            </span>
          </li>
        ))}
      </ol>

      {!isCurrentUserInTop5 && currentUser && (
        <div style={{
          marginTop: "1.5rem",
          padding: "1rem",
          borderRadius: "10px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: "1px dashed rgba(255, 255, 255, 0.3)",
          color: "rgba(255, 255, 255, 0.7)",
          textAlign: "center",
          width: "100%",
          maxWidth: "600px",
          boxSizing: "border-box"
        }}>
          <b>{currentUser}</b>, your score is currently outside the Top 5. Keep merging!
        </div>
      )}

      <button 
        onClick={loadTop5} 
        style={{
          marginTop: "2.5rem",
          padding: "0.8rem 2rem",
          backgroundColor: "#e156be",
          color: "#1a1a2e",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "1rem",
          boxShadow: "0 4px 15px rgba(0,255,204,0.3)",
          transition: "all 0.2s"
        }}
        onMouseOver={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(0,255,204,0.4)";
        }}
        onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 15px rgba(0,255,204,0.3)";
        }}
      >
        Refresh Rankings
      </button>
    </div>
  );
}