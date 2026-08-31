const { db } = require("../firestore.js");
const {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} = require("firebase/firestore");

async function createUser(uid, data) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, data, { merge: true });
  return { id: uid, ...data };
}

async function getUser(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

async function addUserInterest(uid, interestId) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { interests: arrayUnion(interestId) });
  return interestId;
}

async function removeUserInterest(uid, interestId) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { interests: arrayRemove(interestId) });
  return interestId;
}

async function addUserActivity(uid, activityId) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { activitiesTried: arrayUnion(activityId) });

  const activityRef = doc(db, "activities", activityId);
  await updateDoc(activityRef, { usersTried: arrayUnion(uid) });

  return activityId;
}

async function removeUserActivity(uid, activityId) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { activitiesTried: arrayRemove(activityId) });

  const activityRef = doc(db, "activities", activityId);
  await updateDoc(activityRef, { usersTried: arrayRemove(uid) });

  return activityId;
}

async function addUserPlace(uid, placeId) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { placesVisited: arrayUnion(placeId) });
  return placeId;
}

async function removeUserPlace(uid, placeId) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { placesVisited: arrayRemove(placeId) });
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
