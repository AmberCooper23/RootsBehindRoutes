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

export async function getPlace(id) {
  const placeRef = doc(db, "places", id);
  const snap = await getDoc(placeRef);
  if (!snap.exists()) return null;

  const data = { id: snap.id, ...snap.data() };
  // Firestore field is "category" (singular), not "categories"
  data.categoryLabels = await resolveCategories(data.category);

  return data;
}

export async function getAllPlaces() {
  const placesRef = collection(db, "places");
  const snap = await getDocs(placesRef);

  const places = await Promise.all(
    snap.docs.map(async (docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() };
      // Firestore field is "category" (singular), not "categories"
      data.categoryLabels = await resolveCategories(data.category);
      return data;
    }),
  );

  return places;
}