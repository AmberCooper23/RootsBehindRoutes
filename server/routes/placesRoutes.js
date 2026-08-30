const express = require("express");
const {
  createPlace,
  getPlace,
  getAllPlaces,
} = require("../services/placesService.js");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const id = await createPlace(req.body);
    res.status(201).send({ message: "Place created", id });
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

// ✅ CommonJS export
module.exports = router;
