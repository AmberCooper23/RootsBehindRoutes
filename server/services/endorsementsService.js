const { db } = require("../firestore.js");
const {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
} = require("firebase/firestore");

async function createEndorsement(data) {
  const endorsementsRef = collection(db, "endorsements");
  const docRef = await addDoc(endorsementsRef, data);

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
  const targetRef = doc(db, collectionName, targetId);

  await updateDoc(targetRef, {
    endorsementIds: arrayUnion(endorsementId),
  });

  const endorsementsQuery = query(
    collection(db, "endorsements"),
    where(foreignKeyField, "==", targetId),
  );
  const snap = await getDocs(endorsementsQuery);

  const ratings = snap.docs
    .map((d) => d.data().rating)
    .filter((r) => typeof r === "number");

  if (ratings.length > 0) {
    const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    await updateDoc(targetRef, {
      localRating: Math.round(average * 10) / 10,
      endorsementCount: ratings.length,
    });
  }
}

async function getEndorsement(id) {
  const endorsementRef = doc(db, "endorsements", id);
  const snap = await getDoc(endorsementRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

async function getAllEndorsements() {
  const endorsementsRef = collection(db, "endorsements");
  const snap = await getDocs(endorsementsRef);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

module.exports = {
  createEndorsement,
  getEndorsement,
  getAllEndorsements,
};
