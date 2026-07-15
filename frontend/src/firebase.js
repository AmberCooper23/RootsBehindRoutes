import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAUg96hbTN44vrI3XXFtZckOk4mhPAZilY",
  authDomain: "rootsbehindroutes.firebaseapp.com",
  projectId: "rootsbehindroutes",
  storageBucket: "rootsbehindroutes.appspot.com",
  messagingSenderId: "606547648299",
  appId: "1:606547648299:web:7d018c9386771b5a772f6e",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
