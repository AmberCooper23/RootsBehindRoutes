const { db, admin } = require("../firebaseConfig.js");

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

module.exports = {
  createUser,
  getUser,
  addUserInterest,
  removeUserInterest,
  addUserActivity,
  removeUserActivity,
  addUserPlace,
  removeUserPlace,
};
