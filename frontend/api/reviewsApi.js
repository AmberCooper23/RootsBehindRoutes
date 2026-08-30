const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/reviews`;

export async function fetchReview(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch review");
  return res.json();
}

export async function fetchAllReviews() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function addReview(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create review");
  return res.json();
}
