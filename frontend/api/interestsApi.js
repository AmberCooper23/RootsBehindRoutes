const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/interests`;

export async function fetchInterest(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch interest");
  return res.json();
}

export async function fetchAllInterests() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch interests");
  return res.json();
}

export async function addInterest(id, data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, data }),
  });
  if (!res.ok) throw new Error("Failed to create interest");
  return res.json();
}
