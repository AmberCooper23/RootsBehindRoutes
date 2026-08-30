const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const usersRoutes = require("./routes/usersRoutes.js");
const postsRoutes = require("./routes/postsRoutes.js");
const placesRoutes = require("./routes/placesRoutes.js");
const activitiesRoutes = require("./routes/activitiesRoutes.js");
const commentsRoutes = require("./routes/commentsRoutes.js");
const reviewsRoutes = require("./routes/reviewsRoutes.js");
const endorsementsRoutes = require("./routes/endorsementsRoutes.js");
const interestsRoutes = require("./routes/interestsRoutes.js");

const app = express();
app.use(express.json());

// ✅ Load service account JSON directly from secret file
const serviceAccount = require("/etc/secrets/serviceAccountKey.json");

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin initialized ✅");
} catch (err) {
  console.error("❌ Firebase Admin failed to initialize:", err.message);
}

const db = admin.firestore();

// ✅ CORS middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://rootsbehindroutes.web.app",
      "https://rootsbehindroutes-server.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// ✅ Mount routes
app.use("/api/users", usersRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/endorsements", endorsementsRoutes);
app.use("/api/interests", interestsRoutes);

// ✅ Healthcheck route
app.get("/api/healthcheck", (req, res) => {
  res.json({ status: "ok", firebase: true });
});

// ✅ Render requires process.env.PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
