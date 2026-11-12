const { db, admin } = require("./firebaseConfig");
const data = require("./backfill.json");

const cleanId = (id) => {
  if (!id) return null;
  return id.split("/").pop();
};

async function backfill() {
  console.log("🔍 Fetching real users and sorting by role...");

  const usersSnap = await db.collection("users").get();
  const touristUsers = [];
  const localUsers = [];

  usersSnap.forEach((doc) => {
    const userData = doc.data();
    if (!userData.displayName) return;

    const userObj = { id: doc.id, name: userData.displayName };

    // Sort them based on the 'role' field in your database
    if (userData.role === "local") {
      localUsers.push(userObj);
    } else {
      // Default to tourist if role is missing or set to tourist
      touristUsers.push(userObj);
    }
  });

  console.log(
    `✅ Found ${touristUsers.length} Tourist(s) and ${localUsers.length} Local(s).\n`,
  );

  let tIndex = 0;
  let lIndex = 0;

  for (const entry of data) {
    const cleanPlaceId = cleanId(entry.placeId);
    const cleanActivityId = cleanId(entry.activityId);

    let assignedUser = { id: cleanId(entry.userId), name: "Anonymous" };

    // Strictly separate the logic based on the entry type
    if (entry.type === "review") {
      if (touristUsers.length > 0) {
        assignedUser = touristUsers[tIndex % touristUsers.length];
        tIndex++;
      } else {
        assignedUser.name = "Traveler";
      }
    } else if (entry.type === "endorsement") {
      if (localUsers.length > 0) {
        assignedUser = localUsers[lIndex % localUsers.length];
        lIndex++;
      } else {
        assignedUser.name = "Local Guide";
      }
    }

    if (entry.type === "review") {
      await db
        .collection("reviews")
        .doc(entry.id)
        .set({
          activityId: cleanActivityId,
          placeId: cleanPlaceId,
          userId: assignedUser.id,
          userDisplayName: assignedUser.name,
          rating: entry.rating,
          content: entry.content,
          createdAt: admin.firestore.Timestamp.fromDate(
            new Date(entry.createdAt),
          ),
        });
      console.log(
        `Inserted review: ${entry.id} (by Tourist: ${assignedUser.name})`,
      );
    } else if (entry.type === "endorsement") {
      await db
        .collection("endorsements")
        .doc(entry.id)
        .set({
          activityId: cleanActivityId,
          placeId: cleanPlaceId,
          userId: assignedUser.id,
          userDisplayName: assignedUser.name,
          score: entry.score,
          content: entry.content,
          createdAt: admin.firestore.Timestamp.fromDate(
            new Date(entry.createdAt),
          ),
        });
      console.log(
        `Inserted endorsement: ${entry.id} (by Local: ${assignedUser.name})`,
      );
    }
  }
}

async function run() {
  await backfill();
  console.log("\n✅ Backfill complete!");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});
