import React, { useEffect, useMemo, useState } from "react";
import initGame from "./initGame.js";
import { trackUTM } from "./utmTracker";
import { fetchTop5 } from "./leaderboardApi";
import { registerUser } from "./userApi";

export default function ReactUI() {
  const [score, setScore] = useState(0);

  // leaderboard
  const [top5, setTop5] = useState([]);
  const [lbError, setLbError] = useState("");

  const loadTop5 = () => {
    setLbError("");
    fetchTop5()
      .then((data) => setTop5(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.warn(e);
        setLbError("Leaderboard cannot be loaded.");
      });
  };

  // auth
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authUser, setAuthUser] = useState(() => localStorage.getItem("authUser") || "");
  const [authMsg, setAuthMsg] = useState("");

  const canSubmit = useMemo(() => {
    if (!username.trim()) return false;
    if (password.length < 5) return false;
    return true;
  }, [username, password]);

  const logout = () => {
    localStorage.removeItem("authUser");
    setAuthUser("");
    setAuthMsg("Logged out.");
  };

  const onSubmitAuth = async (e) => {
    e.preventDefault();
    setAuthMsg("");

    const u = username.trim();
    if (!u) return setAuthMsg("Enter username.");
    if (password.length < 5) return setAuthMsg("Password must have at least 5 characters.");

    try {
      if (mode === "signup") {
        await registerUser(u, password);
        localStorage.setItem("authUser", u);
        setAuthUser(u);
        setAuthMsg("Registration successful. Logged in.");
      } else {
        setAuthMsg("Login is not implemented on backend yet.");
      }
    } catch (err) {
      setAuthMsg(err?.message || "Error.");
    }
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
      {/* TOPBAR: 3 sloupce (vlevo placeholder, uprostřed score, vpravo auth) */}
      <div className="topbar">
        <div className="topbar-left" />

        <div className="score-board">
          <h1>Skóre: {score}</h1>
        </div>

        <div className="auth-box">
          {authUser ? (
            <div className="auth-logged">
              <div className="auth-line">
                <span>Přihlášen:</span> <strong>{authUser}</strong>
              </div>
              <button className="btn" onClick={logout}>Odhlásit</button>
              {authMsg && <div className="auth-msg">{authMsg}</div>}
            </div>
          ) : (
            <form onSubmit={onSubmitAuth} className="auth-form">
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`tab ${mode === "login" ? "active" : ""}`}
                  onClick={() => setMode("login")}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`tab ${mode === "signup" ? "active" : ""}`}
                  onClick={() => setMode("signup")}
                >
                  Sign up
                </button>
              </div>

              <input
                className="inp"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              <input
                className="inp"
                placeholder="Password (min 5)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />

              <button className="btn primary" type="submit" disabled={!canSubmit}>
                {mode === "signup" ? "Create Account" : "Log In"}
              </button>

              {authMsg && <div className="auth-msg">{authMsg}</div>}
            </form>
          )}
        </div>
      </div>

      {/* MAIN: leaderboard vlevo, hra uprostřed, vpravo placeholder */}
      <div className="main">
        <div className="leaderboard">
          <div className="leaderboard-header">
            <h2>Top 5</h2>
            <button className="btn" onClick={loadTop5}>Obnovit</button>
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

        <div className="game-wrap">
          <canvas id="game-canvas" width="400" height="600"></canvas>
        </div>

        <div className="main-right" />
      </div>

      <style>{`
        .ui-container { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          background: #242424; 
          min-height: 100vh; 
          color: white; 
          font-family: sans-serif;
          padding: 16px;
          box-sizing: border-box;
        }

        .topbar {
          width: min(1100px, 96vw);
          display: grid;
          grid-template-columns: 260px 1fr 320px;
          align-items: start;
          gap: 12px;
          margin-bottom: 14px;
        }

        .score-board { 
          padding: 16px 20px; 
          background: rgba(0,0,0,0.5); 
          border-radius: 12px;
          text-align: center; 
        }

        .auth-box {
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px;
        }

        .auth-form { display: flex; flex-direction: column; gap: 8px; }
        .auth-tabs { display: flex; gap: 8px; margin-bottom: 6px; }
        .tab {
          flex: 1;
          background: #111;
          color: white;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          padding: 6px 10px;
          cursor: pointer;
        }
        .tab.active {
          border-color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.06);
        }

        .inp {
          background: #111;
          color: white;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          padding: 8px 10px;
          outline: none;
        }
        .inp:focus { border-color: rgba(255,255,255,0.35); }

        .btn {
          background: #111;
          color: white;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          padding: 7px 10px;
          cursor: pointer;
        }
        .btn:hover { opacity: 0.92; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn.primary {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.25);
          font-weight: 700;
        }

        .auth-logged { display: flex; flex-direction: column; gap: 10px; }
        .auth-line { opacity: 0.95; }
        .auth-msg { margin-top: 6px; font-size: 13px; opacity: 0.9; }

        .main {
          width: min(1100px, 96vw);
          display: grid;
          grid-template-columns: 260px 1fr 320px;
          align-items: start;
          gap: 12px;
        }

        .game-wrap {
          display: flex;
          justify-content: center;
        }

        .leaderboard {
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px 14px;
        }
        .leaderboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }
        .leaderboard h2 { margin: 0; font-size: 18px; }

        .lb-error { color: #ffb3b3; }
        .lb-list { margin: 0; padding-left: 20px; }
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
          background: #1e86a6; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        @media (max-width: 900px) {
          .topbar { grid-template-columns: 1fr; }
          .main { grid-template-columns: 1fr; }
          .game-wrap { justify-content: center; }
          .leaderboard { width: min(420px, 92vw); }
        }
          @media (max-width: 600px) {

        .ui-container {
        padding: 10px;
        }

      .topbar {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .score-board h1 {
        font-size: 22px;
      }
      /* Media query pro telefony (do 600px) */
      }
      `}</style>
    </div>
  );
}