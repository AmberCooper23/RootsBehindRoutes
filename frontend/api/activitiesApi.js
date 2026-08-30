const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/activities`;

export async function fetchActivity(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch activity");
  return res.json();
}

export async function fetchAllActivities() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch activities");
  return res.json();
}

export async function addActivity(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create activity");
  return res.json();
}
