const { db , admin } = require("./firebaseConfig");

const defaultHours = {
  monday: { open: "08:00", close: "16:00" },
  tuesday: { open: "08:00", close: "16:00" },
  wednesday: { open: "08:00", close: "16:00" },
  thursday: { open: "08:00", close: "16:00" },
  friday: { open: "08:00", close: "16:00" },
  saturday: { open: "09:00", close: "13:00" },
  sunday: null,
};

async function backfillHours(collectionName) {
  const snapshot = await db.collection(collectionName).get();

  if (snapshot.empty) {
    console.log(`No documents found in "${collectionName}"`);
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { hours: defaultHours });
  });

  await batch.commit();
  console.log(
    `✅ Backfilled hours for ${snapshot.size} documents in "${collectionName}"`,
  );
}

async function run() {
  await backfillHours("places");
  await backfillHours("activities");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});
