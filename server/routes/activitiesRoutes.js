const express = require("express");
const {
  createActivity,
  getActivity,
  getAllActivities,
  getActivitiesByManager,
  updateActivity,
  deleteActivity,
} = require("../services/activitiesService.js");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const activity = await createActivity(req.body);
    res.status(201).send(activity);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/manager/:uid", async (req, res) => {
  try {
    const activities = await getActivitiesByManager(req.params.uid);
    res.send(activities);
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

router.put("/:id", async (req, res) => {
  try {
    const activity = await updateActivity(req.params.id, req.body);
    res.send(activity);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await deleteActivity(req.params.id);
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
