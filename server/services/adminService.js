const { db, admin } = require("../firebaseConfig.js");

const CONTENT_COLLECTIONS = ["places", "activities", "reviews", "endorsements"];
const VALID_STATUSES = ["pending", "approved", "rejected", "hidden"];

function normalizeStatus(data) {
  return data?.status || "approved";
}

async function listByStatus(status) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Invalid status");
  }
  const results = [];
  for (const col of CONTENT_COLLECTIONS) {
    const snap = await db.collection(col).where("status", "==", status).get();
    snap.forEach((doc) => {
      results.push({ id: doc.id, collection: col, ...doc.data() });
    });
  }
  results.sort((a, b) => {
    const ta = new Date(a.createdAt || 0).getTime();
    const tb = new Date(b.createdAt || 0).getTime();
    return tb - ta;
  });
  return results;
}

async function listPending() {
  return listByStatus("pending");
}

async function setContentStatus(collection, id, status) {
  if (!CONTENT_COLLECTIONS.includes(collection)) {
    throw new Error("Invalid content collection");
  }
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Invalid status");
  }
  await db.collection(collection).doc(id).update({
    status,
    isHidden: status === "hidden",
  });
  return { collection, id, status };
}

async function deleteContent(collection, id) {
  if (!CONTENT_COLLECTIONS.includes(collection)) {
    throw new Error("Invalid content collection");
  }
  await db.collection(collection).doc(id).delete();
  return { collection, id };
}

async function listUsers() {
  const snap = await db.collection("users").get();
  const users = [];
  snap.forEach((doc) => {
    const d = doc.data() || {};
    users.push({
      id: doc.id,
      displayName: d.displayName || d.name || "Unknown",
      role: d.role || "Explorer",
      banned: !!d.banned,
      suspendedUntil: d.suspendedUntil || null,
      photoURL: d.photoURL || null,
      email: d.email || null,
    });
  });
  users.sort((a, b) => {
    if (a.banned !== b.banned) return a.banned ? -1 : 1;
    return a.displayName.localeCompare(b.displayName);
  });
  return users;
}

async function banUser(uid) {
  await db.collection("users").doc(uid).update({
    banned: true,
    bannedAt: new Date().toISOString(),
  });
  return { uid, banned: true };
}

async function unbanUser(uid) {
  await db.collection("users").doc(uid).update({
    banned: false,
    bannedAt: admin.firestore.FieldValue.delete(),
  });
  return { uid, banned: false };
}

async function suspendUser(uid, untilIso) {
  await db.collection("users").doc(uid).update({
    suspendedUntil: untilIso,
  });
  return { uid, suspendedUntil: untilIso };
}

async function unsuspendUser(uid) {
  await db.collection("users").doc(uid).update({
    suspendedUntil: admin.firestore.FieldValue.delete(),
  });
  return { uid, suspendedUntil: null };
}

async function getModerationSummary() {
  const [usersSnap, placesSnap, activitiesSnap, reviewsSnap, endorsementsSnap] =
    await Promise.all([
      db.collection("users").get(),
      db.collection("places").get(),
      db.collection("activities").get(),
      db.collection("reviews").get(),
      db.collection("endorsements").get(),
    ]);

  let bannedUsers = 0;
  usersSnap.forEach((d) => {
    if (d.data()?.banned) bannedUsers += 1;
  });

  const countByStatus = (snap) => {
    const counts = { pending: 0, approved: 0, rejected: 0, hidden: 0 };
    snap.forEach((d) => {
      const s = normalizeStatus(d.data());
      if (counts[s] !== undefined) counts[s] += 1;
    });
    return counts;
  };

  return {
    users: { total: usersSnap.size, banned: bannedUsers },
    places: { total: placesSnap.size, ...countByStatus(placesSnap) },
    activities: {
      total: activitiesSnap.size,
      ...countByStatus(activitiesSnap),
    },
    reviews: { total: reviewsSnap.size, ...countByStatus(reviewsSnap) },
    endorsements: {
      total: endorsementsSnap.size,
      ...countByStatus(endorsementsSnap),
    },
  };
}

module.exports = {
  listByStatus,
  listPending,
  setContentStatus,
  deleteContent,
  listUsers,
  banUser,
  unbanUser,
  suspendUser,
  unsuspendUser,
  getModerationSummary,
};