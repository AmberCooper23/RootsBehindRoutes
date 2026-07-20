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

export async function createComment(data) {
  const commentsRef = collection(db, "comments");
  const docRef = await addDoc(commentsRef, data);

  // Schema: posts.commentIds is the reverse side of comments.postId.
  if (data.postId) {
    await updateDoc(doc(db, "posts", data.postId), {
      commentIds: arrayUnion(docRef.id),
    });
  }

  return docRef.id;
}

export async function getComment(id) {
  const commentRef = doc(db, "comments", id);
  const snap = await getDoc(commentRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getAllComments() {
  const commentsRef = collection(db, "comments");
  const snap = await getDocs(commentsRef);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
