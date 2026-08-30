const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/posts`;

export async function fetchPost(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
}

export async function fetchAllPosts() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function addPost(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
}
