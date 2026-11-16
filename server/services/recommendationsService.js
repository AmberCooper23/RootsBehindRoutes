const { db } = require("../firebaseConfig.js");

async function createRecommendation(data) {
  const docRef = await db.collection("recommendations").add({
    ...data,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  return { id: docRef.id, ...data, status: "pending" };
}

async function getRecommendations() {
  const snap = await db
    .collection("recommendations")
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function updateRecommendationStatus(id, status) {
  await db.collection("recommendations").doc(id).update({ status });
  return { id, status };
}

module.exports = {
  createRecommendation,
  getRecommendations,
  updateRecommendationStatus,
};
