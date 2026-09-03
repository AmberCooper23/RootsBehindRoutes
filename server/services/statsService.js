const { db } = require("../firebaseConfig.js");

async function getStats() {
  try {
    const placesSnap = await db.collection("places").get();
    const reviewsSnap = await db.collection("reviews").get();
    const endorsementsSnap = await db.collection("endorsements").get();

    return {
      places: placesSnap.size,
      voices: reviewsSnap.size,
      travelers: endorsementsSnap.size,
    };
  } catch (err) {
    console.error("❌ Failed to fetch stats:", err);
    throw err;
  }
}

module.exports = {
  getStats,
};
