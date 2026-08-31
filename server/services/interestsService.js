const { db } = require("../firestore.js");
const {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
} = require("firebase/firestore");

async function createInterest(id, data) {
  const interestRef = doc(db, "interests", id);
  await setDoc(interestRef, data, { merge: true });
  return { id, ...data };
}

async function getInterest(id) {
  const interestRef = doc(db, "interests", id);
  const snap = await getDoc(interestRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

async function getAllInterests() {
  const interestsRef = collection(db, "interests");
  const snap = await getDocs(interestsRef);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

module.exports = {
  createInterest,
  getInterest,
  getAllInterests,
};
