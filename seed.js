import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUg96hbTN44vrI3XXFtZckOk4mhPAZilY",
  authDomain: "rootsbehindroutes.firebaseapp.com",
  projectId: "rootsbehindroutes",
  storageBucket: "rootsbehindroutes.appspot.com",
  messagingSenderId: "606547648299",
  appId: "1:606547648299:web:7d018c9386771b5a772f6e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  await setDoc(doc(db, "interests", "museum"), {
    name: "Museum",
    description: "Cultural and historical exhibitions",
  });

  await setDoc(doc(db, "interests", "market"), {
    name: "Market",
    description: "Local shopping and food stalls",
  });

  await setDoc(doc(db, "places", "place002"), {
    name: "Origins Centre Museum",
    description: "Museum showcasing human origins and cultural heritage",
    location: { city: "Braamfontein", region: "JHB" },
    categories: ["museum"],
    localRating: 8.5,
    touristRating: 4.6,
    createdAt: new Date(),
  });

  await setDoc(doc(db, "places", "place003"), {
    name: "Neighbourgoods Market",
    description: "Popular weekend market with food and crafts",
    location: { city: "Braamfontein", region: "JHB" },
    categories: ["market"],
    localRating: 9.2,
    touristRating: 4.8,
    createdAt: new Date(),
  });

  console.log("✅ Seeding complete!");
}

seed();
