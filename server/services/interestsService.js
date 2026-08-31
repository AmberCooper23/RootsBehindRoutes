const { db } = require("../firebaseConfig.js");

async function createInterest(id, data) {
  const interestRef = db.collection("interests").doc(id);
  await interestRef.set(data, { merge: true });
  return { id, ...data };
}

async function getInterest(id) {
  const snap = await db.collection("interests").doc(id).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function getAllInterests() {
  const snapshot = await db.collection("interests").get();
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

module.exports = {
  createInterest,
  getInterest,
  getAllInterests,
};
