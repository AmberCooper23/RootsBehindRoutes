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

// ✅ Normalize PRIVATE_KEY whether it has literal "\n" or real newlines
const formatKey = (key) => {
  if (!key) return undefined;
  // If it contains literal "\n", replace with real newlines
  if (key.includes("\\n")) {
    return key.replace(/\\n/g, "\n");
  }
  // Otherwise return as-is (already has real newlines)
  return key;
};

// ✅ Build service account object from env vars
const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: formatKey(process.env.PRIVATE_KEY),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

// ✅ Debug log to confirm env injection
console.log("ServiceAccount debug:", {
  TYPE: serviceAccount.type,
  PROJECT_ID: serviceAccount.project_id,
  CLIENT_EMAIL: serviceAccount.client_email,
  PRIVATE_KEY: serviceAccount.private_key ? "exists" : "missing",
});

// ✅ Extra preview of first 100 chars of key
if (serviceAccount.private_key) {
  console.log("PRIVATE_KEY preview:", serviceAccount.private_key.slice(0, 100));
}

// ✅ Initialize Firebase Admin only if PRIVATE_KEY exists
if (serviceAccount.private_key && serviceAccount.client_email) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin initialized ✅");
} else {
  console.error("❌ Firebase Admin not initialized. Missing env vars.");
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
  res.json({
    status: "ok",
    firebase: !!serviceAccount.private_key,
    keyPreview: serviceAccount.private_key
      ? serviceAccount.private_key.slice(0, 50)
      : "missing",
  });
});

// ✅ Render requires process.env.PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
