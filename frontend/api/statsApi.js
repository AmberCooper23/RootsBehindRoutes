const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/stats`;

export async function fetchStats() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}
