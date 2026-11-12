const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/manage`;

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

// Returns the business linked to the signed-in account, or null if the
// account isn't linked to one.
export async function fetchMyBusiness(token) {
  const res = await fetch(`${BASE_URL}/me`, { headers: authHeaders(token) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Couldn't load your business");
  return res.json();
}

export async function updateMyBusiness(token, data) {
  const res = await fetch(`${BASE_URL}/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Couldn't save your changes");
  return body;
}
