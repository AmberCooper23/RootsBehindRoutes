import express from "express";
import cors from "cors";
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

// ✅ Add CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173", // allow your frontend
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

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
