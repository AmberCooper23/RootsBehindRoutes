import express from "express";
import {
  createActivity,
  getActivity,
  getAllActivities,
} from "../services/activitiesService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const id = await createActivity(req.body);
    res.status(201).send({ message: "Activity created", id });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const activity = await getActivity(req.params.id);
    if (activity) res.send(activity);
    else res.status(404).send({ error: "Activity not found" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const activities = await getAllActivities();
    res.send(activities);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
