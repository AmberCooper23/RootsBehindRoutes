const { db, admin } = require("../firebaseConfig.js");

async function createComment(data) {
  const docRef = await db.collection("comments").add(data);

  if (data.postId) {
    await db
      .collection("posts")
      .doc(data.postId)
      .update({
        commentIds: admin.firestore.FieldValue.arrayUnion(docRef.id),
      });
  }

  return { id: docRef.id, ...data };
}

async function getComment(id) {
  const snap = await db.collection("comments").doc(id).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function getAllComments() {
  const snapshot = await db.collection("comments").get();
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

module.exports = {
  createComment,
  getComment,
  getAllComments,
};
