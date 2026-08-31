const { db, admin } = require("../firebaseConfig.js");

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

  return { id: docRef.id, ...data };
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
    .map((d) => d.data().rating)
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
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function getAllEndorsements() {
  const snapshot = await db.collection("endorsements").get();
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

module.exports = {
  createEndorsement,
  getEndorsement,
  getAllEndorsements,
};
