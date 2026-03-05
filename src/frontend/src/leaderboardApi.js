const API_BASE = "/api";

export async function fetchTop5() {
  const res = await fetch(`/top5`, {
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Top5 failed: ${res.status} ${txt}`);
  }
  return res.json();
}