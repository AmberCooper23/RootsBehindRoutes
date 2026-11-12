const { db, admin } = require("./firebaseConfig");
const data = require("./backfill.json");

const cleanId = (id) => {
  if (!id) return null;
  return id.split("/").pop();
};

async function backfill() {
  console.log("🔍 Fetching real users...");

  // 1. Get all real users from your database
  const usersSnap = await db.collection("users").get();
  const realUsers = [];

  usersSnap.forEach((doc) => {
    const userData = doc.data();
    // Only add users that actually have a displayName
    if (userData.displayName) {
      realUsers.push({
        id: doc.id,
        name: userData.displayName,
      });
    }
  });

  if (realUsers.length === 0) {
    console.log(
      "❌ No real users found in the database. Please create a user first.",
    );
    process.exit(1);
  }

  console.log(
    `✅ Found ${realUsers.length} real user(s). Assigning reviews to them...\n`,
  );

  let userIndex = 0;

  for (const entry of data) {
    const cleanPlaceId = cleanId(entry.placeId);
    const cleanActivityId = cleanId(entry.activityId);

    // 2. Pick the next real user in the list (loops back to start if we run out)
    const assignedUser = realUsers[userIndex % realUsers.length];
    userIndex++;

    if (entry.type === "review") {
      await db
        .collection("reviews")
        .doc(entry.id)
        .set({
          activityId: cleanActivityId,
          placeId: cleanPlaceId,
          userId: assignedUser.id, // 👈 Real UID
          userDisplayName: assignedUser.name, // 👈 Real Name
          rating: entry.rating,
          content: entry.content,
          createdAt: admin.firestore.Timestamp.fromDate(
            new Date(entry.createdAt),
          ),
        });
      console.log(`Inserted review: ${entry.id} (by ${assignedUser.name})`);
    } else if (entry.type === "endorsement") {
      await db
        .collection("endorsements")
        .doc(entry.id)
        .set({
          activityId: cleanActivityId,
          placeId: cleanPlaceId,
          userId: assignedUser.id, // 👈 Real UID
          userDisplayName: assignedUser.name, // 👈 Real Name
          score: entry.score,
          content: entry.content,
          createdAt: admin.firestore.Timestamp.fromDate(
            new Date(entry.createdAt),
          ),
        });
      console.log(
        `Inserted endorsement: ${entry.id} (by ${assignedUser.name})`,
      );
    }
  }
}

async function run() {
  await backfill();
  console.log(
    "\n✅ Backfill complete! All reviews are now linked to real users.",
  );
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});
