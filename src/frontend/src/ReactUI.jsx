import React, { useState, useEffect } from "react";
import initGame from "./initGame.js";
import { trackUTM } from "./utmTracker";

export default function ReactUI() {
  const [score, setScore] = useState(0);

  useEffect(() => {
  initGame();

  trackUTM();

  const handleScore = (e) => setScore((prev) => prev + e.detail);
  window.addEventListener("addScore", handleScore);

  return () => window.removeEventListener("addScore", handleScore);
}, []);

  return (
    <div className="ui-container">
      <div className="score-board">
        <h1>Skóre: {score}</h1>
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
          margin-bottom: 20px;
        }
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