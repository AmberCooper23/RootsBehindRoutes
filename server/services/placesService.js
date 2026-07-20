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

export async function createPlace(data) {
  const placesRef = collection(db, "places");
  const docRef = await addDoc(placesRef, data);

  // Schema: activities.placeIds is the reverse side of places.activityIds.
  // If activityIds were provided on creation, keep those activities in sync.
  if (Array.isArray(data.activityIds) && data.activityIds.length > 0) {
    await Promise.all(
      data.activityIds.map((activityId) =>
        updateDoc(doc(db, "activities", activityId), {
          placeIds: arrayUnion(docRef.id),
        }),
      ),
    );
  }

  return docRef.id;
}

export async function getPlace(id) {
  const placeRef = doc(db, "places", id);
  const snap = await getDoc(placeRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getAllPlaces() {
  const placesRef = collection(db, "places");
  const snap = await getDocs(placesRef);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
