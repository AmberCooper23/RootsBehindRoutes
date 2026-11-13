const { db } = require("../firebaseConfig.js");

async function getStats() {
  try {
    const placesSnap = await db.collection("places").get();
    const activitiesSnap = await db.collection("activities").get();

    const touristsSnap = await db
      .collection("users")
      .where("role", "==", "tourist")
      .get();

    const localsSnap = await db
      .collection("users")
      .where("role", "==", "local")
      .get();

    return {
      experiences: placesSnap.size + activitiesSnap.size,
      voices: localsSnap.size,
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
