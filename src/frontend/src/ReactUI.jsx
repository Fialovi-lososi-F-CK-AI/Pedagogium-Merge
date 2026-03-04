import React, { useState, useEffect } from "react";
import initGame from "./initGame.js";
import { trackUTM } from "./utmTracker";
import { fetchTop5 } from "./leaderboardApi";

export default function ReactUI() {
  const [score, setScore] = useState(0);

  const [top5, setTop5] = useState([]);
  const [lbError, setLbError] = useState("");

  const loadTop5 = () => {
    setLbError("");
    fetchTop5()
      .then((data) => setTop5(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.warn(e);
        setLbError("Leaderboard nejde načíst.");
      });
  };

  useEffect(() => {
    initGame();
    trackUTM();

    loadTop5();

    const handleScore = (e) => setScore((prev) => prev + e.detail);
    window.addEventListener("addScore", handleScore);

    return () => window.removeEventListener("addScore", handleScore);
  }, []);

  return (
    <div className="ui-container">
      <div className="score-board">
        <h1>Skóre: {score}</h1>
      </div>

      {/* Leaderboard panel */}
      <div className="leaderboard">
        <div className="leaderboard-header">
          <h2>Top 5</h2>
          <button className="lb-btn" onClick={loadTop5}>Obnovit</button>
        </div>

        {lbError ? (
          <div className="lb-error">{lbError}</div>
        ) : (
          <ol className="lb-list">
            {top5.map((row, i) => (
              <li key={row.id ?? `${row.username ?? "u"}-${i}`} className="lb-item">
                <span className="lb-name">{row.username ?? row.name ?? "anon"}</span>
                <span className="lb-score">{row.score ?? 0}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <canvas id="game-canvas" width="400" height="600"></canvas>

      <style>{`
        .ui-container { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          background: #242424; 
          min-height: 100vh; 
          color: white; 
          font-family: sans-serif;
        }
        .score-board { 
          padding: 20px; 
          background: rgba(0,0,0,0.5); 
          width: 100%; 
          text-align: center; 
          margin-bottom: 12px;
        }

        .leaderboard {
          width: min(420px, 92vw);
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 16px;
        }
        .leaderboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }
        .leaderboard h2 {
          margin: 0;
          font-size: 18px;
        }
        .lb-btn {
          background: #111;
          color: white;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          padding: 6px 10px;
          cursor: pointer;
        }
        .lb-btn:hover { opacity: 0.9; }

        .lb-error { color: #ffb3b3; }

        .lb-list {
          margin: 0;
          padding-left: 20px;
        }
        .lb-item {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .lb-item:last-child { border-bottom: 0; }

        .lb-name { opacity: 0.95; }
        .lb-score { font-weight: 700; }

        #game-canvas { 
          border: 8px solid #1a1a1a; 
          border-radius: 15px;
          background: #fff8dc; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}