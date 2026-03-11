import React, { useEffect, useRef, useState } from "react";
import initGame from "./initGame.js";
import { trackUTM } from "./utmTracker";
import { submitScore, submitScoreKeepalive } from "./leaderboardApi";

export default function GameScreen({ user }) {
  const [score, setScore] = useState(0);
  const [gameOverBox, setGameOverBox] = useState({
    open: false,
    finalScore: 0,
    isNewHighScore: false,
    saved: false,
  });

  const hasInitialized = useRef(false);
  const scoreRef = useRef(0);
  const isSavingRef = useRef(false);
  const lastSavedScoreRef = useRef(0);
  const lastSaveAttemptRef = useRef(0);
  const restartLockedRef = useRef(false);

  const bestScoreKey = `bestScore:${user}`;

  const getStoredBestScore = () => Number(localStorage.getItem(bestScoreKey) || "0");

  const setStoredBestScore = (value) => {
    localStorage.setItem(bestScoreKey, String(value));
  };

  const saveScoreIfNeeded = async ({ useKeepalive = false } = {}) => {
    const currentScore = scoreRef.current;
    const previousBest = getStoredBestScore();
    const now = Date.now();
    const isNewHighScore = currentScore > previousBest;

    if (!user || user.startsWith("Guest_")) {
      return { saved: false, isNewHighScore: false };
    }

    if (currentScore <= 0) {
      return { saved: false, isNewHighScore: false };
    }

    if (!isNewHighScore) {
      return { saved: false, isNewHighScore: false };
    }

    if (currentScore <= lastSavedScoreRef.current) {
      return { saved: true, isNewHighScore: true };
    }

    if (isSavingRef.current) {
      return { saved: false, isNewHighScore };
    }

    if (now - lastSaveAttemptRef.current < 1200) {
      return { saved: false, isNewHighScore };
    }

    lastSaveAttemptRef.current = now;
    isSavingRef.current = true;

    try {
      if (useKeepalive) {
        await submitScoreKeepalive(user, currentScore);
      } else {
        await submitScore(user, currentScore);
      }

      lastSavedScoreRef.current = currentScore;
      setStoredBestScore(currentScore);

      return { saved: true, isNewHighScore: true };
    } catch (err) {
      console.warn("Score save failed:", err);
      return { saved: false, isNewHighScore };
    } finally {
      isSavingRef.current = false;
    }
  };

  useEffect(() => {
    if (hasInitialized.current) return;

    const startEngine = () => {
      const canvas = document.getElementById("game-canvas");
      if (canvas) {
        initGame();
        hasInitialized.current = true;
      } else {
        setTimeout(startEngine, 50);
      }
    };

    startEngine();
    trackUTM();

    const handleScore = (e) => {
      if (e.detail !== undefined) {
        setScore((prev) => {
          const next = prev + Number(e.detail);
          scoreRef.current = next;
          return next;
        });
      }
    };

    const handleGameOver = async () => {
      const result = await saveScoreIfNeeded();

      setGameOverBox({
        open: true,
        finalScore: scoreRef.current,
        isNewHighScore: result.isNewHighScore,
        saved: result.saved,
      });
    };

    const handlePageHide = () => {
      void saveScoreIfNeeded({ useKeepalive: true });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void saveScoreIfNeeded({ useKeepalive: true });
      }
    };

    window.addEventListener("addScore", handleScore);
    window.addEventListener("gameOver", handleGameOver);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("addScore", handleScore);
      window.removeEventListener("gameOver", handleGameOver);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      hasInitialized.current = false;
    };
  }, [user]);

  const restartGame = () => {
    if (restartLockedRef.current) return;
    restartLockedRef.current = true;
    window.location.reload();
  };

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
        {gameOverBox.open && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "rgba(0, 0, 0, 0.55)",
              borderRadius: "15px",
              padding: "1rem",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "360px",
                background: "rgba(30, 30, 47, 0.96)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "18px",
                padding: "1.4rem",
                textAlign: "center",
                boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "0.8rem", color: "#fff" }}>
                Game Over
              </h2>

              <div style={{ fontSize: "1.05rem", marginBottom: "0.7rem" }}>
                Final score:{" "}
                <b style={{ color: "#e156be", fontSize: "1.4rem" }}>
                  {gameOverBox.finalScore}
                </b>
              </div>

              {gameOverBox.isNewHighScore && (
                <div
                  style={{
                    marginBottom: "0.8rem",
                    color: "#00ffcc",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                  }}
                >
                  New Highscore!
                </div>
              )}

              {!user.startsWith("Guest_") && gameOverBox.saved && (
                <div style={{ marginBottom: "0.8rem", color: "#b8ffd6" }}>
                  Score saved to leaderboard.
                </div>
              )}

              {!user.startsWith("Guest_") && !gameOverBox.saved && gameOverBox.isNewHighScore && (
                <div style={{ marginBottom: "0.8rem", color: "#ffd0d0" }}>
                  Score could not be saved.
                </div>
              )}

              {user.startsWith("Guest_") && (
                <div style={{ marginBottom: "0.8rem", color: "rgba(255,255,255,0.75)" }}>
                  Guest scores are not saved.
                </div>
              )}

              <button
                onClick={restartGame}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.9rem 1.4rem",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#e156be",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}