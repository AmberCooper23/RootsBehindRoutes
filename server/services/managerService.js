const { db } = require("../firebaseConfig.js");

// A business account is linked to exactly one place OR one activity through
// that document's single `managerUid` field.
const TARGETS = [
  { type: "place", collection: "places", feedbackField: "placeId" },
  { type: "activity", collection: "activities", feedbackField: "activityId" },
];

// Turns Firestore Timestamps into ISO strings and DocumentReferences into
// path strings so the result is plain, safe JSON.
function serialize(value) {
  if (value === null || typeof value !== "object") return value;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (typeof value.path === "string" && typeof value.get === "function") {
    return value.path;
  }
  if (Array.isArray(value)) return value.map(serialize);
  return Object.fromEntries(
    Object.entries(value).map(([key, val]) => [key, serialize(val)]),
  );
}

async function findManagedTarget(uid) {
  for (const target of TARGETS) {
    const snap = await db
      .collection(target.collection)
      .where("managerUid", "==", uid)
      .limit(1)
      .get();

    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { ...target, id: docSnap.id, data: docSnap.data() };
    }
  }
  return null;
}

// Reviews and endorsements can be linked to a place two ways: they carry a
// placeId/activityId field, or the place lists them in reviewIds /
// endorsementIds. Load both and merge so nothing is missed.
async function loadFeedback(collectionName, field, targetId, listedIds) {
  const found = new Map();

  const snap = await db
    .collection(collectionName)
    .where(field, "==", targetId)
    .get();
  snap.docs.forEach((d) => found.set(d.id, { id: d.id, ...d.data() }));

  const refs = (Array.isArray(listedIds) ? listedIds : [])
    .map((item) => {
      if (typeof item !== "string") return item;
      return item.includes("/")
        ? db.doc(item)
        : db.collection(collectionName).doc(item);
    })
    .filter(
      (ref) => ref && typeof ref.get === "function" && !found.has(ref.id),
    );

  if (refs.length > 0) {
    const docs = await db.getAll(...refs);
    docs.forEach((d) => {
      if (d.exists) found.set(d.id, { id: d.id, ...d.data() });
    });
  }

  return [...found.values()];
}

// Everything the dashboard needs in one call.
async function getManagedBusiness(uid) {
  const target = await findManagedTarget(uid);
  if (!target) return null;

  const [reviews, endorsements] = await Promise.all([
    loadFeedback(
      "reviews",
      target.feedbackField,
      target.id,
      target.data.reviewIds,
    ),
    loadFeedback(
      "endorsements",
      target.feedbackField,
      target.id,
      target.data.endorsementIds,
    ),
  ]);

  return serialize({
    ...target.data,
    id: target.id,
    type: target.type,
    reviews,
    endorsements,
  });
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : null;
}

// Only these fields can be changed from the dashboard. Ratings, review lists
// and managerUid are deliberately NOT editable here.
async function updateManagedBusiness(uid, input) {
  const target = await findManagedTarget(uid);
  if (!target) return null;

  const updates = {};

  const name = cleanText(input.name, 120);
  if (name !== null) {
    if (!name) throw new Error("Name can't be empty");
    updates.name = name;
  }

  const description = cleanText(input.description, 2000);
  if (description !== null) updates.description = description;

  const image = cleanText(input.image, 1000);
  if (image !== null) {
    if (image && !/^https?:\/\//i.test(image)) {
      throw new Error(
        "Image must be a web link starting with http:// or https://",
      );
    }
    updates.image = image;
  }

  const city = cleanText(input.city, 80);
  if (city !== null) updates["location.city"] = city;

  const region = cleanText(input.region, 80);
  if (region !== null) updates["location.region"] = region;

  if (Object.keys(updates).length > 0) {
    await db.collection(target.collection).doc(target.id).update(updates);
  }

  return getManagedBusiness(uid);
}

module.exports = { getManagedBusiness, updateManagedBusiness };
