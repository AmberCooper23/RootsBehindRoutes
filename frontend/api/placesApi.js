const BASE_URL = "http://localhost:5000/api/places";

export async function fetchPlace(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch place");
  return res.json();
}

export async function fetchAllPlaces() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch places");
  return res.json();
}

export async function addPlace(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create place");
  return res.json();
}
