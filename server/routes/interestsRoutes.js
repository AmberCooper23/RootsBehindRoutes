import express from "express";
import {
  createInterest,
  getInterest,
  getAllInterests,
} from "../services/interestsService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { id, data } = req.body;
    await createInterest(id, data);
    res.status(201).send({ message: "Interest created", id });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const interest = await getInterest(req.params.id);
    if (interest) res.send(interest);
    else res.status(404).send({ error: "Interest not found" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const interests = await getAllInterests();
    res.send(interests);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

export default router;
