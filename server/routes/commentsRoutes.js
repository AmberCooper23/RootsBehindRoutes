const express = require("express");
const {
  createComment,
  getComment,
  getAllComments,
} = require("../services/commentsService.js");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const id = await createComment(req.body);
    res.status(201).send({ message: "Comment created", id });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const comment = await getComment(req.params.id);
    if (comment) {
      res.send(comment);
    } else {
      res.status(404).send({ error: "Comment not found" });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const comments = await getAllComments();
    res.send(comments);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// ✅ CommonJS export
module.exports = router;
