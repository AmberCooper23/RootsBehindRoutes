const { db, admin } = require("../firebaseConfig.js");

async function createReview(data) {
  const docRef = await db.collection("reviews").add(data);

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
  reviewId,
) {
  const targetRef = db.collection(collectionName).doc(targetId);

  await targetRef.update({
    reviewIds: admin.firestore.FieldValue.arrayUnion(reviewId),
  });

  const snap = await db
    .collection("reviews")
    .where(foreignKeyField, "==", targetId)
    .get();

  const ratings = snap.docs
    .map((d) => d.data().rating)
    .filter((r) => typeof r === "number");

  if (ratings.length > 0) {
    const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    await targetRef.update({
      touristRating: Math.round(average * 10) / 10,
      reviewCount: ratings.length,
    });
  }
}

async function getReview(id) {
  const snap = await db.collection("reviews").doc(id).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function getAllReviews() {
  const snapshot = await db.collection("reviews").get();
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

module.exports = {
  createReview,
  getReview,
  getAllReviews,
};
