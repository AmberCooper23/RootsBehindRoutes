import express from "express";
import cors from "cors";
import admin from "firebase-admin";

import usersRoutes from "./routes/usersRoutes.js";
import postsRoutes from "./routes/postsRoutes.js";
import placesRoutes from "./routes/placesRoutes.js";
import activitiesRoutes from "./routes/activitiesRoutes.js";
import commentsRoutes from "./routes/commentsRoutes.js";
import reviewsRoutes from "./routes/reviewsRoutes.js";
import endorsementsRoutes from "./routes/endorsementsRoutes.js";
import interestsRoutes from "./routes/interestsRoutes.js";

const app = express();
app.use(express.json());

const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

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

app.use("/api/users", usersRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/endorsements", endorsementsRoutes);
app.use("/api/interests", interestsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
