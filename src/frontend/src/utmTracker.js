const API_BASE = "/api";

export function trackUTM() {
  const params = new URLSearchParams(window.location.search);

  const utm_source = params.get("utm_source");
  const utm_medium = params.get("utm_medium");
  const utm_campaign = params.get("utm_campaign");

  if (!utm_source || !utm_medium || !utm_campaign) return;

  if (localStorage.getItem("utmTracked")) return;

  fetch(`${API_BASE}/utm/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ utm_source, utm_medium, utm_campaign }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("UTM track failed");
      localStorage.setItem("utmTracked", "1");
    })
    .catch((e) => console.warn("UTM tracking failed", e));
}