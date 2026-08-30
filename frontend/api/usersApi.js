const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/users`;

export async function fetchUser(uid) {
  const res = await fetch(`${BASE_URL}/${uid}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function addUser(uid, data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, data }),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

export async function addUserInterest(uid, interestId) {
  const res = await fetch(`${BASE_URL}/${uid}/interests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interestId }),
  });
  if (!res.ok) throw new Error("Failed to add interest");
  return res.json();
}

export async function removeUserInterest(uid, interestId) {
  const res = await fetch(`${BASE_URL}/${uid}/interests/${interestId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove interest");
  return res.json();
}

export async function addUserActivity(uid, activityId) {
  const res = await fetch(`${BASE_URL}/${uid}/activities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activityId }),
  });
  if (!res.ok) throw new Error("Failed to add activity");
  return res.json();
}

export async function removeUserActivity(uid, activityId) {
  const res = await fetch(`${BASE_URL}/${uid}/activities/${activityId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove activity");
  return res.json();
}

export async function addUserPlace(uid, placeId) {
  const res = await fetch(`${BASE_URL}/${uid}/places`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ placeId }),
  });
  if (!res.ok) throw new Error("Failed to add place");
  return res.json();
}

export async function removeUserPlace(uid, placeId) {
  const res = await fetch(`${BASE_URL}/${uid}/places/${placeId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove place");
  return res.json();
}
