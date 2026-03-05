const API_BASE = "/api";

async function readJsonOrThrow(res) {
  const text = await res.text().catch(() => "");
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* ignore */ }

  if (!res.ok) {
    const msg = (data && data.error) ? data.error : text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function registerUser(username, password) {
  const res = await fetch(`/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return readJsonOrThrow(res);
}

export async function getPasswordForUser(username) {
  const url = new URL(`/password`, window.location.origin);
  url.searchParams.set("username", username);

  const res = await fetch(url.toString(), {
    headers: { "Accept": "application/json" },
  });
  return readJsonOrThrow(res);
}