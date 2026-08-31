const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/places`;

export async function fetchPlace(id) {
  console.log("➡️ Fetching single place:", id);
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) {
    console.error("❌ Failed to fetch place:", res.status, res.statusText);
    throw new Error("Failed to fetch place");
  }
  const data = await res.json();
  console.log("✅ Place fetched:", data);
  return data;
}

export async function fetchAllPlaces() {
  console.log("➡️ Fetching all places...");
  const res = await fetch(BASE_URL);
  if (!res.ok) {
    console.error("❌ Failed to fetch places:", res.status, res.statusText);
    throw new Error("Failed to fetch places");
  }
  const data = await res.json();
  console.log("✅ Places fetched:", data);
  return data;
}

export async function addPlace(data) {
  console.log("➡️ Adding new place:", data);
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    console.error("❌ Failed to create place:", res.status, res.statusText);
    throw new Error("Failed to create place");
  }
  const result = await res.json();
  console.log("✅ Place created:", result);
  return result;
}
