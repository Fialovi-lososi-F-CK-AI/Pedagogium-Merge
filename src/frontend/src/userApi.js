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

export async function registerUser(username, password) {
  const res = await fetch(`${API_BASE}/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  return readJsonOrThrow(res);
}

export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  return readJsonOrThrow(res);
}

export async function fetchMe() {
  const res = await fetch(`${API_BASE}/user/me`, {
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  return readJsonOrThrow(res);
}

export async function logoutUser() {
  const res = await fetch(`${API_BASE}/user/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  return readJsonOrThrow(res);
}