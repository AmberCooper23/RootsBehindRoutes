import express from "express";
import {
  createEndorsement,
  getEndorsement,
  getAllEndorsements,
} from "../services/endorsementsService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const id = await createEndorsement(req.body);
    res.status(201).send({ message: "Endorsement created", id });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const endorsement = await getEndorsement(req.params.id);
    if (endorsement) res.send(endorsement);
    else res.status(404).send({ error: "Endorsement not found" });
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
