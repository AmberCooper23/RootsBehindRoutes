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

async function resolveCategories(categories) {
  if (!Array.isArray(categories) || categories.length === 0) return [];

  const categoryDocs = await Promise.all(
    categories.map(async (ref) => {
      try {
        // Support both: array of DocumentReferences, or array of category ID strings
        const categoryRef =
          typeof ref === "string" ? doc(db, "categories", ref) : ref;
        const snap = await getDoc(categoryRef);
        // Category docs are keyed by slug (e.g. categories/heritage_site),
        // and that slug is what Filter.jsx's category options match against,
        // so use the doc id itself as the label rather than a "name" field.
        return snap.exists() ? snap.id : "";
      } catch (err) {
        console.error("Failed to resolve category:", ref, err);
        return "";
      }
    }),
  );

  return categoryDocs.filter(Boolean);
}

export async function getActivity(id) {
  const activityRef = doc(db, "activities", id);
  const snap = await getDoc(activityRef);
  if (!snap.exists()) return null;

  const data = { id: snap.id, ...snap.data() };
  data.categoryLabels = await resolveCategories(data.category);

  return data;
}

export async function getAllActivities() {
  const activitiesRef = collection(db, "activities");
  const snap = await getDocs(activitiesRef);

  const activities = await Promise.all(
    snap.docs.map(async (docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() };
      data.categoryLabels = await resolveCategories(data.category);
      return data;
    }),
  );

  return activities;
}
