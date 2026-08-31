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

async function createActivity(data) {
  const activitiesRef = collection(db, "activities");
  const docRef = await addDoc(activitiesRef, data);

  if (Array.isArray(data.placeIds) && data.placeIds.length > 0) {
    await Promise.all(
      data.placeIds.map((placeId) =>
        updateDoc(doc(db, "places", placeId), {
          activityIds: arrayUnion(docRef.id),
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

async function getActivity(id) {
  const activityRef = doc(db, "activities", id);
  const snap = await getDoc(activityRef);
  if (!snap.exists()) return null;

  const data = { id: snap.id, ...snap.data() };
  data.categoryLabels = await resolveCategories(data.category);

  return data;
}

async function getAllActivities() {
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

module.exports = {
  createActivity,
  getActivity,
  getAllActivities,
};
