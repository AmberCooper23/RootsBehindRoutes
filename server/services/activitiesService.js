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

export async function createActivity(data) {
  const activitiesRef = collection(db, "activities");
  const docRef = await addDoc(activitiesRef, data);

  // Schema: places.activityIds is the reverse side of activities.placeIds.
  // If placeIds were provided on creation, keep those places in sync.
  if (Array.isArray(data.placeIds) && data.placeIds.length > 0) {
    await Promise.all(
      data.placeIds.map((placeId) =>
        updateDoc(doc(db, "places", placeId), {
          activityIds: arrayUnion(docRef.id),
        }),
      ),
    );
  }

  return docRef.id;
}

export async function getActivity(id) {
  const activityRef = doc(db, "activities", id);
  const snap = await getDoc(activityRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getAllActivities() {
  const activitiesRef = collection(db, "activities");
  const snap = await getDocs(activitiesRef);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
