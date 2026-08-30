const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/endorsements`;

export async function fetchEndorsement(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch endorsement");
  return res.json();
}

export async function fetchAllEndorsements() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch endorsements");
  return res.json();
}

export async function addEndorsement(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create endorsement");
  return res.json();
}
