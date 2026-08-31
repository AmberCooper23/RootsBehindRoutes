const { db } = require("../firestore.js");
const {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} = require("firebase/firestore");

async function createComment(data) {
  const commentsRef = collection(db, "comments");
  const docRef = await addDoc(commentsRef, data);

  if (data.postId) {
    await updateDoc(doc(db, "posts", data.postId), {
      commentIds: arrayUnion(docRef.id),
    });
  }

  return { id: docRef.id, ...data };
}

async function getComment(id) {
  const commentRef = doc(db, "comments", id);
  const snap = await getDoc(commentRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

async function getAllComments() {
  const commentsRef = collection(db, "comments");
  const snap = await getDocs(commentsRef);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

module.exports = {
  createComment,
  getComment,
  getAllComments,
};
