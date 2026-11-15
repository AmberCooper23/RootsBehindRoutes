const { db, admin } = require("../firebaseConfig.js");

async function createPlace(data) {
  const docRef = await db.collection("places").add(data);

  if (Array.isArray(data.activityIds) && data.activityIds.length > 0) {
    await Promise.all(
      data.activityIds.map((activityId) =>
        db
          .collection("activities")
          .doc(activityId)
          .update({
            placeIds: admin.firestore.FieldValue.arrayUnion(docRef.id),
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
          typeof ref === "string" ? db.collection("categories").doc(ref) : ref;
        const snap = await categoryRef.get();
        return snap.exists ? snap.id : "";
      } catch (err) {
        console.error("❌ Failed to resolve category:", ref, err);
        return "";
      }
    }),
  );

  return categoryDocs.filter(Boolean);
}

async function getPlace(id) {
  const snap = await db.collection("places").doc(id).get();
  if (!snap.exists) return null;

  const data = { id: snap.id, ...snap.data() };
  data.categoryLabels = await resolveCategories(data.category);

  return data;
}

async function getAllPlaces() {
  const snapshot = await db.collection("places").get();

  const places = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() };
      data.categoryLabels = await resolveCategories(data.category);
      return data;
    }),
  );

  return places;
}

async function getPlacesByManager(uid) {
  const snapshot = await db
    .collection("places")
    .where("contributorId", "==", uid)
    .get();

  const places = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() };
      data.categoryLabels = await resolveCategories(data.category);
      return data;
    }),
  );

  return places;
}

async function updatePlace(id, data) {
  const placeRef = db.collection("places").doc(id);
  await placeRef.update(data);
  const snap = await placeRef.get();
  return { id: snap.id, ...snap.data() };
}

async function deletePlace(id) {
  const placeRef = db.collection("places").doc(id);
  await placeRef.delete();
  return { id };
}

module.exports = {
  createPlace,
  getPlace,
  getAllPlaces,
  getPlacesByManager,
  updatePlace,
  deletePlace,
};
