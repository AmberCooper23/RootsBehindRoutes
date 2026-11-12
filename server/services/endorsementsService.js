const { db, admin } = require("../firebaseConfig.js");

function normalizeRef(value) {
  if (value && typeof value === "object" && typeof value.id === "string") {
    return value.id;
  }
  return value ?? null;
}

// Fallback for endorsements missing names
async function attachUserDisplayName(endorsement) {
  if (endorsement.userDisplayName) return endorsement;
  if (!endorsement.userId) return endorsement;

  try {
    const userSnap = await db.collection("users").doc(endorsement.userId).get();
    if (userSnap.exists) {
      return {
        ...endorsement,
        userDisplayName: userSnap.data().displayName || "Local Guide",
      };
    }
  } catch (err) {
    console.error("❌ Error fetching user for endorsement:", err);
  }
  return { ...endorsement, userDisplayName: "Local Guide" };
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
  let userDisplayName = "Local Guide";
  const uid = normalizeRef(data.userId);

  if (uid) {
    try {
      const userSnap = await db.collection("users").doc(uid).get();
      if (userSnap.exists && userSnap.data().displayName) {
        userDisplayName = userSnap.data().displayName;
      }
    } catch (err) {
      console.error("Failed to fetch user for new endorsement:", err);
    }
  }

  const endorsementData = { ...data, userDisplayName };
  const docRef = await db.collection("endorsements").add(endorsementData);

  const placeId = normalizeRef(data.placeId);
  const activityId = normalizeRef(data.activityId);

  if (placeId) {
    await syncTargetRating("places", "placeId", placeId, docRef.id);
  } else if (activityId) {
    await syncTargetRating("activities", "activityId", activityId, docRef.id);
  }

  return normalizeEndorsement({ id: docRef.id, ...endorsementData });
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
  if (!snap.exists) return null;
  const endorsement = normalizeEndorsement({ id: snap.id, ...snap.data() });
  return attachUserDisplayName(endorsement);
}

async function getAllEndorsements() {
  const snapshot = await db.collection("endorsements").get();
  const endorsements = snapshot.docs.map((docSnap) =>
    normalizeEndorsement({ id: docSnap.id, ...docSnap.data() }),
  );
  return Promise.all(endorsements.map(attachUserDisplayName));
}

async function addReplyToEndorsement(endorsementId, replyData) {
  const endorsementRef = db.collection("endorsements").doc(endorsementId);

  const newReply = {
    id: Date.now().toString(),
    ...replyData,
    createdAt: new Date().toISOString(),
  };

  await endorsementRef.update({
    replies: admin.firestore.FieldValue.arrayUnion(newReply),
  });

  return newReply;
}

module.exports = {
  createEndorsement,
  getEndorsement,
  getAllEndorsements,
  addReplyToEndorsement,
};
