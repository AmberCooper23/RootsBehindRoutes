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

export async function createEndorsement(data) {
  const endorsementsRef = collection(db, "endorsements");
  const docRef = await addDoc(endorsementsRef, data);

  // Schema: an endorsement belongs to either a place OR an activity, never both.
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

// Keeps the target's endorsementIds array in sync, then recomputes its
// localRating as the live average of every endorsement rating it has.
async function syncTargetRating(
  collectionName,
  foreignKeyField,
  targetId,
  endorsementId,
) {
  const targetRef = doc(db, collectionName, targetId);

  await updateDoc(targetRef, {
    endorsementIds: arrayUnion(endorsementId),
  });

  const endorsementsQuery = query(
    collection(db, "endorsements"),
    where(foreignKeyField, "==", targetId),
  );
  const snap = await getDocs(endorsementsQuery);

  const ratings = snap.docs
    .map((d) => d.data().rating)
    .filter((r) => typeof r === "number");

  if (ratings.length > 0) {
    const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    await updateDoc(targetRef, {
      localRating: Math.round(average * 10) / 10,
      endorsementCount: ratings.length,
    });
  }
}

export async function getEndorsement(id) {
  const endorsementRef = doc(db, "endorsements", id);
  const snap = await getDoc(endorsementRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getAllEndorsements() {
  const endorsementsRef = collection(db, "endorsements");
  const snap = await getDocs(endorsementsRef);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
