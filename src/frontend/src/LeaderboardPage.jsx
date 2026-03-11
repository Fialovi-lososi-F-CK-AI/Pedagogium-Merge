import React, { useEffect, useRef, useState } from "react";
import { fetchTop5 } from "./leaderboardApi";

export default function LeaderboardPage() {
  const [top5, setTop5] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const currentUser = localStorage.getItem("authUser") || "";
  const lastRefreshRef = useRef(0);

  const loadTop5 = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastRefreshRef.current < 1200) return;

    lastRefreshRef.current = now;
    setIsRefreshing(true);

    try {
      const data = await fetchTop5();
      setTop5(Array.isArray(data) ? data : []);
    } catch {
      console.error("Error loading leaderboard");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTop5(true);
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
      background: "transparent", 
      minHeight: "100%"
    }}>
      <h1 style={{ 
        marginBottom: "2rem", 
        color: "#5598D3", 
        textShadow: "0 0 15px rgba(38, 116, 188, 0.4)",
        textAlign: "center",
        fontSize: "2rem",
        fontWeight: "bold",
        letterSpacing: "2px"
      }}>
        TOP 5 RANKINGS
      </h1>

      <ol style={{
        padding: 0,
        margin: 0,
        listStyle: "none",
        width: "100%",
        maxWidth: "500px",
      }}>
        {top5.map((p, i) => {
          const isMe = p.username === currentUser;
          return (
            <li key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.5rem",
              marginBottom: "0.8rem",
              borderRadius: "12px",
              backgroundColor: isMe ? "rgba(38, 116, 188, 0.2)" : "rgba(0, 0, 0, 0.3)",
              border: isMe ? "1px solid #5598D3" : "1px solid rgba(38, 116, 188, 0.2)",
              boxShadow: isMe ? "0 0 15px rgba(38, 116, 188, 0.2)" : "none",
              transition: "transform 0.2s"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <span style={{ 
                  fontSize: "1.2rem", 
                  fontWeight: "bold", 
                  color: isMe ? "#BEDAF3" : "#5598D3",
                  minWidth: "25px"
                }}>
                  {i + 1}.
                </span>
                <span style={{ 
                  fontSize: "1.1rem", 
                  fontWeight: isMe ? "bold" : "normal",
                  color: isMe ? "white" : "#BEDAF3"
                }}>
                  {p.username}
                </span>
              </div>
              <span style={{ 
                fontSize: "1.3rem", 
                fontWeight: "bold", 
                color: isMe ? "#5598D3" : "#BEDAF3",
                fontFamily: "monospace"
              }}>
                {p.score.toLocaleString()}
              </span>
            </li>
          );
        })}
      </ol>

      {!isCurrentUserInTop5 && currentUser && (
        <div style={{
          marginTop: "1.5rem",
          padding: "1rem",
          borderRadius: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          border: "1px dashed rgba(85, 152, 211, 0.3)",
          color: "#5598D3",
          textAlign: "center",
          width: "100%",
          maxWidth: "500px",
          boxSizing: "border-box",
          fontSize: "0.9rem"
        }}>
          <b>{currentUser}</b>, your score is outside the Top 5.<br/>
          <span style={{ color: "#BEDAF3", fontSize: "0.8rem" }}>Keep merging to climb the ranks!</span>
        </div>
      )}

      <button 
        onClick={() => loadTop5(true)} 
        disabled={isRefreshing}
        style={{
          marginTop: "2.5rem",
          padding: "0.8rem 2.5rem",
          backgroundColor: "rgba(38, 116, 188, 0.2)",
          color: "#5598D3",
          border: "1px solid #5598D3",
          borderRadius: "10px",
          cursor: isRefreshing ? "default" : "pointer",
          fontWeight: "bold",
          fontSize: "0.9rem",
          textTransform: "uppercase",
          letterSpacing: "1px",
          transition: "all 0.3s ease",
          boxShadow: "0 0 10px rgba(38, 116, 188, 0.2)"
        }}
        onMouseOver={(e) => {
          if (!isRefreshing) {
            e.currentTarget.style.backgroundColor = "rgba(38, 116, 188, 0.3)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(38, 116, 188, 0.4)";
          }
        }}
        onMouseOut={(e) => {
          if (!isRefreshing) {
            e.currentTarget.style.backgroundColor = "rgba(38, 116, 188, 0.2)";
            e.currentTarget.style.boxShadow = "0 0 10px rgba(38, 116, 188, 0.2)";
          }
        }}
      >
        {isRefreshing ? "Refreshing..." : "Refresh Rankings"}
      </button>
    </div>
  );
}