const { db, admin } = require("../firebaseConfig.js");

function isManagerRole(role) {
  return typeof role === "string" && role.toLowerCase() === "manager";
}

async function createUser(uid, data) {
  const userRef = db.collection("users").doc(uid);
  await userRef.set(data, { merge: true });
  return { id: uid, ...data };
}

async function getUser(uid) {
  const snap = await db.collection("users").doc(uid).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function addUserInterest(uid, interestId) {
  const userRef = db.collection("users").doc(uid);
  await userRef.update({
    interests: admin.firestore.FieldValue.arrayUnion(interestId),
  });
  return interestId;
}

async function removeUserInterest(uid, interestId) {
  const userRef = db.collection("users").doc(uid);
  await userRef.update({
    interests: admin.firestore.FieldValue.arrayRemove(interestId),
  });
  return interestId;
}

async function addUserActivity(uid, activityId) {
  const userRef = db.collection("users").doc(uid);
  await userRef.update({
    activitiesTried: admin.firestore.FieldValue.arrayUnion(activityId),
  });

  const activityRef = db.collection("activities").doc(activityId);
  await activityRef.update({
    usersTried: admin.firestore.FieldValue.arrayUnion(uid),
  });

  return activityId;
}

async function removeUserActivity(uid, activityId) {
  const userRef = db.collection("users").doc(uid);
  await userRef.update({
    activitiesTried: admin.firestore.FieldValue.arrayRemove(activityId),
  });

  const activityRef = db.collection("activities").doc(activityId);
  await activityRef.update({
    usersTried: admin.firestore.FieldValue.arrayRemove(uid),
  });

  return activityId;
}

async function addUserPlace(uid, placeId) {
  const userRef = db.collection("users").doc(uid);
  await userRef.update({
    placesVisited: admin.firestore.FieldValue.arrayUnion(placeId),
  });
  return placeId;
}

async function removeUserPlace(uid, placeId) {
  const userRef = db.collection("users").doc(uid);
  await userRef.update({
    placesVisited: admin.firestore.FieldValue.arrayRemove(placeId),
  });
  return placeId;
}

async function followUser(followerId, followeeId) {
  if (followerId === followeeId) throw new Error("Cannot follow yourself");

  const [followerSnap, followeeSnap] = await Promise.all([
    db.collection("users").doc(followerId).get(),
    db.collection("users").doc(followeeId).get(),
  ]);

  if (isManagerRole(followerSnap.data()?.role)) {
    throw new Error("Managers cannot follow users");
  }
  if (isManagerRole(followeeSnap.data()?.role)) {
    throw new Error("Managers cannot be followed");
  }

  const batch = db.batch();
  batch.update(db.collection("users").doc(followerId), {
    following: admin.firestore.FieldValue.arrayUnion(followeeId),
  });
  batch.update(db.collection("users").doc(followeeId), {
    followers: admin.firestore.FieldValue.arrayUnion(followerId),
  });
  await batch.commit();
  return followeeId;
}

async function unfollowUser(followerId, followeeId) {
  const batch = db.batch();
  batch.update(db.collection("users").doc(followerId), {
    following: admin.firestore.FieldValue.arrayRemove(followeeId),
  });
  batch.update(db.collection("users").doc(followeeId), {
    followers: admin.firestore.FieldValue.arrayRemove(followerId),
  });
  await batch.commit();
  return followeeId;
}

async function getFollowers(uid) {
  const user = await getUser(uid);
  if (isManagerRole(user?.role)) return [];
  const ids = user?.followers || [];
  if (!ids.length) return [];
  const snaps = await db.getAll(
    ...ids.map((id) => db.collection("users").doc(id)),
  );
  return snaps.filter((s) => s.exists).map((s) => ({ id: s.id, ...s.data() }));
}

async function getFollowing(uid) {
  const user = await getUser(uid);
  if (isManagerRole(user?.role)) return [];
  const ids = user?.following || [];
  if (!ids.length) return [];
  const snaps = await db.getAll(
    ...ids.map((id) => db.collection("users").doc(id)),
  );
  return snaps.filter((s) => s.exists).map((s) => ({ id: s.id, ...s.data() }));
}

module.exports = {
  createUser,
  getUser,
  addUserInterest,
  removeUserInterest,
  addUserActivity,
  removeUserActivity,
  addUserPlace,
  removeUserPlace,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
