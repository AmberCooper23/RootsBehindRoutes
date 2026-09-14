const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const data = require("./backfill.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function backfill() {
  for (const entry of data) {
    if (entry.type === "review") {
      await db
        .collection("reviews")
        .doc(entry.id)
        .set({
          activityId: entry.activityId,
          placeId: entry.placeId,
          userId: entry.userId,
          rating: entry.rating,
          content: entry.content,
          createdAt: admin.firestore.Timestamp.fromDate(
            new Date(entry.createdAt),
          ),
        });
      console.log(`Inserted review: ${entry.id}`);
    } else if (entry.type === "endorsement") {
      await db
        .collection("endorsements")
        .doc(entry.id)
        .set({
          activityId: entry.activityId,
          placeId: entry.placeId,
          userId: entry.userId,
          score: entry.score,
          content: entry.content,
          createdAt: admin.firestore.Timestamp.fromDate(
            new Date(entry.createdAt),
          ),
        });
      console.log(`Inserted endorsement: ${entry.id}`);
    }
  }
}

backfill()
  .then(() => {
    console.log("✅ Backfill complete!");
  })
  .catch((err) => {
    console.error("❌ Backfill failed:", err);
  });
