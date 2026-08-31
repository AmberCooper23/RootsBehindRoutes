const { db } = require("../firestore.js");
const {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} = require("firebase/firestore");

async function createPlace(data) {
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

  return { id: docRef.id, ...data };
}

async function resolveCategories(categories) {
  if (!Array.isArray(categories) || categories.length === 0) return [];

  const categoryDocs = await Promise.all(
    categories.map(async (ref) => {
      try {
        const categoryRef =
          typeof ref === "string" ? doc(db, "categories", ref) : ref;
        const snap = await getDoc(categoryRef);
        return snap.exists() ? snap.id : "";
      } catch (err) {
        console.error("Failed to resolve category:", ref, err);
        return "";
      }
    }),
  );

  return categoryDocs.filter(Boolean);
}

async function getPlace(id) {
  const placeRef = doc(db, "places", id);
  const snap = await getDoc(placeRef);
  if (!snap.exists()) return null;

  const data = { id: snap.id, ...snap.data() };
  data.categoryLabels = await resolveCategories(data.category);

  return data;
}

async function getAllPlaces() {
  const placesRef = collection(db, "places");
  const snap = await getDocs(placesRef);

  const places = await Promise.all(
    snap.docs.map(async (docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() };
      data.categoryLabels = await resolveCategories(data.category);
      return data;
    }),
  );

  return places;
}

module.exports = {
  createPlace,
  getPlace,
  getAllPlaces,
};
