import { auth } from "../src/firebase";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/recommendations`;

export async function addRecommendation(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to submit recommendation");
  }
  return res.json();
}

export async function fetchRecommendations() {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
}

export async function updateRecommendationStatus(id, status) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${BASE_URL}/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update status");
  }
  return res.json();
}
