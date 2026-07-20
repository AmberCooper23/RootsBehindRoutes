import { db } from "../firestore.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
} from "firebase/firestore";

export async function createReview(data) {
  const reviewsRef = collection(db, "reviews");
  const docRef = await addDoc(reviewsRef, data);

  // Schema: a review belongs to either a place OR an activity, never both.
  if (data.placeId) {
    await syncTargetRating("places", "placeId", data.placeId, docRef.id);
  } else if (data.activityId) {
    await syncTargetRating(
      "activities",
      "activityId",
      data.activityId,
      docRef.id,
    );
  }

  return docRef.id;
}

// Keeps the target's reviewIds array in sync, then recomputes its
// touristRating as the live average of every review rating it has.
async function syncTargetRating(
  collectionName,
  foreignKeyField,
  targetId,
  reviewId,
) {
  const targetRef = doc(db, collectionName, targetId);

  await updateDoc(targetRef, {
    reviewIds: arrayUnion(reviewId),
  });

  const reviewsQuery = query(
    collection(db, "reviews"),
    where(foreignKeyField, "==", targetId),
  );
  const snap = await getDocs(reviewsQuery);

  const ratings = snap.docs
    .map((d) => d.data().rating)
    .filter((r) => typeof r === "number");

  if (ratings.length > 0) {
    const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    await updateDoc(targetRef, {
      touristRating: Math.round(average * 10) / 10,
      reviewCount: ratings.length,
    });
  }
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
