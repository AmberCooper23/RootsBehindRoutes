import { auth } from "../src/firebase";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/admin`;

async function authHeaders() {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeaders()),
    ...(options.headers || {}),
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Request failed");
  }
  return res.json();
}

export function getModerationSummary() {
  return request("/summary");
}

export function listContentByStatus(status) {
  return request(`/content?status=${encodeURIComponent(status)}`);
}

export function listPendingContent() {
  return listContentByStatus("pending");
}

export function setContentStatus(collection, id, status) {
  return request(`/content/${collection}/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

export function deleteContent(collection, id) {
  return request(`/content/${collection}/${id}`, { method: "DELETE" });
}

export function listAllUsers() {
  return request("/users");
}

export function banUser(uid) {
  return request(`/users/${uid}/ban`, { method: "POST" });
}

export function unbanUser(uid) {
  return request(`/users/${uid}/unban`, { method: "POST" });
}

export function suspendUser(uid, until) {
  return request(`/users/${uid}/suspend`, {
    method: "POST",
    body: JSON.stringify({ until }),
  });
}

export function unsuspendUser(uid) {
  return request(`/users/${uid}/unsuspend`, { method: "POST" });
}
