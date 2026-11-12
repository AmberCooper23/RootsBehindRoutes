const express = require("express");
const {
  createReview,
  getReview,
  getAllReviews,
} = require("../services/reviewsService.js");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const review = await createReview(req.body);
    res.status(201).send(review);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const review = await getReview(req.params.id);
    if (review) {
      res.send(review);
    } else {
      res.status(404).send({ error: "Review not found" });
    }
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

module.exports = router;
