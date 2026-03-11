const API_BASE = "/api";

export function trackUTM() {
  const params = new URLSearchParams(window.location.search);

  const utm_source = params.get("utm_source");
  const utm_medium = params.get("utm_medium");
  const utm_campaign = params.get("utm_campaign");

  if (!utm_source || !utm_medium || !utm_campaign) return;

  const trackingKey = `utmTracked:${utm_source}:${utm_medium}:${utm_campaign}`;

  if (localStorage.getItem(trackingKey)) return;

  fetch(`${API_BASE}/utm/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ utm_source, utm_medium, utm_campaign }),
    keepalive: true,
  })
    .then((res) => {
      if (!res.ok) throw new Error(`UTM track failed: ${res.status}`);
      localStorage.setItem(trackingKey, "1");
    })
    .catch((e) => console.warn("UTM tracking failed", e));
}
