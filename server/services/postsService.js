const { db, admin } = require("../firebaseConfig.js");

async function createPost(data) {
  const docRef = await db.collection("posts").add(data);

  if (data.placeId) {
    await db
      .collection("places")
      .doc(data.placeId)
      .update({
        postIds: admin.firestore.FieldValue.arrayUnion(docRef.id),
      });
  } else if (data.activityId) {
    await db
      .collection("activities")
      .doc(data.activityId)
      .update({
        postIds: admin.firestore.FieldValue.arrayUnion(docRef.id),
      });
  }

  return { id: docRef.id, ...data };
}

async function getPost(id) {
  const snap = await db.collection("posts").doc(id).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function getAllPosts() {
  const snapshot = await db.collection("posts").get();
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

module.exports = {
  createPost,
  getPost,
  getAllPosts,
};
