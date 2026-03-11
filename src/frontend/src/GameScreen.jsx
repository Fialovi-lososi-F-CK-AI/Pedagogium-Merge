import React, { useEffect, useRef, useState } from "react";
import initGame from "./initGame.js";
import { trackUTM } from "./utmTracker";
import { submitScore, submitScoreKeepalive } from "./leaderboardApi";

const COLORS = {
  void: "#041124",
  deep: "#0A3976",
  primary: "#2674BC",
  accent: "#5598D3",
  highlight: "#BEDAF3"
};

export default function GameScreen({ user }) {
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

  const bestScoreKey = `bestScore:${user}`;

  const getStoredBestScore = () => Number(localStorage.getItem(bestScoreKey) || "0");
  const setStoredBestScore = (value) => localStorage.setItem(bestScoreKey, String(value));

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

    if (isSavingRef.current || now - lastSaveAttemptRef.current < 1200) {
      return { saved: false, isNewHighScore: true };
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
      return { saved: false, isNewHighScore: true };
    } finally {
      isSavingRef.current = false;
    }
  };

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

    trackUTM();

    const handleScore = (e) => {
      const points = Number(e.detail || 0);
      scoreRef.current += points;
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
      clearTimeout(timer);
      window.removeEventListener("addScore", handleScore);
      window.removeEventListener("gameOver", handleGameOver);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      hasInitialized.current = false;
    };
  }, [user]);

  const restartGame = () => {
    window.location.reload();
  };

  return (
    <div style={{
      width: "100%", height: "100%", display: "flex", justifyContent: "center",
      alignItems: "center", position: "relative", backgroundColor: "transparent"
    }}>
      <canvas
        id="game-canvas"
        style={{
          width: "100%", maxWidth: "440px", aspectRatio: "5/7",
          borderRadius: "20px", boxShadow: `0 0 40px ${COLORS.void}`,
          touchAction: "none", border: `2px solid ${COLORS.primary}22`
        }}
      />

      {gameOverBox.open && (
        <div style={{
          position: "absolute", inset: 0, backgroundColor: "rgba(4, 17, 36, 0.9)",
          backdropFilter: "blur(8px)", display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center", zIndex: 200, borderRadius: "20px"
        }}>
          <h1 style={{
            color: COLORS.accent, fontSize: "2.5rem", marginBottom: "0.5rem",
            textShadow: `0 0 20px ${COLORS.primary}`
          }}>
            GAME OVER
          </h1>

          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p style={{ color: COLORS.highlight, fontSize: "1.1rem", margin: 0, opacity: 0.8 }}>FINAL SCORE</p>
            <p style={{ color: "white", fontSize: "3.5rem", fontWeight: "bold", margin: 0 }}>
              {gameOverBox.finalScore.toLocaleString()}
            </p>
            {gameOverBox.isNewHighScore && (
              <p style={{ color: "#FFD700", fontWeight: "bold", marginTop: "0.5rem", fontSize: "0.9rem" }}>
                ✨ NEW PERSONAL BEST! ✨
              </p>
            )}
          </div>

          <button
            onClick={restartGame}
            style={{
              padding: "1.2rem 3rem", fontSize: "1.2rem", fontWeight: "bold",
              backgroundColor: COLORS.primary, color: "white", border: "none",
              borderRadius: "15px", cursor: "pointer", transition: "all 0.2s",
              boxShadow: `0 10px 20px ${COLORS.void}`, textTransform: "uppercase"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = COLORS.accent}
            onMouseOut={(e) => e.target.style.backgroundColor = COLORS.primary}
          >
            Play Again
          </button>

          {!gameOverBox.saved && user && !user.startsWith("Guest_") && (
            <p style={{ color: COLORS.highlight, fontSize: "0.7rem", marginTop: "1.5rem", opacity: 0.5 }}>
              Score sync pending...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
