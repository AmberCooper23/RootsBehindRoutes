const { db, admin } = require("../firebaseConfig.js");

async function createActivity(data) {
  const docRef = await db.collection("activities").add(data);

  if (Array.isArray(data.placeIds) && data.placeIds.length > 0) {
    await Promise.all(
      data.placeIds.map((placeId) =>
        db
          .collection("places")
          .doc(placeId)
          .update({
            activityIds: admin.firestore.FieldValue.arrayUnion(docRef.id),
          })
      )
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
    })
  );

  return categoryDocs.filter(Boolean);
}

async function getActivity(id) {
  const snap = await db.collection("activities").doc(id).get();
  if (!snap.exists) return null;

  const data = { id: snap.id, ...snap.data() };
  data.categoryLabels = await resolveCategories(data.category);

  return data;
}

async function getAllActivities() {
  const snapshot = await db.collection("activities").get();

  const activities = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() };
      data.categoryLabels = await resolveCategories(data.category);
      return data;
    })
  );

  return activities;
}

module.exports = {
  createActivity,
  getActivity,
  getAllActivities,
};
