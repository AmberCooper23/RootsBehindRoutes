const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function addBookmark(userId, itemPath) {
  const res = await fetch(`${API_BASE}/api/bookmarks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, itemPath }),
  });
  return res.json();
}

export async function getBookmarks(userId) {
  const res = await fetch(`${API_BASE}/api/bookmarks/${userId}`);
  return res.json();
}

export async function removeBookmark(id) {
  const res = await fetch(`${API_BASE}/api/bookmarks/${id}`, {
    method: "DELETE",
  });
  return res.json();
}
