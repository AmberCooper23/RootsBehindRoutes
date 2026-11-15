const express = require("express");
const {
  createPlace,
  getPlace,
  getAllPlaces,
  getPlacesByManager,
  updatePlace,
  deletePlace,
} = require("../services/placesService.js");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const place = await createPlace(req.body);
    res.status(201).send(place);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/manager/:uid", async (req, res) => {
  try {
    const places = await getPlacesByManager(req.params.uid);
    res.send(places);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const place = await getPlace(req.params.id);
    if (place) {
      res.send(place);
    } else {
      res.status(404).send({ error: "Place not found" });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const places = await getAllPlaces();
    res.send(places);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const place = await updatePlace(req.params.id, req.body);
    res.send(place);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await deletePlace(req.params.id);
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;