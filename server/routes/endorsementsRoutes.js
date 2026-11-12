const express = require("express");
const {
  createEndorsement,
  getEndorsement,
  getAllEndorsements,
  addReplyToEndorsement,
} = require("../services/endorsementsService.js");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const endorsement = await createEndorsement(req.body);
    res.status(201).send(endorsement); // Send full object
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Route to add a reply to a specific endorsement
router.post("/:id/replies", async (req, res) => {
  try {
    const reply = await addReplyToEndorsement(req.params.id, req.body);
    res.status(201).send(reply);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const endorsement = await getEndorsement(req.params.id);
    if (endorsement) {
      res.send(endorsement);
    } else {
      res.status(404).send({ error: "Endorsement not found" });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const endorsements = await getAllEndorsements();
    res.send(endorsements);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
