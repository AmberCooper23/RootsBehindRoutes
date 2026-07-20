const BASE_URL = "http://localhost:5000/api/comments";

export async function fetchComment(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch comment");
  return res.json();
}

export async function fetchAllComments() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

export async function addComment(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create comment");
  return res.json();
}
