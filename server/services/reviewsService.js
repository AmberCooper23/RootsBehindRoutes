const { db, admin } = require("../firebaseConfig.js");

function normalizeRef(value) {
  if (value && typeof value === "object" && typeof value.id === "string") {
    return value.id;
  }
  return value ?? null;
}

async function attachUserDisplayName(review) {
  if (!review.userId) return review;
  const userSnap = await db.collection("users").doc(review.userId).get();
  if (userSnap.exists) {
    return { ...review, userDisplayName: userSnap.data().displayName };
  }
  return { ...review, userDisplayName: null };
}

function normalizeReview(data) {
  return {
    ...data,
    placeId: normalizeRef(data.placeId),
    activityId: normalizeRef(data.activityId),
    userId: normalizeRef(data.userId),
  };
}

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

  const review = normalizeReview({ id: docRef.id, ...data });
  return attachUserDisplayName(review);
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
  if (!snap.exists) return null;
  const review = normalizeReview({ id: snap.id, ...snap.data() });
  return attachUserDisplayName(review);
}

async function getAllReviews() {
  const snapshot = await db.collection("reviews").get();
  const reviews = snapshot.docs.map((docSnap) =>
    normalizeReview({ id: docSnap.id, ...docSnap.data() }),
  );
  return Promise.all(reviews.map(attachUserDisplayName));
}

module.exports = {
  createReview,
  getReview,
  getAllReviews,
};
