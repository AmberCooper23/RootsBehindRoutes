import { db } from "../firestore.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

export async function createPost(data) {
  const postsRef = collection(db, "posts");
  const docRef = await addDoc(postsRef, data);

  // Schema: a post belongs to either a place OR an activity, never both.
  // Keep the parent doc's postIds array in sync.
  if (data.placeId) {
    await updateDoc(doc(db, "places", data.placeId), {
      postIds: arrayUnion(docRef.id),
    });
  } else if (data.activityId) {
    await updateDoc(doc(db, "activities", data.activityId), {
      postIds: arrayUnion(docRef.id),
    });
  }

  return docRef.id;
}

export async function getPost(id) {
  const postRef = doc(db, "posts", id);
  const snap = await getDoc(postRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getAllPosts() {
  const postsRef = collection(db, "posts");
  const snap = await getDocs(postsRef);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
