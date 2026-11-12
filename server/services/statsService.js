const { db } = require("../firebaseConfig.js");

async function getStats() {
  try {
    const placesSnap = await db.collection("places").get();
    const reviewsSnap = await db.collection("reviews").get();

    const touristsSnap = await db
      .collection("users")
      .where("role", "==", "tourist")
      .get();

    return {
      places: placesSnap.size,
      voices: reviewsSnap.size,
      travellers: touristsSnap.size,
    };
  } catch (err) {
    console.error("❌ Failed to fetch stats:", err);
    throw err;
  }
}

module.exports = {
  getStats,
};
