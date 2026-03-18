const API_BASE = "/api";

async function readJsonOrThrow(res) {
  const text = await res.text().catch(() => "");
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {}

  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      text ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

export async function fetchTop5() {
  const res = await fetch(`${API_BASE}/score/top5`, {
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  return readJsonOrThrow(res);
}

export async function startGameSession() {
  const res = await fetch("/api/score/start", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Game session start failed");
  }

  return data;
}

export async function submitScore(gameToken, score) {
  const res = await fetch("/api/score/submit", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ gameToken, score }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Score submit failed");
  }

  return data;
}

export function submitScoreKeepalive(gameToken, score) {
  return fetch(`${API_BASE}/score/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ gameToken, score }),
    keepalive: true,
  });
}