import { db } from "../firestore.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

export async function createUser(uid, data) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, data, { merge: true });
  return uid;
}

export async function getUser(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addUserInterest(uid, interestId) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { interests: arrayUnion(interestId) });
  return interestId;
}

export async function removeUserInterest(uid, interestId) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { interests: arrayRemove(interestId) });
  return interestId;
}

export async function addUserActivity(uid, activityId) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { activitiesTried: arrayUnion(activityId) });

  // Schema: activities.usersTried is the reverse side of users.activitiesTried.
  const activityRef = doc(db, "activities", activityId);
  await updateDoc(activityRef, { usersTried: arrayUnion(uid) });

  return activityId;
}

export async function removeUserActivity(uid, activityId) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { activitiesTried: arrayRemove(activityId) });

  const activityRef = doc(db, "activities", activityId);
  await updateDoc(activityRef, { usersTried: arrayRemove(uid) });

  return activityId;
}

export async function addUserPlace(uid, placeId) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { placesVisited: arrayUnion(placeId) });
  return placeId;
}

export async function removeUserPlace(uid, placeId) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { placesVisited: arrayRemove(placeId) });
  return placeId;
}
