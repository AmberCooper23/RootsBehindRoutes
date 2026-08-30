import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { firebaseConfig } from "../firebaseConfig";

const app = initializeApp(firebaseConfig);
console.log("Firebase config at runtime:", firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
