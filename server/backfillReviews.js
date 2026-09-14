const { db, admin } = require("./firebaseConfig");
const data = require("./backfill.json");

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

async function run() {
  await backfill();
  console.log("✅ Backfill complete!");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});
