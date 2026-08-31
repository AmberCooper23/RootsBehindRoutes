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

async function createPost(data) {
  const postsRef = collection(db, "posts");
  const docRef = await addDoc(postsRef, data);

  if (data.placeId) {
    await updateDoc(doc(db, "places", data.placeId), {
      postIds: arrayUnion(docRef.id),
    });
  } else if (data.activityId) {
    await updateDoc(doc(db, "activities", data.activityId), {
      postIds: arrayUnion(docRef.id),
    });
  }

  return { id: docRef.id, ...data };
}

async function getPost(id) {
  const postRef = doc(db, "posts", id);
  const snap = await getDoc(postRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

async function getAllPosts() {
  const postsRef = collection(db, "posts");
  const snap = await getDocs(postsRef);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

module.exports = {
  createPost,
  getPost,
  getAllPosts,
};
