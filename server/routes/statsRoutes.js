const express = require("express");
const { getStats } = require("../services/statsService.js");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const stats = await getStats();
    res.status(200).send(stats);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
