const { db, admin } = require("../firebaseConfig.js");

// placeId/activityId can be stored either as a plain string ID or as a
// Firestore DocumentReference (e.g. docs created manually in the console).
// Normalize to a plain string so the rest of the app can compare/filter
// consistently regardless of how a given document was created.
function normalizeRef(value) {
  if (value && typeof value === "object" && typeof value.id === "string") {
    return value.id;
  }
  return value ?? null;
}

function normalizeEndorsement(data) {
  return {
    ...data,
    placeId: normalizeRef(data.placeId),
    activityId: normalizeRef(data.activityId),
    userId: normalizeRef(data.userId),
  };
}

async function createEndorsement(data) {
  const docRef = await db.collection("endorsements").add(data);

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

  return normalizeEndorsement({ id: docRef.id, ...data });
}

async function syncTargetRating(
  collectionName,
  foreignKeyField,
  targetId,
  endorsementId,
) {
  const targetRef = db.collection(collectionName).doc(targetId);

  await targetRef.update({
    endorsementIds: admin.firestore.FieldValue.arrayUnion(endorsementId),
  });

  const snap = await db
    .collection("endorsements")
    .where(foreignKeyField, "==", targetId)
    .get();

  const ratings = snap.docs
    .map((d) => {
      const data = d.data();
      return typeof data.score === "number" ? data.score : data.rating;
    })
    .filter((r) => typeof r === "number");

  if (ratings.length > 0) {
    const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    await targetRef.update({
      localRating: Math.round(average * 10) / 10,
      endorsementCount: ratings.length,
    });
  }
}

async function getEndorsement(id) {
  const snap = await db.collection("endorsements").doc(id).get();
  return snap.exists
    ? normalizeEndorsement({ id: snap.id, ...snap.data() })
    : null;
}

async function getAllEndorsements() {
  const snapshot = await db.collection("endorsements").get();
  return snapshot.docs.map((docSnap) =>
    normalizeEndorsement({ id: docSnap.id, ...docSnap.data() }),
  );
}

module.exports = {
  createEndorsement,
  getEndorsement,
  getAllEndorsements,
};
