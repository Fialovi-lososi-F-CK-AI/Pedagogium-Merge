const API_BASE = "/api";

export async function fetchTop5() {
  const res = await fetch(`${API_BASE}/score/top5`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Top5 failed: ${res.status} ${txt}`);
  }

  return res.json();
}

export async function submitScore(username, score) {
  const res = await fetch(`${API_BASE}/score/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, score }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Submit failed: ${res.status} ${txt}`);
  }

  return res.json();
}