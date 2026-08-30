import express from "express";
import cors from "cors";

// Import your route modules
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

// ✅ CORS middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local dev
      "https://rootsbehindroutes.web.app", // your Firebase Hosting frontend
      "https://rootsbehindroutes-server.onrender.com", // your Render backend
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

// ✅ Render requires process.env.PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
