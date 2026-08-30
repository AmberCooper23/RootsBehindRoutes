const express = require("express");
const {
  createUser,
  getUser,
  addUserInterest,
  removeUserInterest,
  addUserActivity,
  removeUserActivity,
  addUserPlace,
  removeUserPlace,
} = require("../services/usersService.js");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { uid, data } = req.body;
    await createUser(uid, data);
    res.status(201).send({ message: "User created", uid });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/:uid", async (req, res) => {
  try {
    const user = await getUser(req.params.uid);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.post("/:uid/interests", async (req, res) => {
  try {
    const { interestId } = req.body;
    await addUserInterest(req.params.uid, interestId);
    res.status(200).send({ message: "Interest added", interestId });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.delete("/:uid/interests/:interestId", async (req, res) => {
  try {
    await removeUserInterest(req.params.uid, req.params.interestId);
    res.status(200).send({
      message: "Interest removed",
      interestId: req.params.interestId,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.post("/:uid/activities", async (req, res) => {
  try {
    const { activityId } = req.body;
    await addUserActivity(req.params.uid, activityId);
    res.status(200).send({ message: "Activity added", activityId });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.delete("/:uid/activities/:activityId", async (req, res) => {
  try {
    await removeUserActivity(req.params.uid, req.params.activityId);
    res.status(200).send({
      message: "Activity removed",
      activityId: req.params.activityId,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.post("/:uid/places", async (req, res) => {
  try {
    const { placeId } = req.body;
    await addUserPlace(req.params.uid, placeId);
    res.status(200).send({ message: "Place added", placeId });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.delete("/:uid/places/:placeId", async (req, res) => {
  try {
    await removeUserPlace(req.params.uid, req.params.placeId);
    res.status(200).send({
      message: "Place removed",
      placeId: req.params.placeId,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// ✅ CommonJS export
module.exports = router;
