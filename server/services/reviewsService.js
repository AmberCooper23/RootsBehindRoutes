import { db } from "../firestore.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

export async function createReview(data) {
  const reviewsRef = collection(db, "reviews");
  const docRef = await addDoc(reviewsRef, data);

  // Schema: a review belongs to either a place OR an activity, never both.
  if (data.placeId) {
    await updateDoc(doc(db, "places", data.placeId), {
      reviewIds: arrayUnion(docRef.id),
    });
  } else if (data.activityId) {
    await updateDoc(doc(db, "activities", data.activityId), {
      reviewIds: arrayUnion(docRef.id),
    });
  }

  return docRef.id;
}

export async function getReview(id) {
  const reviewRef = doc(db, "reviews", id);
  const snap = await getDoc(reviewRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getAllReviews() {
  const reviewsRef = collection(db, "reviews");
  const snap = await getDocs(reviewsRef);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
