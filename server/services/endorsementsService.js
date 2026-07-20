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

export async function createEndorsement(data) {
  const endorsementsRef = collection(db, "endorsements");
  const docRef = await addDoc(endorsementsRef, data);

  // Schema: places.endorsementIds is the reverse side of endorsements.placeId.
  if (data.placeId) {
    await updateDoc(doc(db, "places", data.placeId), {
      endorsementIds: arrayUnion(docRef.id),
    });
  }

  return docRef.id;
}

export async function getEndorsement(id) {
  const endorsementRef = doc(db, "endorsements", id);
  const snap = await getDoc(endorsementRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getAllEndorsements() {
  const endorsementsRef = collection(db, "endorsements");
  const snap = await getDocs(endorsementsRef);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
