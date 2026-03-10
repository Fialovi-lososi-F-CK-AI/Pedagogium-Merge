import React, { useEffect, useState, useRef } from "react";
import initGame from "./initGame.js";
import { trackUTM } from "./utmTracker";

export default function GameScreen({ user }) {
  const [score, setScore] = useState(0);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;

    const startEngine = () => {
      const canvas = document.getElementById("game-canvas");
      if (canvas) {
        initGame();
        hasInitialized.current = true;
        console.log("Game Engine Started");
      } else {
        setTimeout(startEngine, 50);
      }
    };

    startEngine();
    trackUTM();

    const handleScore = (e) => {
      if (e.detail !== undefined) {
        setScore((prev) => prev + Number(e.detail));
      }
    };

    window.addEventListener("addScore", handleScore);

    return () => {
      window.removeEventListener("addScore", handleScore);
      hasInitialized.current = false;
    };
  }, []);

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      padding: "1rem",
      boxSizing: "border-box",
      color: "white",
      height: "100%",
      overflow: "hidden"
    }}>
      
      {/* HUD / Info Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
        padding: "0.8rem 1.5rem",
        backgroundColor: "rgba(30, 30, 47, 0.8)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
      }}>
        <div style={{ fontSize: "1.1rem", letterSpacing: "0.5px" }}>
          Player: <b style={{ color: "#e156be" }}>{user}</b>
        </div>
        <div style={{ fontSize: "1.1rem" }}>
          Score: <b style={{ color: "#e156be", fontSize: "1.5rem", textShadow: "0 0 10px rgba(0,255,204,0.5)" }}>{score}</b>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div style={{ 
        flex: 1, 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        width: "100%"
      }}>
        <canvas 
          id="game-canvas" 
          style={{
            width: "100%",
            maxWidth: "600px",
            height: "auto",
            aspectRatio: "5/7",
            backgroundColor: "#000",
            borderRadius: "15px",
            boxShadow: "0 0 40px rgba(0,0,0,0.6), 0 0 15px rgba(0,255,204,0.1)",
            border: "2px solid rgba(0, 255, 204, 0.2)",
            touchAction: "none"
          }}
        ></canvas>
      </div>
    </div>
  );
}