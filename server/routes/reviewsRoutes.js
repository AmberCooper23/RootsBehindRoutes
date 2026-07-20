import express from "express";
import {
  createReview,
  getReview,
  getAllReviews,
} from "../services/reviewsService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const id = await createReview(req.body);
    res.status(201).send({ message: "Review created", id });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const review = await getReview(req.params.id);
    if (review) res.send(review);
    else res.status(404).send({ error: "Review not found" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const reviews = await getAllReviews();
    res.send(reviews);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

export default router;
