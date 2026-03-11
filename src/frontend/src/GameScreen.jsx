import React, { useEffect, useRef, useState } from "react";
import initGame from "./initGame.js";

export default function GameScreen({ user }) {
  const scoreRef = useRef(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;

    const startEngine = () => {
      const canvas = document.getElementById("game-canvas");
      if (canvas) {
        try {
          initGame(); 
          hasInitialized.current = true;
        } catch (err) {
          console.error("Game engine failed to start:", err);
        }
      }
    };

    const timer = setTimeout(startEngine, 100);

    const handleScore = (e) => {
      scoreRef.current += Number(e.detail || 0);
    };

    const handleGameOver = () => {
      setShowGameOver(true);
    };

    window.addEventListener("addScore", handleScore);
    window.addEventListener("gameOver", handleGameOver);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("addScore", handleScore);
      window.removeEventListener("gameOver", handleGameOver);
    };
  }, []);

  const restartGame = () => {
    window.location.reload();
  };

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      backgroundColor: "transparent"
    }}>
      <canvas 
        id="game-canvas" 
        style={{
          width: "100%",
          maxWidth: "440px",
          aspectRatio: "5/7",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          touchAction: "none"
        }}
      />

      {showGameOver && (
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 200,
          borderRadius: "12px"
        }}>
          <h1 style={{ color: "white", marginBottom: "1rem" }}>GAME OVER</h1>
          <p style={{ color: "#5598D3", fontSize: "1.5rem", marginBottom: "2rem" }}>
            Score: {scoreRef.current}
          </p>
          <button 
            onClick={restartGame}
            style={{
              padding: "1rem 2rem",
              fontSize: "1.2rem",
              backgroundColor: "#5598D3",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}