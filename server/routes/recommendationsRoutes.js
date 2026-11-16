const express = require("express");
const {
  createRecommendation,
  getRecommendations,
  updateRecommendationStatus,
} = require("../services/recommendationsService.js");
const { requireAdmin } = require("../middleware/auth.js");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const rec = await createRecommendation(req.body);
    res.status(201).send(rec);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    res.send(await getRecommendations());
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.put("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    res.send(await updateRecommendationStatus(req.params.id, status));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
