import { db } from "../firestore.js";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

export async function createInterest(id, data) {
  const interestRef = doc(db, "interests", id);
  await setDoc(interestRef, data, { merge: true });
  return id;
}

export async function getInterest(id) {
  const interestRef = doc(db, "interests", id);
  const snap = await getDoc(interestRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getAllInterests() {
  const interestsRef = collection(db, "interests");
  const snap = await getDocs(interestsRef);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
