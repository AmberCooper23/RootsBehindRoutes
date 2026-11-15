const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/places`;

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

export async function fetchManagerPlaces(uid) {
  const res = await fetch(`${BASE_URL}/manager/${uid}`);
  if (!res.ok) throw new Error("Failed to fetch manager places");
  return res.json();
}

export async function updateManagerPlace(id, data) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update place");
  return res.json();
}

export async function deleteManagerPlace(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete place");
  return res.json();
}
